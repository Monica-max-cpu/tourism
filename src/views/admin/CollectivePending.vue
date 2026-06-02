<script setup lang="ts">
/**
 * 平台管理员 - 待集采订单
 * 按 SKU 聚合展示，可勾选触发集采
 */
import { ref, onMounted } from 'vue';
import { GitMerge, Zap, AlertTriangle } from 'lucide-vue-next';
import { Badge, Button, Card, CardContent } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { listPendingCollectiveApi, triggerCollectiveApi } from '/@/api/admin/fulfillment';
import { formatCurrency, formatNumber } from '/@/utils/format';
import type { PendingCollectiveItem } from '/#/b2b-2c';

const [registerTable, { reload, getSelected }] = useTable();
const summary = ref({ total: 0, reachedThreshold: 0, totalProfit: 0 });
const selectedCount = ref(0);

async function loadData() {
  const res = await listPendingCollectiveApi();
  summary.value.total = res.records.length;
  summary.value.reachedThreshold = res.records.filter((x: PendingCollectiveItem) => x.reachedThreshold).length;
  summary.value.totalProfit = res.records.reduce((s: number, x: PendingCollectiveItem) => s + x.estimatedProfit, 0);
  return res;
}

const columns: BasicColumn[] = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  { field: 'productSku', title: 'SKU', width: 110 },
  { field: 'productName', title: '商品名称', minWidth: 220 },
  { field: 'orderCount', title: '关联订单', width: 90, align: 'right', formatter: ({ cellValue }) => `${cellValue} 笔` },
  { field: 'totalQty', title: '累计数量', width: 110, align: 'right', formatter: ({ cellValue, row }) => `${formatNumber(cellValue)} ${row.unit}` },
  { field: 'saleAmount', title: '销售额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'bestCostPrice', title: '最优成本价', width: 110, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue), authCode: 'b2b:settlement:profitList' },
  { field: 'estimatedProfit', title: '预估毛利', width: 130, align: 'right', slots: { default: 'profit' }, authCode: 'b2b:settlement:profitList' },
  { field: 'hoursSinceLast', title: '间隔时长', width: 100, slots: { default: 'hours' } },
  { field: 'reachedThreshold', title: '触发标识', width: 110, slots: { default: 'flag' } },
];

const triggerModal = useModal<{ ids: string[]; count: number }>();
const submitting = ref(false);

function onSelectionChange(rows: PendingCollectiveItem[]) {
  selectedCount.value = rows.length;
}

function openTrigger() {
  const rows = getSelected() as PendingCollectiveItem[];
  if (rows.length === 0) return;
  triggerModal.open({ ids: rows.map((r) => r.id), count: rows.length });
}

async function confirmTrigger() {
  if (!triggerModal.data.value) return;
  submitting.value = true;
  try {
    await triggerCollectiveApi(triggerModal.data.value.ids);
    triggerModal.close();
    selectedCount.value = 0;
    reload();
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {});
</script>

<template>
  <PageWrapper title="待集采订单" subtitle="按商品 SKU 聚合的门店订单，可手动触发集采">
    <template #extra>
      <Button v-auth="'b2b:collective:trigger'" :disabled="selectedCount === 0" @click="openTrigger">
        <Zap class="w-4 h-4 mr-1.5" />
        触发集采 <span v-if="selectedCount > 0" class="ml-1">({{ selectedCount }})</span>
      </Button>
    </template>

    <!-- 顶部统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <GitMerge class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs text-muted-foreground">待集采商品</div>
              <div class="text-2xl font-semibold">{{ summary.total }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs text-muted-foreground">已达阈值</div>
              <div class="text-2xl font-semibold">{{ summary.reachedThreshold }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card v-auth="'b2b:settlement:profitList'">
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Zap class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs text-muted-foreground">预估总毛利</div>
              <div class="text-2xl font-semibold text-[hsl(var(--status-success))]">{{ formatCurrency(summary.totalProfit) }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <BasicTable
      :columns="columns" :api="loadData" row-key="id"
      row-selection="checkbox"
      :pagination="false"
      @register="registerTable"
      @selection-change="onSelectionChange"
    >
      <template #profit="{ row }">
        <span class="text-[hsl(var(--status-success))] font-medium">{{ formatCurrency(row.estimatedProfit) }}</span>
      </template>
      <template #hours="{ row }">
        <span :class="row.hoursSinceLast >= 48 ? 'text-destructive font-medium' : 'text-muted-foreground'">
          {{ row.hoursSinceLast }} 小时
        </span>
      </template>
      <template #flag="{ row }">
        <Badge v-if="row.reachedThreshold" variant="warning">已达阈值</Badge>
        <Badge v-else-if="row.hoursSinceLast >= 48" variant="destructive">超时</Badge>
        <span v-else class="text-xs text-muted-foreground">-</span>
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="triggerModal.visible.value"
      title="触发集采"
      :description="`将为 ${triggerModal.data.value?.count || 0} 个商品创建集采单，系统自动选择最优成本报价的供应商`"
      confirm-text="确认触发"
      :confirm-loading="submitting"
      @confirm="confirmTrigger"
    />
  </PageWrapper>
</template>
