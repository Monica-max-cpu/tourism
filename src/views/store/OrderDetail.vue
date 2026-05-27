<script setup lang="ts">
/**
 * 门店 - 订单详情（含支付提交）
 */
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  CreditCard, Wallet, Smartphone, Receipt, PackageCheck, MapPin, Truck,
  AlertCircle, XCircle, Package, CheckCircle2,
} from 'lucide-vue-next';
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

// ====== 进度条：5 步固定 ======
interface ProgressStep {
  label: string;
  icon: any;
  done: boolean;
  active: boolean;
  error: boolean;
  errorMsg?: string;
}

const progressSteps = computed<ProgressStep[]>(() => {
  const o = order.value;
  const p = payment.value;
  if (!o) return [];

  const payDone = o.orderStatus >= 1 || p?.status === 1;
  const payActive = o.orderStatus === 0;
  const payRejected = p?.status === 2;
  const shipDone = o.orderStatus >= 3;
  const shipActive = o.orderStatus >= 1 && o.orderStatus <= 2;
  const receiveDone = o.orderStatus >= 5;
  const receiveActive = o.orderStatus >= 3 && o.orderStatus <= 4;
  const completeDone = o.orderStatus === 5;

  return [
    { label: '提交订单', icon: CheckCircle2, done: true, active: false, error: false },
    {
      label: payRejected ? '支付驳回' : '支付待审',
      icon: payRejected ? XCircle : CheckCircle2,
      done: payDone && !payRejected,
      active: payActive,
      error: payRejected,
      errorMsg: payRejected ? (p?.rejectReason || '凭证审核未通过') : undefined,
    },
    { label: '待发货', icon: Package, done: shipDone, active: shipActive, error: false },
    { label: '待收货', icon: Truck, done: receiveDone, active: receiveActive, error: false },
    { label: '完成', icon: CheckCircle2, done: completeDone, active: false, error: false },
  ];
});
</script>

<template>
  <PageWrapper
    :title="order ? order.orderNo : '订单详情'"
    :subtitle="order ? formatDateTime(order.createTime) : ''"
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
      <!-- 左侧主信息区 -->
      <div class="space-y-5">

        <!-- 订单进度条卡片 -->
        <Card class="rounded-lg shadow-sm">
          <CardContent class="p-6">
            <h3 class="text-sm font-semibold mb-5">订单进度</h3>
            <div class="flex items-start gap-0">
              <template v-for="(step, idx) in progressSteps" :key="idx">
                <div class="flex flex-col items-center" style="min-width:72px;flex:1">
                  <div
                    :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                      step.error
                        ? 'bg-destructive/10 text-destructive border-2 border-destructive'
                        : step.done
                          ? 'bg-primary text-primary-foreground'
                          : step.active
                            ? 'bg-primary/10 text-primary border-2 border-primary'
                            : 'bg-muted text-muted-foreground',
                    ]"
                  >
                    <component :is="step.icon" :class="step.done || step.error ? 'w-5 h-5' : 'w-4 h-4'" />
                  </div>
                  <div class="mt-2 text-center">
                    <div
                      :class="[
                        'text-xs font-medium leading-tight',
                        step.error ? 'text-destructive' : step.done || step.active ? 'text-foreground' : 'text-muted-foreground',
                      ]"
                    >
                      {{ step.label }}
                    </div>
                    <div v-if="step.errorMsg" class="text-[10px] text-destructive/80 mt-0.5 max-w-[80px] leading-tight">
                      {{ step.errorMsg }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="idx < progressSteps.length - 1"
                  :class="['flex-1 h-0.5 mt-[20px] -mx-1 rounded-full', step.done && !step.error ? 'bg-primary' : 'bg-border']"
                />
              </template>
            </div>
          </CardContent>
        </Card>

        <!-- 商品明细卡片 -->
        <Card class="rounded-lg shadow-sm">
          <CardContent class="p-0">
            <div class="px-6 py-4 border-b border-border">
              <h3 class="text-sm font-semibold">商品明细</h3>
            </div>

            <!-- 表头 -->
            <div class="hidden sm:grid grid-cols-[auto_1fr_100px_100px_80px_100px] gap-4 px-6 py-2.5 text-xs text-muted-foreground bg-muted/30 border-b border-border">
              <span class="w-14"></span>
              <span>商品信息</span>
              <span class="text-right">单价</span>
              <span class="text-right">数量</span>
              <span class="text-right">小计</span>
            </div>

            <div v-if="order.items?.length">
              <div
                v-for="(it, idx) in order.items"
                :key="idx"
                class="grid grid-cols-1 sm:grid-cols-[auto_1fr_100px_100px_80px_100px] gap-x-4 gap-y-2 px-6 py-4 border-b border-border last:border-b-0 items-center"
              >
                <!-- 缩略图 -->
                <div class="w-14 h-14 rounded-lg bg-muted/50 border border-border/50 overflow-hidden shrink-0">
                  <img
                    v-if="it.imageUrl"
                    :src="it.imageUrl"
                    :alt="it.productName"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package class="w-5 h-5" />
                  </div>
                </div>
                <!-- 商品信息 -->
                <div class="min-w-0">
                  <div class="text-sm font-medium truncate">{{ it.productName }}</div>
                  <div class="text-xs text-muted-foreground mt-0.5">
                    <span v-if="it.spec">{{ it.spec }}</span>
                    <span v-if="it.catalogId" class="ml-2 font-mono">SKU: {{ it.catalogId }}</span>
                  </div>
                  <div v-if="it.receivedQty != null" class="text-xs text-primary mt-0.5">
                    已收货 {{ it.receivedQty }} / {{ it.quantity }}
                  </div>
                </div>
                <!-- 单价 -->
                <div class="text-sm text-right tabular-nums">
                  <div v-if="it.catalogPrice !== it.actualPrice" class="text-xs text-muted-foreground line-through">{{ formatCurrency(it.catalogPrice) }}</div>
                  <div class="text-foreground font-medium">{{ formatCurrency(it.actualPrice) }}</div>
                </div>
                <!-- 数量 -->
                <div class="text-sm text-right tabular-nums text-muted-foreground">×{{ it.quantity }}</div>
                <!-- 小计 -->
                <div class="text-sm text-right tabular-nums font-semibold text-primary">{{ formatCurrency(it.subtotal) }}</div>
              </div>
            </div>
            <div v-else class="px-6 py-10 text-center text-muted-foreground text-sm">暂无商品明细</div>

            <!-- 底部汇总 -->
            <div class="px-6 py-4 flex items-center justify-end border-t border-border bg-muted/20">
              <span class="text-sm text-muted-foreground mr-2">
                共 {{ order.itemCount || order.items?.length || 0 }} 件商品，商品总额
              </span>
              <span class="text-xl font-bold text-primary tabular-nums">{{ formatCurrency(order.totalAmount) }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- 收货及物流卡片（双栏） -->
        <Card class="rounded-lg shadow-sm">
          <CardContent class="p-6">
            <h3 class="text-sm font-semibold mb-4">收货及物流</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 左栏：收货信息 -->
              <div>
                <div class="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <MapPin class="w-3.5 h-3.5" />
                  收货信息
                </div>
                <div v-if="order.deliveryAddress" class="space-y-1.5">
                  <div class="text-sm font-medium">
                    {{ order.deliveryAddress.receiverName }}
                    <span class="text-muted-foreground font-normal ml-2">{{ order.deliveryAddress.receiverPhone }}</span>
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{ order.deliveryAddress.province }}{{ order.deliveryAddress.city }} {{ order.deliveryAddress.address }}
                  </div>
                </div>
                <div v-else class="text-sm text-muted-foreground">暂无收货信息</div>

                <!-- 订单备注 -->
                <div v-if="order.remark" class="mt-4 pt-4 border-t border-border">
                  <div class="text-xs text-muted-foreground mb-1">订单备注</div>
                  <div class="text-sm">{{ order.remark }}</div>
                </div>
              </div>

              <!-- 右栏：物流信息 -->
              <div>
                <div class="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Truck class="w-3.5 h-3.5" />
                  物流追踪
                </div>
                <template v-if="order.deliveries?.length">
                  <div v-for="(d, di) in order.deliveries" :key="di" class="space-y-1.5" :class="di > 0 ? 'mt-4 pt-4 border-t border-border' : ''">
                    <div class="text-sm font-medium">{{ d.logisticsCompany || '待分配物流' }}</div>
                    <div v-if="d.trackingNo" class="text-sm">
                      <span class="text-muted-foreground">运单号：</span>
                      <span class="font-mono tabular-nums">{{ d.trackingNo }}</span>
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ d.statusLabel }}
                      <span v-if="d.shippedTime"> · {{ formatDateTime(d.shippedTime) }}</span>
                    </div>
                  </div>
                </template>
                <div v-else class="text-sm text-muted-foreground">待发货</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 右：支付 / 操作 -->
      <div class="space-y-4 lg:sticky lg:top-20 h-fit">
        <Card class="rounded-lg shadow-sm">
          <CardContent class="p-6">
            <div class="text-sm text-muted-foreground">应付金额</div>
            <div class="text-3xl font-bold text-primary tabular-nums mt-1">{{ formatCurrency(order.totalAmount) }}</div>

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
            <div v-else-if="order.orderStatus === 3 || order.orderStatus === 4" class="mt-5">
              <Button v-auth="'b2b:store:receive'" class="w-full" @click="onConfirmReceive">
                <PackageCheck class="w-4 h-4 mr-1.5" />确认收货
              </Button>
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
          </CardContent>
        </Card>

        <!-- 付款记录 -->
        <Card v-if="payment" class="rounded-lg shadow-sm">
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
            <div v-if="payment.status === 2 && payment.rejectReason" class="text-xs text-destructive bg-destructive/5 rounded-lg p-2.5">
              驳回原因：{{ payment.rejectReason }}
            </div>
            <img
              v-if="payment.voucherUrl"
              :src="payment.voucherUrl"
              alt="支付凭证"
              class="rounded-lg border border-border w-full mt-2 cursor-pointer hover:opacity-90 transition-opacity"
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
