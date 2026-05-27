<script setup lang="ts">
/**
 * 平台管理员 - 库存管理
 * 全量视角：可平台+ 供应+ 门店 库存
 */
import { reactive, ref } from 'vue';
import {
  Badge, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listStocksApi, updateStockThresholdApi } from '/@/api/admin/operations';
import {
  STOCK_HEALTH_LABEL, STOCK_HEALTH_VARIANT, STOCK_HEALTH_OPTIONS,
} from '/@/constants/b2b2bStatus';
import { formatDateTime } from '/@/utils/format';
import type { StockRecord, StockHealthLevel } from '/#/b2b-2b';

function calcHealth(available: number, alertQty: number): StockHealthLevel {
  if (available <= 0) return 'OUT';
  if (available < alertQty) return 'LOW';
  return 'NORMAL';
}

const search = reactive({ keyword: '', health: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const query: any = { ...params };
  if (search.keyword) query.keyword = search.keyword;
  if (search.health) query.health = search.health;
  const res: any = await listStocksApi(query);
  let records: any[] = res?.records || [];
  records = records.map((r: any) => ({
    ...r,
    health: r.health || calcHealth(r.availableQty ?? 0, r.alertQty ?? 0),
  }));
  return { records, total: res?.total ?? 0 };
}

const columns: BasicColumn[] = [
  { field: 'supplierName', title: '供应商', minWidth: 180 },
  { field: 'productName', title: '商品名称', minWidth: 200 },
  { field: 'availableQty', title: '可用库存', width: 130, align: 'right' },
  { field: 'lockedQty', title: '锁定库存', width: 130, align: 'right' },
  { field: 'totalQty', title: '总库存', width: 130, align: 'right' },
  { field: 'alertQty', title: '预警阈值', width: 130, align: 'right' },
  { field: 'health', title: '状态', width: 130, slots: { default: 'health' } },
  { field: 'updateTime', title: '更新时间', width: 250, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 180, fixed: 'right', slots: { default: 'action' } },
];

const editModal = useModal<StockRecord>();
const editForm = reactive({ threshold: 0 });
const submitting = ref(false);

function openEdit(row: StockRecord) {
  editModal.open(row);
  editForm.threshold = row.alertQty;
}

async function saveEdit() {
  if (!editModal.data.value) return;
  submitting.value = true;
  try {
    await updateStockThresholdApi(editModal.data.value.id, Number(editForm.threshold));
    editModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = ''; search.health = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="库存管理" subtitle="平台/ 供应/ 门店 全量库存视图">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="商品名 / 供应商" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">健康状态</Label>
        <Select v-model="search.health">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in STOCK_HEALTH_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #health="{ row }">
        <Badge :variant="STOCK_HEALTH_VARIANT[row.health]">{{ STOCK_HEALTH_LABEL[row.health] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction :actions="[{ label: '编辑预警', onClick: () => openEdit(row) }]" />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="editModal.visible.value"
      title="编辑预警阈值"
      :description="editModal.data.value?.productName"
      width="420px"
      confirm-text="保存"
      :confirm-loading="submitting"
      @confirm="saveEdit"
    >
      <div class="space-y-4 text-sm">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label class="text-xs text-muted-foreground">供应商</Label>
            <div class="mt-1">{{ editModal.data.value?.supplierName || '-' }}</div>
          </div>
          <div>
            <Label class="text-xs text-muted-foreground">当前可用库存</Label>
            <div class="mt-1 font-medium">{{ editModal.data.value?.availableQty ?? '-' }}</div>
          </div>
        </div>

        <div class="space-y-2">
          <Label>预警阈值<span class="text-destructive">*</span></Label>
          <Input v-model.number="editForm.threshold" type="number" min="0" />
          <p class="text-xs text-muted-foreground">当可用库存低于该值时，将在工作台触发库存预警</p>
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
