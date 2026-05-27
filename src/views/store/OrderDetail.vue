<script setup lang="ts">
/**
 * 门店 - 订单详情（含支付提交）
 * update-begin--author:claude---date:2026-05-27---for:【阶段7】订单详情页重设计
 * - 状态时间线同步订单 + 支付状态
 * - 商品明细与收货信息合并为一卡展示
 * - UI 对齐项目整体设计风格
 * update-end--author:claude---date:2026-05-27---for:【阶段7】订单详情页重设计
 */
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CreditCard, Wallet, Smartphone, Receipt, PackageCheck, MapPin, Truck, AlertCircle, XCircle, CheckCheck } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label, Card, CardContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { getStoreOrderApi, confirmReceiveApi, cancelStoreOrderApi } from '/@/api/store/order';
import { getPaymentByOrderApi, submitPaymentApi } from '/@/api/store/payment';
import {
  STORE_ORDER_STATUS_LABEL, STORE_ORDER_STATUS_VARIANT,
  STORE_PAYMENT_STATUS_LABEL, STORE_PAYMENT_STATUS_VARIANT,
  STORE_PAYMENT_METHOD_LABEL, PLATFORM_BANK_INFO,
} from '/@/constants/storeStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { StoreViewOrder, StorePaymentRecord, StorePaymentMethod } from '/#/b2b-store';

const route = useRoute();
const router = useRouter();
const orderId = computed(() => route.params.id as string);

const order = ref<StoreViewOrder | null>(null);
const payment = ref<StorePaymentRecord | null>(null);
const loading = ref(false);

async function loadAll() {
  loading.value = true;
  try {
    const o = await getStoreOrderApi(orderId.value);
    order.value = o;
    if (o?.orderNo) {
      try {
        payment.value = await getPaymentByOrderApi(o.orderNo);
      } catch { /* 支付记录不存在不影响订单详情 */ }
    }
  } finally {
    loading.value = false;
  }
}
onMounted(loadAll);
watch(orderId, loadAll);

// ====== 支付表单 ======
const method = ref<StorePaymentMethod>('OFFLINE');
const form = reactive({ voucherUrl: '', transactionNo: '', remark: '' });
const submitting = ref(false);
const payModal = useModal();

const canSubmit = computed(() => {
  if (method.value === 'OFFLINE') return !!form.voucherUrl;
  return !!form.transactionNo;
});

function pickMockVoucher() {
  form.voucherUrl = `https://placehold.co/600x400/eef2ff/4f46e5?text=Voucher+${Date.now() % 1000}`;
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

// ====== 取消 ======
const cancelModal = useModal();
const cancelReason = ref('');
const cancelSubmitting = ref(false);

async function onConfirmReceive() {
  if (!order.value) return;
  await confirmReceiveApi(order.value.id);
  await loadAll();
}
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
    router.replace('/store/orders');
  } finally {
    cancelSubmitting.value = false;
  }
}

// ====== 状态时间线（固定 5 步，同步订单 + 支付状态） ======
interface TimelineStep {
  label: string;
  desc?: string;
  time?: string | null;
  done: boolean;
  active: boolean;
  error: boolean;
}

const timeline = computed<TimelineStep[]>(() => {
  const o = order.value;
  const p = payment.value;
  if (!o) return [];

  const paymentSubmitted = !!p;
  const paymentApproved = p?.status === 1;
  const paymentRejected = p?.status === 2;
  const firstDelivery = o.deliveries?.[0];

  // 支付步骤的状态文字
  let payLabel = '待支付';
  let payDesc = '';
  let payError = false;
  if (paymentRejected) {
    payLabel = '支付驳回';
    payDesc = p?.rejectReason || '凭证审核未通过';
    payError = true;
  } else if (paymentApproved) {
    payLabel = '支付通过';
  } else if (paymentSubmitted) {
    payLabel = '支付待审';
    payDesc = '平台正在审核凭证';
  }

  // 支付是否已完成（通过）
  const payDone = paymentApproved || o.orderStatus >= 1;
  // 支付是否当前步骤
  const payActive = o.orderStatus === 0;

  // 发货
  const shipDone = o.orderStatus >= 4;
  const shipActive = o.orderStatus === 3;
  const shipLabel = o.orderStatus >= 3 ? (firstDelivery?.shippedTime ? '已发货' : '配送中') : '待发货';

  // 收货
  const receiveDone = o.orderStatus >= 4;
  const receiveActive = o.orderStatus === 4;

  // 完成
  const completeDone = o.orderStatus === 5;

  return [
    {
      label: '下单',
      time: o.createTime,
      done: true,
      active: false,
      error: false,
    },
    {
      label: payLabel,
      desc: payDesc,
      time: p?.submittedAt || o.paymentTime || null,
      done: payDone,
      active: payActive,
      error: payError,
    },
    {
      label: shipLabel,
      time: firstDelivery?.shippedTime || null,
      done: shipDone,
      active: shipActive,
      error: false,
    },
    {
      label: o.orderStatus === 4 ? '部分收货' : '收货',
      time: null,
      done: receiveDone,
      active: receiveActive,
      error: false,
    },
    {
      label: '完成',
      time: null,
      done: completeDone,
      active: false,
      error: false,
    },
  ];
});
</script>

<template>
  <PageWrapper
    :title="order ? `订单详情 ${order.orderNo}` : '订单详情'"
    :subtitle="order ? `下单时间 ${formatDateTime(order.createTime)}` : ''"
    show-back
  >
    <template v-if="order" #extra>
      <Badge :variant="STORE_ORDER_STATUS_VARIANT[order.orderStatus] || 'info'">
        {{ order.statusLabel || STORE_ORDER_STATUS_LABEL[order.orderStatus] }}
      </Badge>
    </template>

    <div v-if="loading" class="text-center text-muted-foreground py-12">加载中...</div>
    <div v-else-if="!order" class="text-center text-muted-foreground py-16">订单不存在或无访问权限</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <!-- 左：状态时间线 + 商品 & 收货合并卡 -->
      <div class="space-y-6">
        <!-- 状态时间线 -->
        <Card>
          <CardContent class="p-5">
            <h3 class="text-sm font-semibold mb-4">订单进度</h3>
            <div class="flex items-start gap-0">
              <template v-for="(step, idx) in timeline" :key="idx">
                <div class="flex flex-col items-center" style="min-width:80px;flex:1">
                  <!-- 节点 -->
                  <div
                    :class="[
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                      step.error
                        ? 'bg-destructive/10 text-destructive border-2 border-destructive'
                        : step.done
                          ? 'bg-primary text-primary-foreground'
                          : step.active
                            ? 'bg-primary/10 text-primary border-2 border-primary'
                            : 'bg-muted text-muted-foreground',
                    ]"
                  >
                    <CheckCheck v-if="step.done && !step.error" class="w-4 h-4" />
                    <XCircle v-else-if="step.error" class="w-4 h-4" />
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <!-- 文字 -->
                  <div class="mt-2 text-center">
                    <div
                      :class="[
                        'text-xs font-medium',
                        step.error ? 'text-destructive' : step.done || step.active ? 'text-foreground' : 'text-muted-foreground',
                      ]"
                    >
                      {{ step.label }}
                    </div>
                    <div v-if="step.desc" :class="['text-[10px] mt-0.5', step.error ? 'text-destructive/80' : 'text-muted-foreground']">
                      {{ step.desc }}
                    </div>
                    <div v-if="step.time" class="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                      {{ formatDateTime(step.time).slice(5, 16) }}
                    </div>
                  </div>
                </div>
                <!-- 连线 -->
                <div
                  v-if="idx < timeline.length - 1"
                  :class="['flex-1 h-0.5 mt-[18px] -mx-1', step.done ? 'bg-primary' : 'bg-border']"
                />
              </template>
            </div>
          </CardContent>
        </Card>

        <!-- 商品明细 + 收货/物流信息（合并卡） -->
        <Card>
          <CardContent class="p-0">
            <!-- 商品列表头 -->
            <div class="px-5 py-3 border-b border-border">
              <h3 class="text-sm font-semibold">商品明细</h3>
            </div>

            <!-- 商品行 -->
            <div v-if="order.items?.length">
              <div
                v-for="(it, idx) in order.items"
                :key="idx"
                class="px-5 py-3 border-b border-border last:border-b-0 flex items-center gap-4"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{{ it.productName }}</div>
                  <div class="text-xs text-muted-foreground mt-0.5">
                    {{ it.spec || it.unit }}
                    <span v-if="it.catalogId" class="ml-2">SKU {{ it.catalogId }}</span>
                    <span v-if="it.receivedQty != null" class="ml-2 text-primary">
                      已收 {{ it.receivedQty }} / {{ it.quantity }}
                    </span>
                  </div>
                </div>
                <div class="text-sm tabular-nums text-muted-foreground whitespace-nowrap">
                  <span v-if="it.catalogPrice !== it.actualPrice" class="line-through mr-1 text-xs">{{ formatCurrency(it.catalogPrice) }}</span>
                  {{ formatCurrency(it.actualPrice) }} × {{ it.quantity }}
                </div>
                <div class="text-sm font-semibold text-primary tabular-nums w-24 text-right whitespace-nowrap">
                  {{ formatCurrency(it.subtotal) }}
                </div>
              </div>
            </div>
            <div v-else class="px-5 py-8 text-center text-muted-foreground text-sm">暂无商品明细</div>

            <!-- 金额汇总 -->
            <div class="px-5 py-3 flex items-center justify-between border-t border-border bg-muted/30">
              <span class="text-sm text-muted-foreground">
                共 {{ order.itemCount || order.items?.length || 0 }} 件商品
              </span>
              <div class="flex items-center gap-3">
                <span class="text-sm text-muted-foreground">订单总额</span>
                <span class="text-xl font-bold text-primary tabular-nums">{{ formatCurrency(order.totalAmount) }}</span>
              </div>
            </div>

            <!-- 分割线 -->
            <div class="border-t border-border" />

            <!-- 收货地址（内嵌在商品卡下方） -->
            <div class="px-5 py-4">
              <h3 class="text-sm font-semibold mb-3">收货信息</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <!-- 收货地址 -->
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <MapPin class="w-4 h-4" />
                  </div>
                  <div v-if="order.deliveryAddress">
                    <div class="font-medium">{{ order.deliveryAddress.receiverName }} {{ order.deliveryAddress.receiverPhone }}</div>
                    <div class="text-muted-foreground mt-0.5">
                      {{ order.deliveryAddress.province }}{{ order.deliveryAddress.city }} {{ order.deliveryAddress.address }}
                    </div>
                  </div>
                  <div v-else class="text-muted-foreground">暂无收货信息</div>
                </div>

                <!-- 物流信息 -->
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-lg bg-violet-50 text-violet-600 shrink-0">
                    <Truck class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <template v-if="order.deliveries?.length">
                      <div v-for="(d, di) in order.deliveries" :key="di" :class="['text-sm', di > 0 ? 'mt-2 pt-2 border-t border-border' : '']">
                        <div class="font-medium">{{ d.logisticsCompany || '待分配物流' }}</div>
                        <div v-if="d.trackingNo" class="text-xs text-muted-foreground mt-0.5">
                          运单号：<span class="font-mono">{{ d.trackingNo }}</span>
                        </div>
                        <div class="text-xs text-muted-foreground mt-0.5">
                          {{ d.statusLabel }}<span v-if="d.shippedTime"> · {{ d.shippedTime }}</span>
                        </div>
                      </div>
                    </template>
                    <div v-else class="text-muted-foreground text-sm">待发货</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 备注 -->
            <div v-if="order.remark" class="px-5 py-3 border-t border-border bg-muted/20">
              <span class="text-xs text-muted-foreground">备注：</span>
              <span class="text-sm">{{ order.remark }}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 右：支付 / 操作 -->
      <div class="space-y-4 lg:sticky lg:top-20 h-fit">
        <!-- 应付金额 & 操作 -->
        <Card>
          <CardContent class="p-5">
            <div class="text-sm text-muted-foreground">应付金额</div>
            <div class="text-3xl font-bold text-primary tabular-nums mt-1">{{ formatCurrency(order.totalAmount) }}</div>

            <div v-if="order.orderStatus === 0 && (!payment || payment.status !== 2)" class="mt-4 space-y-2">
              <Button class="w-full" @click="payModal.open()">
                <CreditCard class="w-4 h-4 mr-1.5" />立即支付
              </Button>
              <Button variant="outline" class="w-full" @click="onCancel">取消订单</Button>
            </div>
            <div v-else-if="order.orderStatus === 0 && payment?.status === 2" class="mt-4 space-y-2">
              <div class="flex items-center gap-1.5 text-sm text-destructive mb-2">
                <AlertCircle class="w-4 h-4" />
                支付凭证被驳回
              </div>
              <Button class="w-full" @click="payModal.open()">重新提交凭证</Button>
              <Button variant="outline" class="w-full" @click="onCancel">取消订单</Button>
            </div>
            <div v-else-if="order.orderStatus === 3 || order.orderStatus === 4" class="mt-4">
              <Button v-auth="'b2b:store:receive'" class="w-full" @click="onConfirmReceive">
                <PackageCheck class="w-4 h-4 mr-1.5" />确认收货
              </Button>
            </div>
            <div v-else-if="order.orderStatus === 5" class="mt-4">
              <Badge variant="success" class="w-full justify-center py-2 text-sm">订单已完成</Badge>
            </div>
            <div v-else-if="order.orderStatus === 6" class="mt-4">
              <Badge variant="muted" class="w-full justify-center py-2 text-sm">订单已取消</Badge>
            </div>
            <div v-else class="mt-4">
              <Badge variant="secondary" class="w-full justify-center py-2 text-sm">订单进行中</Badge>
            </div>
          </CardContent>
        </Card>

        <!-- 付款记录 -->
        <Card v-if="payment">
          <CardContent class="p-5 space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium flex items-center gap-1.5">
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
            <div v-if="payment.status === 2 && payment.rejectReason" class="text-xs text-destructive bg-destructive/5 rounded p-2">
              驳回原因：{{ payment.rejectReason }}
            </div>
            <img
              v-if="payment.voucherUrl"
              :src="payment.voucherUrl"
              alt="支付凭证"
              class="rounded border border-border w-full mt-2 cursor-pointer hover:opacity-90 transition-opacity"
            />
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 支付弹窗 -->
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
              <Input v-model="form.voucherUrl" placeholder="粘贴凭证图片 URL" class="flex-1" />
              <Button variant="outline" size="sm" @click="pickMockVoucher">模拟上传</Button>
            </div>
            <img v-if="form.voucherUrl" :src="form.voucherUrl" alt="凭证预览" class="rounded border border-border max-h-40" />
          </div>
        </TabsContent>

        <TabsContent value="ONLINE_WECHAT" class="space-y-3">
          <div class="bg-muted/40 border border-border rounded-lg p-4 text-sm">
            扫码或在微信端完成支付后，请填写支付完成的微信交易流水号。
          </div>
          <div class="space-y-2">
            <Label>微信交易流水号 <span class="text-destructive">*</span></Label>
            <Input v-model="form.transactionNo" placeholder="例如 4200001234202605xxxxxx" />
          </div>
        </TabsContent>

        <TabsContent value="ONLINE_ALIPAY" class="space-y-3">
          <div class="bg-muted/40 border border-border rounded-lg p-4 text-sm">
            扫码或在支付宝端完成支付后，请填写支付宝交易流水号。
          </div>
          <div class="space-y-2">
            <Label>支付宝交易流水号 <span class="text-destructive">*</span></Label>
            <Input v-model="form.transactionNo" placeholder="例如 2026052422001234567890" />
          </div>
        </TabsContent>
      </Tabs>

      <div class="space-y-1.5 mt-3">
        <Label>备注（选填）</Label>
        <Input v-model="form.remark" placeholder="转账银行、付款人" />
      </div>
    </BasicModal>

    <!-- 取消弹窗 -->
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
