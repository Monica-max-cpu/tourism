<script setup lang="ts">
import { computed, ref } from 'vue';
import { GitMerge, Zap, Package, Clock } from 'lucide-vue-next';
import { Button, Card, CardContent } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { listPendingCollectiveApi, triggerCollectiveApi } from '/@/api/admin/fulfillment';
import { formatNumber } from '/@/utils/format';

interface PendingOrderGroup {
  catalogId: string;
  productName: string;
  unit: string;
  totalQty: number;
  storeCount: number;
  orderCount: number;
  earliestOrderTime?: string;
  preferredQuoteId?: string;
  supplierId?: string;
  supplierName?: string;
}

const [registerTable, { reload, getSelected, clearSelection }] = useTable();
const records = ref<PendingOrderGroup[]>([]);
const selectedCount = ref(0);

const summary = computed(() => ({
  total: records.value.length,
  totalQty: records.value.reduce((sum, row) => sum + (row.totalQty || 0), 0),
  orderCount: records.value.reduce((sum, row) => sum + (row.orderCount || 0), 0),
}));

async function loadData() {
  const list = await listPendingCollectiveApi();
  records.value = Array.isArray(list) ? list : (list?.records || []);
  return { records: records.value, total: records.value.length };
}

const columns: BasicColumn[] = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  // { field: 'catalogId', title: '目录商品ID', width: 180, showOverflow: 'tooltip' },
  { field: 'productName', title: '商品名称', minWidth: 220 },
  { field: 'supplierName', title: '供应商', width:280, showOverflow: 'tooltip', formatter: ({ row }) => row.supplierName || '-' },
  // { field: 'preferredQuoteId', title: '推荐报价ID', width: 180, showOverflow: 'tooltip', formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'totalQty', title: '待采购数量', width: 280, align: 'right', formatter: ({ cellValue, row }) => `${formatNumber(cellValue)} ${row.unit}` },
  { field: 'storeCount', title: '涉及门店', width: 280, align: 'right' },
  { field: 'orderCount', title: '涉及订单', width: 280, align: 'right' },
  // { field: 'earliestOrderTime', title: '最早支付时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
];

const triggerModal = useModal<{ rows: PendingOrderGroup[] }>();
const submitting = ref(false);

function onSelectionChange(rows: PendingOrderGroup[]) {
  selectedCount.value = rows.length;
}

function openTrigger() {
  const rows = getSelected() as PendingOrderGroup[];
  if (!rows.length) return;
  triggerModal.open({ rows });
}

async function confirmTrigger() {
  const rows = triggerModal.data.value?.rows || [];
  if (!rows.length) return;
  submitting.value = true;
  try {
    await Promise.all(rows.map((row) => triggerCollectiveApi({
      triggerMode: 'BY_CATALOG',
      catalogId: row.catalogId,
      supplierQuoteId: row.preferredQuoteId,
    })));
    triggerModal.close();
    clearSelection();
    selectedCount.value = 0;
    reload();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <PageWrapper title="待集采订单" subtitle="后端按目录商品聚合已支付待集采的门店订单明细">
    <template #extra>
      <Button v-auth="'b2b:collective:trigger'" :disabled="selectedCount === 0" @click="openTrigger">
        <Zap class="w-4 h-4 mr-1.5" />
        触发集采 <span v-if="selectedCount > 0" class="ml-1">({{ selectedCount }})</span>
      </Button>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card class="rounded-lg shadow-sm">
        <CardContent class="p-5 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <GitMerge class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xs text-muted-foreground">待集采商品</div>
            <div class="text-2xl font-semibold">{{ summary.total }}</div>
          </div>
        </CardContent>
      </Card>
      <Card class="rounded-lg shadow-sm">
        <CardContent class="p-5 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Package class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xs text-muted-foreground">待采购数量</div>
            <div class="text-2xl font-semibold">{{ formatNumber(summary.totalQty) }}</div>
          </div>
        </CardContent>
      </Card>
      <Card class="rounded-lg shadow-sm">
        <CardContent class="p-5 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Clock class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xs text-muted-foreground">涉及订单</div>
            <div class="text-2xl font-semibold">{{ summary.orderCount }}</div>
          </div>
        </CardContent>
      </Card>
    </div>

    <BasicTable
      :columns="columns"
      :api="loadData"
      row-key="catalogId"
      row-selection="checkbox"
      :pagination="false"
      @register="registerTable"
      @selection-change="onSelectionChange"
    />

    <BasicModal
      v-model:open="triggerModal.visible.value"
      title="触发集采"
      :description="`将为 ${triggerModal.data.value?.rows.length || 0} 个目录商品按后端 BY_CATALOG 模式生成集采单`"
      confirm-text="确认触发"
      :confirm-loading="submitting"
      @confirm="confirmTrigger"
    />
  </PageWrapper>
</template>
