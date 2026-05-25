<script setup lang="ts">
/**
 * 平台管理员 - 库存管理
 * 全量视角：可平台+ 供应+ 门店 库存
 */
import { reactive, ref } from 'vue';
import {
  Badge, Button, Input, Label,
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
  STOCK_OWNER_LABEL, STOCK_OWNER_OPTIONS,
} from '/@/constants/b2b2bStatus';
import { formatDateTime, formatNumber } from '/@/utils/format';
import type { StockRecord } from '/#/b2b-2b';

const search = reactive({ keyword: '', ownerType: '', health: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listStocksApi({ ...params, searchInfo: { ...search } });
}

const columns: BasicColumn[] = [
  { field: 'productSku', title: 'SKU', width: 110 },
  { field: 'productName', title: '商品名称', minWidth: 220 },
  { field: 'category', title: '分类', width: 90 },
  { field: 'ownerType', title: '归属', width: 100, formatter: ({ cellValue }) => STOCK_OWNER_LABEL[cellValue as keyof typeof STOCK_OWNER_LABEL] },
  { field: 'ownerName', title: '归属方', minWidth: 180 },
  { field: 'warehouseName', title: '仓库', width: 110 },
  { field: 'availableQty', title: '可用库存', width: 100, align: 'right', formatter: ({ cellValue, row }) => `${formatNumber(cellValue)} ${row.unit}` },
  { field: 'lockedQty', title: '锁定库存', width: 100, align: 'right', formatter: ({ cellValue, row }) => `${formatNumber(cellValue)} ${row.unit}` },
  { field: 'warnThreshold', title: '预警阈值', width: 100, align: 'right', formatter: ({ cellValue, row }) => `${formatNumber(cellValue)} ${row.unit}` },
  { field: 'health', title: '状态', width: 90, slots: { default: 'health' } },
  { field: 'updatedAt', title: '更新时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 120, fixed: 'right', slots: { default: 'action' } },
];

const editModal = useModal<StockRecord>();
const editForm = reactive({ threshold: 0 });
const submitting = ref(false);

function openEdit(row: StockRecord) {
  editModal.open(row);
  editForm.threshold = row.warnThreshold;
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
  search.keyword = ''; search.ownerType = ''; search.health = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="库存管理" subtitle="平台/ 供应/ 门店 全量库存视图">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="商品名/ SKU / 归属方" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">归属</Label>
        <Select v-model="search.ownerType">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in STOCK_OWNER_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
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
            <Label class="text-xs text-muted-foreground">归属</Label>
            <div class="mt-1">{{ editModal.data.value && STOCK_OWNER_LABEL[editModal.data.value.ownerType] }} - {{ editModal.data.value?.ownerName }}</div>
          </div>
          <div>
            <Label class="text-xs text-muted-foreground">当前可用库存</Label>
            <div class="mt-1 font-medium">{{ formatNumber(editModal.data.value?.availableQty) }} {{ editModal.data.value?.unit }}</div>
          </div>
        </div>

        <div class="space-y-2">
          <Label>预警阈值（{{ editModal.data.value?.unit }}）<span class="text-destructive">*</span></Label>
          <Input v-model.number="editForm.threshold" type="number" min="0" />
          <p class="text-xs text-muted-foreground">当可用库存低于该值时，将在工作台触发库存预警</p>
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
