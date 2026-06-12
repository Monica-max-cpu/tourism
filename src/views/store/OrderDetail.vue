<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  AlertCircle, CheckCircle2, CreditCard,
  MapPin, Package, Receipt, ShoppingCart, Truck,
} from 'lucide-vue-next';
import {
  Badge, Button, Input,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { getStoreOrderApi, cancelStoreOrderApi } from '/@/api/store/order';
import { getPaymentByOrderApi, submitPaymentApi } from '/@/api/store/payment';
import { getStoreCreditAccountApi } from '/@/api/store/credit';
import {
  STORE_ORDER_STATUS_LABEL,
  STORE_ORDER_STATUS_VARIANT,
  STORE_PAYMENT_METHOD_LABEL,
} from '/@/constants/storeStatus';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { StoreCreditAccount, StorePaymentMethod, StorePaymentRecord, StoreViewOrder } from '/#/b2b-store';

const route = useRoute();
const orderId = computed(() => route.params.id as string);

const order = ref<StoreViewOrder | null>(null);
const payment = ref<StorePaymentRecord | null>(null);
const loading = ref(false);
const creditLoading = ref(false);
const creditAccount = ref<StoreCreditAccount | null>(null);
const selectedMethod = ref<StorePaymentMethod | ''>('');
const polling = ref(false);
const waitingPaymentResult = ref(false);
let pollingTimer: ReturnType<typeof setTimeout> | null = null;
let pollingCount = 0;
const MAX_POLL_COUNT = 20;
const POLL_INTERVAL = 3000;

function parseAddress(value: any) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const address = computed(() => parseAddress(order.value?.deliveryAddress));
const orderCreateTime = computed(() => order.value?.createTime || String(route.query.createTime || ''));
const paidTime = computed(() => payment.value?.confirmedAt || order.value?.paymentTime || '');
const shippedTime = computed(() => order.value?.deliveries?.find((it) => it.shippedTime)?.shippedTime || '');
const primaryDelivery = computed(() => order.value?.deliveries?.find((it) => it.shippedTime) || order.value?.deliveries?.[0] || null);

type LogisticsStepState = 'done' | 'current' | 'pending';

interface LogisticsStep {
  title: string;
  description: string;
  time?: string;
  state: LogisticsStepState;
}

function stepTime(...values: Array<string | undefined | null>) {
  return values.find((value) => !!value) || '';
}

const logisticsSteps = computed<LogisticsStep[]>(() => {
  if (!order.value) return [];
  const status = order.value.orderStatus;
  if (status === 6) {
    return [
      {
        title: '已下单',
        description: '订单已取消，流程终止',
        time: orderCreateTime.value,
        state: 'done',
      },
    ];
  }

  const rawStatus = Number(status || 0);
  if (rawStatus <= 0) return [];
  const visibleStage = rawStatus >= 3 ? 3 : Math.max(0, rawStatus - 1);
  const activeIndex = rawStatus >= 4 ? -1 : visibleStage;
  const allSteps: LogisticsStep[] = [
    {
      title: '已下单',
      description: '支付成功，采购订单已提交',
      time: paidTime.value || (order.value as any).paymentTime || orderCreateTime.value,
      state: activeIndex === 0 ? 'current' : 'done',
    },
    {
      title: '仓库已接单',
      description: '平台已发起集采，仓库开始接单处理',
      time: stepTime(paidTime.value, (order.value as any).paymentTime),
      state: activeIndex === 1 ? 'current' : 'done',
    },
    {
      title: '仓库处理中',
      description: '供应商已接单，仓库正在备货、分拣与打包',
      time: stepTime((order.value as any).updateTime, paidTime.value),
      state: activeIndex === 2 ? 'current' : 'done',
    },
    {
      title: '已发货',
      description: primaryDelivery.value?.logisticsCompany || primaryDelivery.value?.trackingNo
        ? `${primaryDelivery.value?.logisticsCompany || '物流'} ${primaryDelivery.value?.trackingNo || ''}`.trim()
        : '商品已交由物流配送',
      time: shippedTime.value,
      state: activeIndex === 3 ? 'current' : 'done',
    },
  ];

  return allSteps.slice(0, visibleStage + 1).map((item, index) => ({
    ...item,
    state: index === activeIndex ? 'current' : 'done',
  }));
});

function logisticsDotClass(state: LogisticsStepState) {
  if (state === 'done') return 'bg-primary text-white border-primary';
  if (state === 'current') return 'bg-primary/5 text-primary border-[#b8c9e6]';
  return 'bg-white text-muted-foreground border-[#d9e0e8]';
}

function logisticsTextClass(state: LogisticsStepState) {
  if (state === 'done' || state === 'current') return 'text-primary';
  return 'text-muted-foreground';
}

async function loadAll() {
  loading.value = true;
  try {
    const data = await getStoreOrderApi(orderId.value);
    order.value = data;
    selectedMethod.value = (data?.paymentMethod as StorePaymentMethod) || '';
    if (data?.orderNo) {
      try {
        payment.value = await getPaymentByOrderApi(data.orderNo);
        if (payment.value?.method) {
          selectedMethod.value = payment.value.method;
        }
      } catch {
        payment.value = null;
      }
    }
    await loadCreditAccount();
    syncPollingState();
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
watch(orderId, () => {
  stopPolling();
  loadAll();
});
onBeforeUnmount(stopPolling);

const method = computed<StorePaymentMethod>(() => (selectedMethod.value || 'UNIONPAY') as StorePaymentMethod);
const submitting = ref(false);
const payModal = useModal();
const creditEnabled = computed(() => creditAccount.value?.creditStatus === 2 && !!creditAccount.value.creditAccountId);
const creditEnough = computed(() => Number(creditAccount.value?.availableCreditAmount || 0) >= Number(order.value?.totalAmount || 0));
const canUseCredit = computed(() => creditEnabled.value && creditEnough.value);
const canSubmit = computed(() => method.value === 'UNIONPAY' || canUseCredit.value);
const orderStatus = computed(() => Number(order.value?.orderStatus ?? -1));
const paymentStatus = computed(() => (payment.value?.status == null ? undefined : Number(payment.value.status)));
const isWaitPay = computed(() => orderStatus.value === 0);
const isPaid = computed(() => orderStatus.value > 0 && orderStatus.value !== 6 || paymentStatus.value === 1);
const isPaymentFailed = computed(() => isWaitPay.value && paymentStatus.value === 2);
const isPaymentProcessing = computed(() => waitingPaymentResult.value && isWaitPay.value && !isPaid.value && !isPaymentFailed.value);
const showWaitPayActions = computed(() => isWaitPay.value && !isPaid.value);

async function loadCreditAccount() {
  if (!order.value?.storeId) {
    creditAccount.value = null;
    return;
  }
  creditLoading.value = true;
  try {
    creditAccount.value = await getStoreCreditAccountApi(order.value.storeId);
  } catch {
    creditAccount.value = null;
  } finally {
    creditLoading.value = false;
  }
}

function selectPayment(methodValue: StorePaymentMethod) {
  selectedMethod.value = methodValue;
}

function stopPolling() {
  polling.value = false;
  pollingCount = 0;
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }
}

function syncPollingState() {
  if (orderStatus.value === 1 || paymentStatus.value === 1 || paymentStatus.value === 2) {
    waitingPaymentResult.value = false;
    stopPolling();
  }
}

function schedulePoll() {
  if (!polling.value) return;
  if (pollingCount >= MAX_POLL_COUNT) {
    waitingPaymentResult.value = false;
    stopPolling();
    return;
  }
  pollingTimer = setTimeout(async () => {
    pollingCount += 1;
    try {
      await loadAll();
    } catch {
      waitingPaymentResult.value = false;
      stopPolling();
      return;
    }
    if (polling.value) {
      schedulePoll();
    }
  }, POLL_INTERVAL);
}

function startPolling() {
  stopPolling();
  polling.value = true;
  schedulePoll();
}

async function submitPay() {
  if (!order.value || !canSubmit.value) return;
  submitting.value = true;
  waitingPaymentResult.value = true;
  try {
    await submitPaymentApi({
      orderId: order.value.id,
      orderNo: order.value.orderNo,
      amount: order.value.totalAmount,
      method: method.value,
      creditAccountId: method.value === 'BANK_CREDIT' ? creditAccount.value?.creditAccountId : undefined,
    });
    payModal.close();
    startPolling();
    await loadAll();
  } catch (e) {
    waitingPaymentResult.value = false;
    stopPolling();
    throw e;
  } finally {
    submitting.value = false;
  }
}

const cancelModal = useModal();
const cancelReason = ref('');
const cancelSubmitting = ref(false);

function onCancel() {
  cancelReason.value = '';
  cancelModal.open();
}

async function confirmCancel() {
  if (!order.value) return;
  cancelSubmitting.value = true;
  try {
    await cancelStoreOrderApi(order.value.id, cancelReason.value || '门店主动取消');
    cancelModal.close();
    await loadAll();
  } finally {
    cancelSubmitting.value = false;
  }
}
</script>

<template>
  <PageWrapper
    title="订单详情"
    :subtitle="order ? order.orderNo : ''"
    show-back
    :back-to="ROUTE_PATHS.STORE_ORDERS"
  >

    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span class="ml-3 text-sm text-muted-foreground">加载订单信息...</span>
    </div>
    <div v-else-if="!order" class="text-center text-muted-foreground py-24">订单不存在或无访问权限</div>

    <div v-else class="pt-4 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-[16px] overflow-hidden" style="box-shadow: 0 8px 32px hsl(var(--primary) / 0.05);">
            <div class="h-5 bg-primary rounded-t-[16px]" />
            <div class="p-8 space-y-8">
              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-primary/5">
                    <MapPin class="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h4 class="text-lg font-semibold text-primary">收货信息</h4>
                </div>
                <div class="rounded-xl border border-[#edf1f5] bg-[#fafbfc] p-5 text-sm">
                  <template v-if="address">
                    <div class="text-base font-medium text-primary">
                      {{ address.province }}{{ address.city }} {{ address.address }}
                    </div>
                    <div class="text-muted-foreground mt-2">
                      {{ address.recipientName || address.receiverName || '-' }}
                      <span class="ml-3">{{ address.recipientPhone || address.receiverPhone || '-' }}</span>
                    </div>
                  </template>
                  <div v-else class="text-muted-foreground">暂无收货信息</div>
                </div>
              </section>

              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-primary/5">
                    <Package class="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h4 class="text-lg font-semibold text-primary">商品明细</h4>
                </div>
                <div class="rounded-xl border border-[#edf1f5] overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead class="bg-[#f4f8fc] text-muted-foreground">
                        <tr class="text-left">
                          <th class="px-4 py-3 font-medium">商品</th>
                          <th class="px-4 py-3 font-medium text-right">目录价</th>
                          <th class="px-4 py-3 font-medium text-right">成交价</th>
                          <th class="px-4 py-3 font-medium text-right">数量</th>
                          <!-- <th class="px-4 py-3 font-medium text-right">已收货</th> -->
                          <th class="px-4 py-3 font-medium text-right">小计</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="it in order.items || []" :key="it.id || it.catalogId" class="border-t border-border">
                          <td class="px-4 py-3">
                            <div class="font-medium">{{ it.productName }}</div>
                            <!-- <div class="text-xs text-muted-foreground">{{ it.spec || '-' }} / {{ it.unit }}</div> -->
                          </td>
                          <td class="px-4 py-3 text-right">{{ formatCurrency(it.catalogPrice) }}</td>
                          <td class="px-4 py-3 text-right">{{ formatCurrency(it.actualPrice) }}</td>
                          <td class="px-4 py-3 text-right">{{ it.quantity }} {{ it.unit }}</td>
                          <!-- <td class="px-4 py-3 text-right">{{ it.receivedQty ?? 0 }} {{ it.unit }}</td> -->
                          <td class="px-4 py-3 text-right font-semibold text-primary">{{ formatCurrency(it.subtotal) }}</td>
                        </tr>
                        <tr v-if="!order.items?.length">
                          <td colspan="6" class="px-4 py-10 text-center text-muted-foreground">暂无商品明细</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="px-6 py-4 border-t border-border bg-[#fafbfc]">
                    <div v-if="order.remark" class="text-sm mb-3">
                      <span class="text-muted-foreground">备注：</span>{{ order.remark }}
                    </div>
                    <div class="flex justify-end items-baseline gap-2">
                      <span class="text-sm text-muted-foreground">订单合计</span>
                      <span class="text-2xl font-bold text-primary">{{ formatCurrency(order.totalAmount) }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-primary/5">
                    <Truck class="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h4 class="text-lg font-semibold text-primary">物流信息</h4>
                </div>
                <div class="rounded-xl border border-[#edf1f5] bg-[#fafbfc] p-5">
                  <div class="flex items-start justify-between gap-4 pb-5 mb-5 border-b border-[#e8edf3]">
                    <div class="min-w-0">
                      <div class="text-xs text-muted-foreground mb-1">当前状态</div>
                      <Badge :variant="STORE_ORDER_STATUS_VARIANT[order.orderStatus] || 'info'">
                        {{ order.statusLabel || STORE_ORDER_STATUS_LABEL[order.orderStatus] }}
                      </Badge>
                    </div>
                    <div class="text-right text-sm min-w-0">
                      <div class="text-xs text-muted-foreground mb-1">订单号</div>
                      <div class="font-mono text-primary break-all">{{ order.orderNo }}</div>
                    </div>
                  </div>

                  <div class="relative">
                    <div class="absolute left-4 top-4 bottom-4 w-px bg-[#dfe6ee]" />
                    <div
                      v-for="step in logisticsSteps"
                      :key="step.title"
                      class="relative flex gap-4 pb-6 last:pb-0"
                    >
                      <div
                        class="relative z-10 h-8 w-8 shrink-0 rounded-full border flex items-center justify-center"
                        :class="logisticsDotClass(step.state)"
                      >
                        <CheckCircle2 v-if="step.state === 'done'" class="w-4 h-4" />
                        <Truck v-else-if="step.title === '已发货'" class="w-4 h-4" />
                        <Package v-else-if="step.title === '仓库处理中'" class="w-4 h-4" />
                        <Receipt v-else-if="step.title === '仓库已接单'" class="w-4 h-4" />
                        <ShoppingCart v-else class="w-4 h-4" />
                      </div>
                      <div class="min-w-0 flex-1 pt-1">
                        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <div class="text-sm font-semibold" :class="logisticsTextClass(step.state)">
                            {{ step.title }}
                          </div>
                          <div class="text-xs text-muted-foreground">
                            {{ formatDateTime(step.time) || '-' }}
                          </div>
                        </div>
                        <div class="mt-1 text-sm text-muted-foreground">
                          {{ step.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div class="space-y-5 lg:sticky lg:top-20 h-fit">
          <div class="bg-primary text-white rounded-2xl p-6 overflow-hidden relative">
            <div class="relative z-10">
              <div class="text-sm text-white/70">应付金额</div>
              <div class="text-3xl font-bold mt-1 tabular-nums">{{ formatCurrency(order.totalAmount) }}</div>
              <div class="grid grid-cols-2 gap-3 mt-5 text-sm">
                <div>
                  <div class="text-white/55">已付金额</div>
                  <div class="font-semibold">{{ formatCurrency(order.paidAmount) }}</div>
                </div>
                <div>
                  <div class="text-white/55">商品数</div>
                  <div class="font-semibold">{{ order.itemCount ?? order.items?.length ?? 0 }}</div>
                </div>
              </div>

            <div v-if="isPaid" class="mt-5">
              <Badge variant="success" class="w-full justify-center py-2 text-sm">支付成功</Badge>
            </div>
            <div v-else-if="showWaitPayActions && !isPaymentFailed" class="mt-5 space-y-2">
              <Button class="w-full bg-white/20 hover:bg-white/30" @click="payModal.open()">
                <CreditCard class="w-4 h-4 mr-1.5" />立即支付
              </Button>
              <Button variant="destructive" class="w-full border-0" @click="onCancel">取消订单</Button>
            </div>
            <div v-else-if="showWaitPayActions && isPaymentFailed" class="mt-5 space-y-2">
              <div class="flex items-center gap-1.5 text-sm text-destructive mb-2">
                <AlertCircle class="w-4 h-4" />
                支付失败
              </div>
              <Button class="w-full" @click="payModal.open()">重新支付</Button>
              <Button variant="destructive" class="w-full border-0" @click="onCancel">取消订单</Button>
            </div>
            <div v-else-if="order.orderStatus === 5" class="mt-5">
              <Badge variant="success" class="w-full justify-center py-2 text-sm">订单已完成</Badge>
            </div>
            <div v-else-if="order.orderStatus === 6" class="mt-5">
              <Badge variant="muted" class="w-full justify-center py-2 text-sm">订单已取消</Badge>
            </div>
            <div v-else class="mt-5">
              <Badge variant="secondary" class="w-full justify-center py-2 text-sm">订单进行中</Badge>
            </div>
            </div>
            <ShoppingCart class="absolute -bottom-5 -right-5 w-28 h-28 text-white/10" />
          </div>

          <div v-if="payment" class="bg-white border border-[#edf1f5] rounded-2xl p-5 space-y-2">
            <div class="flex items-center justify-between">
              <div class="font-bold text-primary flex items-center gap-2">
                <Receipt class="w-3.5 h-3.5" />付款记录
              </div>
            </div>
            <div class="text-xs text-muted-foreground">{{ payment.paymentNo }}</div>
            <div class="text-xs">支付方式：{{ STORE_PAYMENT_METHOD_LABEL[payment.method] || '未选择支付方式' }}</div>
            <div class="text-xs text-muted-foreground">创建时间：{{ formatDateTime(payment.submittedAt) }}</div>
            <div v-if="payment.transactionNo" class="text-xs">
              流水号：<span class="font-mono">{{ payment.transactionNo }}</span>
            </div>
            <div v-if="payment.status === 2 && payment.rejectReason" class="text-xs text-destructive bg-destructive/5 rounded-lg p-2.5">
              驳回原因：{{ payment.rejectReason }}
            </div>
          </div>
      </div>
    </div>
      <div v-if="isPaymentProcessing" class="payment-processing-mask">
        <div class="payment-processing-panel">
          <div class="payment-processing-spinner" />
          <div class="text-base font-semibold text-primary">支付处理中</div>
          <div class="text-sm text-muted-foreground">正在等待渠道确认，请勿重复提交支付</div>
        </div>
      </div>
    </div>

    <BasicModal
      v-model:open="payModal.visible.value"
      title="确认支付"
      description="发起支付后将等待渠道回调确认；支付成功后页面会自动更新，失败时可重新选择支付方式。"
      :confirm-loading="submitting"
      :confirm-disabled="!canSubmit"
      width="640px"
      confirm-text="确认支付"
      @confirm="submitPay"
    >
      <div class="space-y-3">
        <button
          type="button"
          class="payment-card"
          :class="{ active: method === 'UNIONPAY' }"
          @click="selectPayment('UNIONPAY')"
        >
          <span class="payment-icon bg-sky-100 text-sky-700">
            <CreditCard class="w-4 h-4" />
          </span>
          <span class="flex-1 text-left">
            <span class="block text-sm font-medium">在线支付</span>
            <span class="block text-xs text-muted-foreground">支付成功后订单立即更新为已支付</span>
          </span>
          <span class="radio-dot"></span>
        </button>

        <button
          type="button"
          class="payment-card"
          :class="{ active: method === 'BANK_CREDIT' }"
          @click="selectPayment('BANK_CREDIT')"
        >
          <span class="payment-icon bg-emerald-100 text-emerald-700">
            <Receipt class="w-4 h-4" />
          </span>
          <span class="flex-1 text-left">
            <span class="block text-sm font-medium">授信支付</span>
            <span v-if="creditLoading" class="block text-xs text-muted-foreground">授信额度加载中...</span>
            <span v-else-if="creditEnabled" class="block text-xs text-muted-foreground">
              可用额度 {{ formatCurrency(creditAccount?.availableCreditAmount || 0) }}
            </span>
            <span v-else class="block text-xs text-muted-foreground">授信未启用，请先申请授信账户</span>
          </span>
          <span class="radio-dot"></span>
        </button>

        <div v-if="method === 'BANK_CREDIT' && !creditEnabled" class="text-xs text-destructive">
          当前门店暂无可用授信账户，不能使用授信支付。
        </div>
        <div v-else-if="method === 'BANK_CREDIT' && !creditEnough" class="text-xs text-destructive">
          可用额度不足，当前订单还差 {{ formatCurrency(Number(order?.totalAmount || 0) - Number(creditAccount?.availableCreditAmount || 0)) }}。
        </div>
      </div>

      <div class="rounded-lg border border-border bg-muted/40 p-4 text-sm mt-3">
        <div class="flex items-center justify-between gap-4">
          <span class="text-muted-foreground">支付方式</span>
          <span class="font-medium">{{ selectedMethod ? STORE_PAYMENT_METHOD_LABEL[method] : '未选择支付方式' }}</span>
        </div>
        <div class="flex items-center justify-between gap-4 mt-2">
          <span class="text-muted-foreground">支付金额</span>
          <span class="text-lg font-semibold">{{ formatCurrency(order?.totalAmount) }}</span>
        </div>
      </div>
    </BasicModal>

    <BasicModal
      v-model:open="cancelModal.visible.value"
      title="确认取消订单"
      description="取消后不可恢复，请填写取消原因"
      confirm-text="确认取消"
      confirm-variant="destructive"
      :confirm-loading="cancelSubmitting"
      @confirm="confirmCancel"
    >
      <div class="space-y-2">
        <Label>取消原因</Label>
        <Input v-model="cancelReason" placeholder="请输入取消原因" />
      </div>
    </BasicModal>
  </PageWrapper>
</template>

<style scoped>
.payment-card {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: hsl(var(--card));
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.payment-card:hover,
.payment-card.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.04);
  box-shadow: 0 8px 24px rgb(15 118 110 / 8%);
}

.payment-icon {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.radio-dot {
  width: 0.875rem;
  height: 0.875rem;
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
}

.payment-card.active .radio-dot {
  border: 4px solid hsl(var(--primary));
}

.payment-processing-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(15 23 42 / 38%);
  backdrop-filter: blur(2px);
}

.payment-processing-panel {
  display: flex;
  min-width: 18rem;
  max-width: calc(100vw - 2rem);
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  background: hsl(var(--card));
  padding: 1.5rem;
  box-shadow: 0 18px 48px rgb(15 23 42 / 18%);
}

.payment-processing-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid hsl(var(--primary) / 0.18);
  border-top-color: hsl(var(--primary));
  border-radius: 999px;
  animation: payment-spin 0.8s linear infinite;
}

@keyframes payment-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
