<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Card, CardContent } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { getSupplierOrderApi } from '/@/api/supplier/order';
import {
  COLLECTIVE_ORDER_STATUS_LABEL,
  COLLECTIVE_ORDER_STATUS_VARIANT,
} from '/@/constants/b2b2cStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';

interface ProcurementDetail {
  id: string;
  storeName?: string;
  deliveryAddress?: string;
  productName: string;
  unit?: string;
  totalQty: number;
}

interface SummaryItem {
  id: string;
  productName: string;
  unitPrice: number;
  subtotal: number;
}

interface CollectiveDetail {
  id: string;
  collectiveNo: string;
  createTime?: string;
  procurementDetails?: ProcurementDetail[];
  summaryItems?: SummaryItem[];
  items?: SummaryItem[];
}

const route = useRoute();
const id = computed(() => route.params.id as string);
const detail = ref<CollectiveDetail | null>(null);
const loading = ref(false);

const procurementDetails = computed(() => detail.value?.procurementDetails || []);
const summaryItems = computed(() => detail.value?.summaryItems || detail.value?.items || []);
const orderStatusLabel = computed(() => {
  const status = detail.value?.orderStatus;
  return COLLECTIVE_ORDER_STATUS_LABEL?.[status as number] || '-';
});
const orderStatusVariant = computed(() => {
  const status = detail.value?.orderStatus;
  return COLLECTIVE_ORDER_STATUS_VARIANT?.[status as number] || 'warning';
});
const totalReceivableAmount = computed(() =>
  summaryItems.value.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0),
);

function parseAddress(value: any) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function receiverName(addr: any) {
  return addr?.recipientName || addr?.receiverName || addr?.receiver || addr?.contactName || '-';
}

function receiverPhone(addr: any) {
  return addr?.recipientPhone || addr?.receiverPhone || addr?.contactPhone || addr?.phone || '-';
}

function receiverAddress(addr: any) {
  if (!addr) return '-';
  const raw = addr.address || addr.detailAddress || addr.fullAddress || '';
  const province = addr.province || '';
  const city = addr.city || '';
  const district = addr.district || addr.area || '';
  const composed = `${province}${city}${district}${raw}`.trim();
  return composed || raw || '-';
}

function resolveReceiverName(row: ProcurementDetail) {
  return receiverName(parseAddress(row.deliveryAddress));
}

function resolveReceiverPhone(row: ProcurementDetail) {
  return receiverPhone(parseAddress(row.deliveryAddress));
}

function resolveReceiverAddress(row: ProcurementDetail) {
  return receiverAddress(parseAddress(row.deliveryAddress));
}

async function loadDetail() {
  loading.value = true;
  try {
    detail.value = await getSupplierOrderApi(id.value);
  } finally {
    loading.value = false;
  }
}

onMounted(loadDetail);
watch(id, loadDetail);
</script>

<template>
  <PageWrapper
    title="集采单详情"
    show-back
  >
    <template v-if="detail" #extra>
      <Badge :variant="orderStatusVariant">
        {{ orderStatusLabel }}
      </Badge>
    </template>

    <div v-if="loading" class="text-center text-muted-foreground py-12">加载中...</div>
    <div v-else-if="!detail" class="text-center text-muted-foreground py-16">集采单不存在或无访问权限</div>

    <div v-else class="space-y-5">
      <Card class="rounded-lg shadow-sm">
        <CardContent class="p-6">
          <h3 class="text-sm font-semibold mb-4">1. 集采单基础信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-xs text-muted-foreground mb-1">集采单号</div>
              <div class="font-mono">{{ detail.collectiveNo }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">下单时间</div>
              <div>{{ formatDateTime(detail.createTime) }}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-lg shadow-sm">
        <CardContent class="p-0">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-semibold">2. 采购明细</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/40 text-muted-foreground">
                <tr class="text-left">
                  <th class="px-4 py-3 font-medium">门店名称</th>
                  <th class="px-4 py-3 font-medium">收货人</th>
                  <th class="px-4 py-3 font-medium">联系电话</th>
                  <th class="px-4 py-3 font-medium">收货地址</th>
                  <th class="px-4 py-3 font-medium">商品名称</th>
                  <th class="px-4 py-3 font-medium text-right">采购总数量</th>
                  <th class="px-4 py-3 font-medium">单位</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in procurementDetails" :key="row.id" class="border-t border-border">
                  <td class="px-4 py-3">{{ row.storeName || '-' }}</td>
                  <td class="px-4 py-3">{{ resolveReceiverName(row) }}</td>
                  <td class="px-4 py-3">{{ resolveReceiverPhone(row) }}</td>
                  <td class="px-4 py-3 max-w-[320px] break-words">{{ resolveReceiverAddress(row) }}</td>
                  <td class="px-4 py-3">{{ row.productName }}</td>
                  <td class="px-4 py-3 text-right">{{ row.totalQty }}</td>
                  <td class="px-4 py-3">{{ row.unit || '-' }}</td>
                </tr>
                <tr v-if="!procurementDetails.length">
                  <td colspan="7" class="px-4 py-10 text-center text-muted-foreground">暂无采购明细</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-lg shadow-sm">
        <CardContent class="p-0">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-semibold">3. 商品汇总模块</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-sm">
              <thead class="bg-muted/40 text-muted-foreground">
                <tr class="text-left">
                  <th class="border-b border-r border-border px-4 py-3 font-medium last:border-r-0">商品名称</th>
                  <th class="border-b border-r border-border px-4 py-3 font-medium text-right last:border-r-0">供应商结算单价</th>
                  <th class="border-b border-border px-4 py-3 font-medium text-right">应收金额</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in summaryItems" :key="row.id">
                  <td class="border-b border-r border-border px-4 py-3">{{ row.productName }}</td>
                  <td class="border-b border-r border-border px-4 py-3 text-right">{{ formatCurrency(row.unitPrice) }}</td>
                  <td class="border-b border-border px-4 py-3 text-right font-medium">{{ formatCurrency(row.subtotal) }}</td>
                </tr>
                <tr v-if="!summaryItems.length">
                  <td colspan="3" class="border-b border-border px-4 py-10 text-center text-muted-foreground">暂无商品汇总</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  </PageWrapper>
</template>
