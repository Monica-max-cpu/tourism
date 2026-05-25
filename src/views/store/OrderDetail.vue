<script setup lang="ts">
/**
 * 门店 - 订单详情（含支付提交）
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】订单详情 + 支付凭证
 * - PENDING_PAYMENT 时展示支付面板（线下转账填凭证图、线上填流水号）
 * - 提交后订单 PENDING_PAYMENT → PENDING_CONFIRM，由阶段 2B PaymentManage 处理
 * - 仅展示销售价；不出现成本价 / 供应商
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】订单详情 + 支付凭证
 */
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CreditCard, Wallet, Smartphone, Receipt, PackageCheck } from 'lucide-vue-next';
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
    const [o, p] = await Promise.all([
      getStoreOrderApi(orderId.value),
      getPaymentByOrderApi(orderId.value),
    ]);
    order.value = o;
    payment.value = p;
  } finally {
    loading.value = false;
  }
}
onMounted(loadAll);
watch(orderId, loadAll);

// 支付表单
const method = ref<StorePaymentMethod>('OFFLINE_TRANSFER');
const form = reactive({ voucherUrl: '', transactionNo: '', remark: '' });
const submitting = ref(false);
const payModal = useModal();

const canSubmit = computed(() => {
  if (method.value === 'OFFLINE_TRANSFER') return !!form.voucherUrl;
  return !!form.transactionNo;
});

function pickMockVoucher() {
  // 演示：模拟选择凭证图（阶段 7 接入真实上传）
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
      voucherUrl: method.value === 'OFFLINE_TRANSFER' ? form.voucherUrl : undefined,
      transactionNo: method.value !== 'OFFLINE_TRANSFER' ? form.transactionNo : undefined,
      remark: form.remark,
    });
    payModal.close();
    Object.assign(form, { voucherUrl: '', transactionNo: '', remark: '' });
    await loadAll();
  } finally {
    submitting.value = false;
  }
}

async function onConfirmReceive() {
  if (!order.value) return;
  await confirmReceiveApi(order.value.id);
  await loadAll();
}
async function onCancel() {
  if (!order.value) return;
  await cancelStoreOrderApi(order.value.id, '门店主动取消');
  router.replace('/store/orders');
}

// 时间线
const timeline = computed(() => {
  const o = order.value;
  if (!o) return [];
  return [
    { label: '下单', time: o.createdAt, done: !!o.createdAt },
    { label: '支付', time: o.paidAt, done: !!o.paidAt },
    { label: '平台确认收款', time: o.confirmedAt, done: !!o.confirmedAt },
    { label: '配送', time: o.shippedAt, done: !!o.shippedAt },
    { label: '送达', time: o.deliveredAt, done: !!o.deliveredAt },
    { label: '完成', time: o.completedAt, done: !!o.completedAt },
  ];
});
</script>

<template>
  <PageWrapper :title="order ? `订单详情 ${order.orderNo}` : '订单详情'" :subtitle="order ? `下单时间 ${formatDateTime(order.createdAt)}` : ''" show-back>
    <template v-if="order" #extra>
      <Badge :variant="STORE_ORDER_STATUS_VARIANT[order.status]">{{ STORE_ORDER_STATUS_LABEL[order.status] }}</Badge>
    </template>

    <div v-if="loading" class="text-center text-muted-foreground py-12">加载中...</div>
    <div v-else-if="!order" class="text-center text-muted-foreground py-16">订单不存在或无访问权限</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      <!-- 左：商品 / 收货 / 时间线 -->
      <div class="space-y-4">
        <!-- 时间线 -->
        <Card>
          <CardContent class="p-5">
            <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
              <div v-for="t in timeline" :key="t.label" class="text-center">
                <div :class="['w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium',
                  t.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground']">
                  {{ t.done ? '✓' : '·' }}
                </div>
                <div class="text-xs mt-1.5">{{ t.label }}</div>
                <div class="text-[10px] text-muted-foreground tabular-nums">{{ t.time ? formatDateTime(t.time).slice(5, 16) : '-' }}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- 商品列表 -->
        <Card>
          <CardContent class="p-0">
            <div class="px-5 py-3 border-b border-border text-sm font-medium">商品明细 ({{ order.itemCount }} 件)</div>
            <div v-for="(it, idx) in order.items" :key="idx" class="px-5 py-3 border-b border-border last:border-0 flex items-center gap-3">
              <img :src="it.cover" :alt="it.productName" class="w-12 h-12 object-cover rounded bg-muted" loading="lazy" />
              <div class="flex-1 min-w-0">
                <div class="text-sm truncate">{{ it.productName }}</div>
                <div class="text-xs text-muted-foreground">SKU {{ it.productSku }} · {{ it.unit }}</div>
              </div>
              <div class="text-sm tabular-nums w-24 text-right">{{ formatCurrency(it.unitPrice) }} × {{ it.qty }}</div>
              <div class="text-base font-semibold text-primary tabular-nums w-28 text-right">{{ formatCurrency(it.subtotal) }}</div>
            </div>
            <div class="px-5 py-3 flex items-center justify-end gap-3 border-t border-border bg-muted/30">
              <span class="text-sm text-muted-foreground">订单总额</span>
              <span class="text-2xl font-bold text-primary tabular-nums">{{ formatCurrency(order.totalAmount) }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- 收货 / 物流 -->
        <Card>
          <CardContent class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-xs text-muted-foreground mb-1">收货信息</div>
              <div>{{ order.receiver }} {{ order.receiverPhone }}</div>
              <div class="text-muted-foreground mt-0.5">{{ order.receiveAddress }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">物流信息</div>
              <div v-if="order.carrier">{{ order.carrier }} · {{ order.trackingNo }}</div>
              <div v-else class="text-muted-foreground">-</div>
            </div>
            <div v-if="order.remark" class="md:col-span-2">
              <div class="text-xs text-muted-foreground mb-1">备注</div>
              <div>{{ order.remark }}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 右：支付/操作 -->
      <div class="space-y-4 lg:sticky lg:top-20 h-fit">
        <Card>
          <CardContent class="p-5">
            <div class="text-sm text-muted-foreground">应付金额</div>
            <div class="text-3xl font-bold text-primary tabular-nums mt-1">{{ formatCurrency(order.totalAmount) }}</div>

            <div v-if="order.status === 'PENDING_PAYMENT'" class="mt-4 space-y-2">
              <Button class="w-full" @click="payModal.open()"><CreditCard class="w-4 h-4 mr-1.5" />立即支付</Button>
              <Button variant="outline" class="w-full" @click="onCancel">取消订单</Button>
            </div>
            <div v-else-if="order.status === 'DELIVERED'" class="mt-4">
              <Button v-auth="'b2b:store:receive'" class="w-full" @click="onConfirmReceive">
                <PackageCheck class="w-4 h-4 mr-1.5" />确认收货
              </Button>
            </div>
            <div v-else class="mt-4">
              <Badge variant="secondary">订单进行中，无需操作</Badge>
            </div>
          </CardContent>
        </Card>

        <!-- 当前付款记录 -->
        <Card v-if="payment">
          <CardContent class="p-5 space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium flex items-center gap-1.5"><Receipt class="w-3.5 h-3.5" />付款记录</div>
              <Badge :variant="STORE_PAYMENT_STATUS_VARIANT[payment.status]">{{ STORE_PAYMENT_STATUS_LABEL[payment.status] }}</Badge>
            </div>
            <div class="text-xs text-muted-foreground">{{ payment.paymentNo }}</div>
            <div class="text-xs">支付方式：{{ STORE_PAYMENT_METHOD_LABEL[payment.method] }}</div>
            <div class="text-xs text-muted-foreground">提交时间：{{ formatDateTime(payment.submittedAt) }}</div>
            <div v-if="payment.transactionNo" class="text-xs">流水号：{{ payment.transactionNo }}</div>
            <img v-if="payment.voucherUrl" :src="payment.voucherUrl" alt="凭证" class="rounded border border-border w-full" />
            <div v-if="payment.status === 'REJECTED' && payment.rejectReason" class="text-xs text-destructive">
              驳回原因：{{ payment.rejectReason }}
            </div>
            <Button v-if="payment.status === 'REJECTED' && order.status === 'PENDING_PAYMENT'" size="sm" class="w-full" @click="payModal.open()">
              重新提交凭证
            </Button>
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
          <TabsTrigger value="OFFLINE_TRANSFER"><Wallet class="w-3.5 h-3.5 mr-1" />线下转账</TabsTrigger>
          <TabsTrigger value="ONLINE_WECHAT"><Smartphone class="w-3.5 h-3.5 mr-1" />微信</TabsTrigger>
          <TabsTrigger value="ONLINE_ALIPAY"><Smartphone class="w-3.5 h-3.5 mr-1" />支付宝</TabsTrigger>
        </TabsList>

        <TabsContent value="OFFLINE_TRANSFER" class="space-y-3">
          <div class="bg-muted/40 border border-border rounded-lg p-4 text-sm space-y-1">
            <div class="font-medium mb-1">平台收款账户</div>
            <div>开户行<span class="tabular-nums">{{ PLATFORM_BANK_INFO.bankName }}</span></div>
            <div>户名：{{ PLATFORM_BANK_INFO.accountName }}</div>
            <div>账号<span class="tabular-nums font-mono">{{ PLATFORM_BANK_INFO.accountNo }}</span></div>
            <div class="text-xs text-muted-foreground mt-2">{{ PLATFORM_BANK_INFO.notice }}</div>
          </div>
          <div class="flex items-center gap-2">
            <Label>转账凭证<span class="text-destructive">*</span></Label>
            <div class="flex items-center gap-2">
              <Input v-model="form.voucherUrl" placeholder="粘贴凭证图片 URL" class="flex-1" />
              <Button variant="outline" size="sm" @click="pickMockVoucher">模拟上传</Button>
            </div>
            <img v-if="form.voucherUrl" :src="form.voucherUrl" alt="凭证预览" class="mt-2 rounded border border-border max-h-40" />
          </div>
        </TabsContent>

        <TabsContent value="ONLINE_WECHAT" class="space-y-3">
          <div class="bg-muted/40 border border-border rounded-lg p-4 text-sm">
            扫码或在微信端完成支付后，请填写支付完成的微信交易流水号。
          </div>
          <div class="flex items-center gap-2">
            <Label>微信交易流水号<span class="text-destructive">*</span></Label>
            <Input v-model="form.transactionNo" placeholder="例如 4200001234202605xxxxxx" />
          </div>
        </TabsContent>

        <TabsContent value="ONLINE_ALIPAY" class="space-y-3">
          <div class="bg-muted/40 border border-border rounded-lg p-4 text-sm">
            扫码或在支付宝端完成支付后，请填写支付宝交易流水号。
          </div>
          <div class="flex items-center gap-2">
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
  </PageWrapper>
</template>
