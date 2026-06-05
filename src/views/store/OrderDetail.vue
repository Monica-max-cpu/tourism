<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  AlertCircle, ArrowLeft, CheckCircle2, Clock3, CreditCard,
  MapPin, Package, Receipt, ShoppingCart, Smartphone, Truck, Wallet, XCircle,
} from 'lucide-vue-next';
import {
  Badge, Button, Input, Label,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { getStoreOrderApi, cancelStoreOrderApi } from '/@/api/store/order';
import { getPaymentByOrderApi, submitPaymentApi } from '/@/api/store/payment';
import { uploadImageApi } from '/@/api/common/upload';
import {
  PLATFORM_BANK_INFO,
  STORE_ORDER_STATUS_LABEL,
  STORE_ORDER_STATUS_VARIANT,
  STORE_PAYMENT_METHOD_LABEL,
  STORE_PAYMENT_STATUS_LABEL,
  STORE_PAYMENT_STATUS_VARIANT,
} from '/@/constants/storeStatus';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { StorePaymentMethod, StorePaymentRecord, StoreViewOrder } from '/#/b2b-store';

const route = useRoute();
const router = useRouter();
const orderId = computed(() => route.params.id as string);

const order = ref<StoreViewOrder | null>(null);
const payment = ref<StorePaymentRecord | null>(null);
const loading = ref(false);

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
const receivedTime = computed(() => {
  const delivery = (order.value?.deliveries || []).find((it: any) => it.receivedTime) as any;
  return delivery?.receivedTime || '';
});

type LogisticsStepState = 'done' | 'current' | 'pending' | 'cancelled';

interface LogisticsStep {
  title: string;
  description: string;
  time?: string;
  state: LogisticsStepState;
}

function stepState(done: boolean, current: boolean): LogisticsStepState {
  if (done) return 'done';
  if (current) return 'current';
  return 'pending';
}

const logisticsSteps = computed<LogisticsStep[]>(() => {
  if (!order.value) return [];
  const status = order.value.orderStatus;
  if (status === 6) {
    return [
      {
        title: '已下单',
        description: '采购订单已提交',
        time: orderCreateTime.value,
        state: 'done',
      },
      {
        title: '已取消',
        description: '订单已取消，物流流程终止',
        time: (order.value as any).cancelTime || (order.value as any).updateTime,
        state: 'cancelled',
      },
    ];
  }

  const isReceiving = status === 3 || status === 4;
  const isSigned = status === 5;
  return [
    {
      title: '已下单',
      description: '采购订单已提交',
      time: orderCreateTime.value,
      state: 'done',
    },
    {
      title: '待收货',
      description: isReceiving || isSigned ? '商品已进入履约配送，等待门店收货确认' : '订单完成支付和集采后进入收货阶段',
      time: shippedTime.value || paidTime.value,
      state: stepState(isReceiving || isSigned, status === 1 || status === 2),
    },
    {
      title: '已签收',
      description: isSigned ? '订单已完成签收' : '确认全部收货后完成签收',
      time: receivedTime.value || (order.value as any).completedAt,
      state: stepState(isSigned, isReceiving),
    },
  ];
});

function logisticsDotClass(state: LogisticsStepState) {
  if (state === 'cancelled') return 'bg-red-50 text-red-500 border-red-100';
  if (state === 'done') return 'bg-[#1A2C54] text-white border-[#1A2C54]';
  if (state === 'current') return 'bg-[#EFF6FF] text-[#1A2C54] border-[#b8c9e6]';
  return 'bg-white text-muted-foreground border-[#d9e0e8]';
}

function logisticsTextClass(state: LogisticsStepState) {
  if (state === 'cancelled') return 'text-red-500';
  if (state === 'done' || state === 'current') return 'text-[#1A2C54]';
  return 'text-muted-foreground';
}

async function loadAll() {
  loading.value = true;
  try {
    const data = await getStoreOrderApi(orderId.value);
    order.value = data;
    if (data?.orderNo) {
      try {
        payment.value = await getPaymentByOrderApi(data.orderNo);
      } catch {
        payment.value = null;
      }
    }
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
watch(orderId, loadAll);

const method = ref<StorePaymentMethod>('OFFLINE');
const form = reactive({ voucherUrl: '', transactionNo: '', remark: '' });
const submitting = ref(false);
const payModal = useModal();
const canSubmit = computed(() => method.value === 'OFFLINE' ? !!form.voucherUrl : !!form.transactionNo);

function pickMockVoucher() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const result = await uploadImageApi(file, 'b2b/payment/voucher');
    form.voucherUrl = result.singleUrl || result.urls[0] || '';
  };
  input.click();
}

function goBack() {
  router.push(ROUTE_PATHS.STORE_ORDERS);
}

async function submitPay() {
  if (!order.value || !canSubmit.value) return;
  submitting.value = true;
  try {
    await submitPaymentApi({
      orderId: order.value.id,
      orderNo: order.value.orderNo,
      amount: order.value.totalAmount,
      method: method.value,
      voucherUrl: method.value === 'OFFLINE' ? form.voucherUrl : undefined,
      transactionNo: method.value !== 'OFFLINE' ? form.transactionNo : undefined,
      remark: form.remark,
    });
    payModal.close();
    Object.assign(form, { voucherUrl: '', transactionNo: '', remark: '' });
    await loadAll();
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
    router.replace(ROUTE_PATHS.STORE_ORDERS);
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
  >
    <template #extra>
      <Button variant="outline" class="text-muted-foreground" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        返回采购订单
      </Button>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-[#1A2C54] border-t-transparent" />
      <span class="ml-3 text-sm text-muted-foreground">加载订单信息...</span>
    </div>
    <div v-else-if="!order" class="text-center text-muted-foreground py-24">订单不存在或无访问权限</div>

    <div v-else class="pt-4 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-[16px] overflow-hidden" style="box-shadow: 0 8px 32px rgba(26, 44, 84, 0.05);">
            <div class="h-5 bg-[#1A2C54] rounded-t-[16px]" />
            <div class="p-8 space-y-8">
              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <MapPin class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">收货信息</h4>
                </div>
                <div class="rounded-xl border border-[#edf1f5] bg-[#fafbfc] p-5 text-sm">
                  <template v-if="address">
                    <div class="text-base font-medium text-[#1A2C54]">
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
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <Package class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">商品明细</h4>
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
                          <td class="px-4 py-3 text-right font-semibold text-[#1A2C54]">{{ formatCurrency(it.subtotal) }}</td>
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
                      <span class="text-2xl font-bold text-[#1A2C54]">{{ formatCurrency(order.totalAmount) }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <Truck class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">物流信息</h4>
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
                      <div class="font-mono text-[#1A2C54] break-all">{{ order.orderNo }}</div>
                    </div>
                  </div>

                  <div class="relative">
                    <div class="absolute left-4 top-4 bottom-4 w-px bg-[#dfe6ee]" />
                    <div
                      v-for="(step, index) in logisticsSteps"
                      :key="step.title"
                      class="relative flex gap-4 pb-6 last:pb-0"
                    >
                      <div
                        class="relative z-10 h-8 w-8 shrink-0 rounded-full border flex items-center justify-center"
                        :class="logisticsDotClass(step.state)"
                      >
                        <XCircle v-if="step.state === 'cancelled'" class="w-4 h-4" />
                        <CheckCircle2 v-else-if="step.state === 'done'" class="w-4 h-4" />
                        <Truck v-else-if="step.state === 'current' && index === 1" class="w-4 h-4" />
                        <Clock3 v-else class="w-4 h-4" />
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
          <div class="bg-[#1A2C54] text-white rounded-2xl p-6 overflow-hidden relative">
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

            <div v-if="order.orderStatus === 0 && (!payment || payment.status !== 2)" class="mt-5 space-y-2">
              <Button class="w-full" @click="payModal.open()">
                <CreditCard class="w-4 h-4 mr-1.5" />立即支付
              </Button>
              <Button variant="outline" class="w-full" @click="onCancel">取消订单</Button>
            </div>
            <div v-else-if="order.orderStatus === 0 && payment?.status === 2" class="mt-5 space-y-2">
              <div class="flex items-center gap-1.5 text-sm text-destructive mb-2">
                <AlertCircle class="w-4 h-4" />
                支付凭证被驳回
              </div>
              <Button class="w-full" @click="payModal.open()">重新提交凭证</Button>
              <Button variant="outline" class="w-full" @click="onCancel">取消订单</Button>
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
              <div class="font-bold text-[#1A2C54] flex items-center gap-2">
                <Receipt class="w-3.5 h-3.5" />付款记录
              </div>
              <Badge :variant="STORE_PAYMENT_STATUS_VARIANT[payment.status]">
                {{ STORE_PAYMENT_STATUS_LABEL[payment.status] }}
              </Badge>
            </div>
            <div class="text-xs text-muted-foreground">{{ payment.paymentNo }}</div>
            <div class="text-xs">支付方式：{{ STORE_PAYMENT_METHOD_LABEL[payment.method] }}</div>
            <div class="text-xs text-muted-foreground">提交时间：{{ formatDateTime(payment.submittedAt) }}</div>
            <div v-if="payment.transactionNo" class="text-xs">
              流水号：<span class="font-mono">{{ payment.transactionNo }}</span>
            </div>
            <div v-if="payment.status === 2 && payment.rejectReason" class="text-xs text-destructive bg-destructive/5 rounded-lg p-2.5">
              驳回原因：{{ payment.rejectReason }}
            </div>
            <img
              v-if="payment.voucherUrl"
              :src="payment.voucherUrl"
              alt="支付凭证"
              class="rounded-lg border border-border w-full mt-2 cursor-pointer hover:opacity-90 transition-opacity"
            />
          </div>
      </div>
    </div>
    </div>

    <BasicModal
      v-model:open="payModal.visible.value"
      title="提交支付凭证"
      description="支付成功后请上传凭证或填写流水号，平台核对后完成订单"
      :confirm-loading="submitting"
      :confirm-disabled="!canSubmit"
      width="640px"
      confirm-text="提交"
      @confirm="submitPay"
    >
      <Tabs :model-value="method" @update:model-value="(v: any) => method = v as StorePaymentMethod" class="w-full">
        <TabsList class="grid grid-cols-3">
          <TabsTrigger value="OFFLINE"><Wallet class="w-3.5 h-3.5 mr-1" />线下转账</TabsTrigger>
          <TabsTrigger value="ONLINE_WECHAT"><Smartphone class="w-3.5 h-3.5 mr-1" />微信</TabsTrigger>
          <TabsTrigger value="ONLINE_ALIPAY"><Smartphone class="w-3.5 h-3.5 mr-1" />支付宝</TabsTrigger>
        </TabsList>

        <TabsContent value="OFFLINE" class="space-y-3">
          <div class="bg-muted/40 border border-border rounded-lg p-4 text-sm space-y-1">
            <div class="font-medium mb-1">平台收款账户</div>
            <div>开户行：{{ PLATFORM_BANK_INFO.bankName }}</div>
            <div>户名：{{ PLATFORM_BANK_INFO.accountName }}</div>
            <div>账号：<span class="tabular-nums font-mono">{{ PLATFORM_BANK_INFO.accountNo }}</span></div>
            <div class="text-xs text-muted-foreground mt-2">{{ PLATFORM_BANK_INFO.notice }}</div>
          </div>
          <div class="space-y-2">
            <Label>转账凭证 <span class="text-destructive">*</span></Label>
            <div class="flex items-center gap-2">
              <Input v-model="form.voucherUrl" placeholder="上传后自动填充凭证 URL" class="flex-1" />
              <Button variant="outline" size="sm" @click="pickMockVoucher">上传凭证</Button>
            </div>
            <img v-if="form.voucherUrl" :src="form.voucherUrl" alt="凭证预览" class="rounded border border-border max-h-40" />
          </div>
        </TabsContent>

        <TabsContent value="ONLINE_WECHAT" class="space-y-3">
          <div class="space-y-2">
            <Label>微信交易流水号 <span class="text-destructive">*</span></Label>
            <Input v-model="form.transactionNo" placeholder="例如 4200001234202605xxxxxx" />
          </div>
        </TabsContent>

        <TabsContent value="ONLINE_ALIPAY" class="space-y-3">
          <div class="space-y-2">
            <Label>支付宝交易流水号 <span class="text-destructive">*</span></Label>
            <Input v-model="form.transactionNo" placeholder="例如 2026052422001234567890" />
          </div>
        </TabsContent>
      </Tabs>

      <div class="space-y-1.5 mt-3">
        <Label>备注</Label>
        <Input v-model="form.remark" placeholder="选填" />
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
