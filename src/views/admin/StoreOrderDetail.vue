<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, MapPin, Package, ShoppingCart, Truck, XCircle } from 'lucide-vue-next';
import { Badge, Button, Input, Label } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { getStoreOrderApi, cancelStoreOrderApi } from '/@/api/admin/operations';
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from '/@/constants/b2b2bStatus';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { OrderStatus, StoreOrder } from '/#/b2b-2b';

const route = useRoute();
const router = useRouter();
const orderId = computed(() => route.params.id as string);

const order = ref<StoreOrder | null>(null);
const loading = ref(false);
const submitting = ref(false);
const cancelReason = ref('');
const cancelModal = useModal();

function orderStatusLabel(status: OrderStatus, fallback?: string) {
  return fallback || ORDER_STATUS_LABEL[status] || '-';
}

function orderStatusVariant(status: OrderStatus) {
  return ORDER_STATUS_VARIANT[status] || 'warning';
}

function parseAddress(value?: string) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const address = computed(() => parseAddress(order.value?.deliveryAddress));
const canCancel = computed(() => order.value?.orderStatus === 0);
const createTime = computed(() => order.value?.createdAt || (order.value as any)?.createTime || '');
const paidTime = computed(() => order.value?.paidAt || order.value?.paymentTime || '');

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
        description: '门店已提交采购订单',
        time: createTime.value,
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
      description: '门店已提交采购订单',
      time: createTime.value,
      state: 'done',
    },
    {
      title: '待收货',
      description: isReceiving || isSigned ? '商品已进入履约配送，等待门店收货确认' : '订单完成支付和集采后进入收货阶段',
      time: order.value.shippedAt || paidTime.value,
      state: stepState(isReceiving || isSigned, status === 1 || status === 2),
    },
    {
      title: '已签收',
      description: isSigned ? '门店已确认签收，订单履约完成' : '门店确认全部收货后完成签收',
      time: order.value.completedAt,
      state: stepState(isSigned, isReceiving),
    },
  ];
});

function logisticsDotClass(state: LogisticsStepState) {
  if (state === 'cancelled') return 'bg-red-50 text-red-500 border-red-100';
  if (state === 'done') return 'bg-primary text-white border-primary';
  if (state === 'current') return 'bg-primary/5 text-primary border-[#b8c9e6]';
  return 'bg-white text-muted-foreground border-[#d9e0e8]';
}

function logisticsTextClass(state: LogisticsStepState) {
  if (state === 'cancelled') return 'text-red-500';
  if (state === 'done' || state === 'current') return 'text-primary';
  return 'text-muted-foreground';
}

async function loadOrder() {
  loading.value = true;
  try {
    order.value = await getStoreOrderApi(orderId.value);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push(ROUTE_PATHS.ADMIN_STORE_ORDERS);
}

function openCancel() {
  cancelReason.value = '';
  cancelModal.open();
}

async function confirmCancel() {
  if (!order.value || !cancelReason.value.trim()) return;
  submitting.value = true;
  try {
    await cancelStoreOrderApi(order.value.id, cancelReason.value.trim());
    cancelModal.close();
    await loadOrder();
  } finally {
    submitting.value = false;
  }
}

onMounted(loadOrder);
watch(orderId, loadOrder);
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
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span class="ml-3 text-sm text-muted-foreground">加载订单信息...</span>
    </div>

    <div v-else-if="!order" class="text-center text-muted-foreground py-24">
      订单不存在或无访问权限
    </div>

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
                          <th class="px-4 py-3 font-medium text-right">售价</th>
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
                          <td class="px-4 py-3 text-right">{{ it.quantity ?? it.qty ?? 0 }} {{ it.unit }}</td>
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
                      <Badge :variant="orderStatusVariant(order.orderStatus)">
                        {{ orderStatusLabel(order.orderStatus, order.statusLabel) }}
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
          <div class="bg-primary text-white rounded-2xl p-6 overflow-hidden relative">
            <div class="relative z-10">
              <div class="text-sm text-white/70">订单金额</div>
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
              <Button v-if="canCancel" variant="destructive" class="w-full mt-5" :disabled="submitting" @click="openCancel">
                取消订单
              </Button>
            </div>
            <ShoppingCart class="absolute -bottom-5 -right-5 w-28 h-28 text-white/10" />
          </div>

          <div class="bg-white border border-[#edf1f5] rounded-2xl p-5">
            <h4 class="font-bold text-primary mb-4 flex items-center gap-2">
              <CreditCard class="w-4 h-4" />
              付款信息
            </h4>
            <div v-if="order.paymentInfo" class="space-y-3 text-sm">
              <div>
                <div class="text-xs text-muted-foreground">支付记录ID</div>
                <div class="font-mono break-all">{{ order.paymentInfo.paymentId }}</div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <div class="text-xs text-muted-foreground">支付金额</div>
                  <div class="font-medium">{{ formatCurrency(order.paymentInfo.paymentAmount) }}</div>
                </div>
                <div>
                  <div class="text-xs text-muted-foreground">支付状态</div>
                  <div>{{ order.paymentInfo.paymentStatus }}</div>
                </div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">支付方式</div>
                <div>{{ order.paymentInfo.paymentMethod || order.paymentMethod || '-' }}</div>
              </div>
            </div>
            <div v-else class="text-sm text-muted-foreground">
              暂无付款记录
            </div>
          </div>
        </div>
      </div>
    </div>

    <BasicModal
      v-model:open="cancelModal.visible.value"
      title="取消订单"
      :description="`将取消订单 ${order?.orderNo || ''}`"
      confirm-text="确认取消"
      confirm-variant="destructive"
      :confirm-loading="submitting"
      :confirm-disabled="!cancelReason.trim()"
      @confirm="confirmCancel"
    >
      <div class="space-y-2">
        <Label>取消原因 <span class="text-destructive">*</span></Label>
        <Input v-model="cancelReason" placeholder="请输入取消原因" />
      </div>
    </BasicModal>
  </PageWrapper>
</template>
