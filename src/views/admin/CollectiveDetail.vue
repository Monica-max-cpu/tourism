<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Badge, Card, CardContent } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { getCollectiveOrderApi } from '/@/api/admin/fulfillment';
import {
  COLLECTIVE_ORDER_STATUS_LABEL,
  COLLECTIVE_ORDER_STATUS_VARIANT,
  collectiveTriggerTypeLabel,
} from '/@/constants/b2b2cStatus';
import { formatCurrency, formatDate, formatDateTime } from '/@/utils/format';

interface CollectiveDetailItem {
  id: string;
  productName: string;
  unit: string;
  totalQty: number;
  deliveredQty: number;
  unitPrice: number;
  subtotal: number;
}

interface StoreBreakdown {
  storeId: string;
  storeName?: string;
  catalogId: string;
  productName?: string;
  quantity: number;
  actualPrice: number;
  subtotal: number;
}

interface CollectiveDetail {
  id: string;
  collectiveNo: string;
  supplierId: string;
  supplierName?: string;
  orderStatus: number;
  totalAmount: number;
  orderCount: number;
  triggerType?: string;
  confirmTime?: string;
  expectedDeliveryDate?: string;
  createTime?: string;
  items?: CollectiveDetailItem[];
  storeBreakdown?: StoreBreakdown[];
}

const route = useRoute();
const id = computed(() => route.params.id as string);
const detail = ref<CollectiveDetail | null>(null);
const loading = ref(false);

async function loadDetail() {
  loading.value = true;
  try {
    detail.value = await getCollectiveOrderApi(id.value);
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
    :subtitle="detail ? `${detail.collectiveNo} · 预计发货 ${formatDate(detail.expectedDeliveryDate)}` : ''"
    show-back
  >
    <template v-if="detail" #extra>
      <Badge :variant="COLLECTIVE_ORDER_STATUS_VARIANT[detail.orderStatus] || 'warning'">
        {{ COLLECTIVE_ORDER_STATUS_LABEL[detail.orderStatus] || '-' }}
      </Badge>
    </template>

    <div v-if="loading" class="text-center text-muted-foreground py-12">加载中...</div>
    <div v-else-if="!detail" class="text-center text-muted-foreground py-16">集采单不存在或无访问权限</div>

    <div v-else class="space-y-5">
      <Card class="rounded-lg shadow-sm">
        <CardContent class="p-6">
          <h3 class="text-sm font-semibold mb-4">集采单信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div class="text-xs text-muted-foreground mb-1">集采单号</div>
              <div class="font-mono">{{ detail.collectiveNo }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">供应商</div>
              <div>{{ detail.supplierName || '-' }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">关联订单数</div>
              <div>{{ detail.orderCount }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">集采金额</div>
              <div class="font-semibold text-primary">{{ formatCurrency(detail.totalAmount) }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">触发方式</div>
              <div>{{ collectiveTriggerTypeLabel(detail.triggerType) }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">接单时间</div>
              <div>{{ formatDateTime(detail.confirmTime) }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">预计发货日期</div>
              <div>{{ formatDate(detail.expectedDeliveryDate) }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">创建时间</div>
              <div>{{ formatDateTime(detail.createTime) }}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-lg shadow-sm">
        <CardContent class="p-0">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-semibold">集采商品明细</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/40 text-muted-foreground">
                <tr class="text-left">
                  <th class="px-4 py-3 font-medium">商品</th>
                  <th class="px-4 py-3 font-medium text-right">集采数量</th>
                  <th class="px-4 py-3 font-medium text-right">已发数量</th>
                  <th class="px-4 py-3 font-medium text-right">单价</th>
                  <th class="px-4 py-3 font-medium text-right">小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in detail.items || []" :key="item.id" class="border-t border-border">
                  <td class="px-4 py-3">
                    <div class="font-medium">{{ item.productName }}</div>
                    <div class="text-xs text-muted-foreground">{{ item.unit }}</div>
                  </td>
                  <td class="px-4 py-3 text-right">{{ item.totalQty }} {{ item.unit }}</td>
                  <td class="px-4 py-3 text-right">{{ item.deliveredQty ?? 0 }} {{ item.unit }}</td>
                  <td class="px-4 py-3 text-right">{{ formatCurrency(item.unitPrice) }}</td>
                  <td class="px-4 py-3 text-right font-medium">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
                <tr v-if="!detail.items?.length">
                  <td colspan="5" class="px-4 py-10 text-center text-muted-foreground">暂无商品明细</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-lg shadow-sm">
        <CardContent class="p-0">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-semibold">关联门店订单拆分</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/40 text-muted-foreground">
                <tr class="text-left">
                  <th class="px-4 py-3 font-medium">门店</th>
                  <th class="px-4 py-3 font-medium">商品</th>
                  <th class="px-4 py-3 font-medium text-right">数量</th>
                  <th class="px-4 py-3 font-medium text-right">成交价</th>
                  <th class="px-4 py-3 font-medium text-right">小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in detail.storeBreakdown || []" :key="`${row.storeId}-${row.catalogId}`" class="border-t border-border">
                  <td class="px-4 py-3">{{ row.storeName || '-' }}</td>
                  <td class="px-4 py-3">{{ row.productName || row.catalogId }}</td>
                  <td class="px-4 py-3 text-right">{{ row.quantity }}</td>
                  <td class="px-4 py-3 text-right">{{ formatCurrency(row.actualPrice) }}</td>
                  <td class="px-4 py-3 text-right font-medium">{{ formatCurrency(row.subtotal) }}</td>
                </tr>
                <tr v-if="!detail.storeBreakdown?.length">
                  <td colspan="5" class="px-4 py-10 text-center text-muted-foreground">暂无门店拆分数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  </PageWrapper>
</template>
