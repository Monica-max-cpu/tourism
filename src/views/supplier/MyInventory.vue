<script setup lang="ts">
/**
 * 供应商 - 我的库存
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存
 * - 仅展示本供应商库 * - 支持调整可用库存与预警阈 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存
 */
import { reactive, ref, computed } from 'vue';
import {
  Badge, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listSupplierStocksApi, updateSupplierStockQtyApi, updateSupplierStockThresholdApi } from '/@/api/supplier/inventory';
import {
  SUPPLIER_STOCK_HEALTH_LABEL, SUPPLIER_STOCK_HEALTH_VARIANT, SUPPLIER_STOCK_HEALTH_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatDateTime } from '/@/utils/format';
import { useUserStore } from '/@/stores/modules/user';
import type { SupplierStock } from '/#/b2b-supplier';

const userStore = useUserStore();
const supplierId = computed(() => userStore.getUserInfo?.supplierId || '');

const search = reactive({ keyword: '', health: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listSupplierStocksApi({ ...params, searchInfo: { ...search, supplierId: supplierId.value } });
}

const columns: BasicColumn[] = [
  { field: 'productSku', title: 'SKU', width: 130 },
  { field: 'productName', title: '商品名称', minWidth: 180 },
  { field: 'warehouseName', title: '仓库', width: 120 },
  { field: 'unit', title: '单位', width: 70 },
  { field: 'availableQty', title: '可用库存', width: 100, align: 'right' },
  { field: 'lockedQty', title: '锁定库存', width: 100, align: 'right' },
  { field: 'warnThreshold', title: '预警阈值', width: 100, align: 'right' },
  { field: 'health', title: '健康度', width: 90, slots: { default: 'health' } },
  { field: 'updatedAt', title: '更新时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 180, fixed: 'right', slots: { default: 'action' } },
];

// ====== 调整库存 ======
const qtyModal = useModal<SupplierStock>();
const qtyValue = ref(0);
const submitting = ref(false);

function openQty(row: SupplierStock) { qtyValue.value = row.availableQty; qtyModal.open(row); }
async function confirmQty() {
  if (!qtyModal.data.value || qtyValue.value < 0) return;
  submitting.value = true;
  try {
    await updateSupplierStockQtyApi(qtyModal.data.value.id, qtyValue.value);
    qtyModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

// ====== 调整阈======
const thresholdModal = useModal<SupplierStock>();
const thresholdValue = ref(0);
function openThreshold(row: SupplierStock) { thresholdValue.value = row.warnThreshold; thresholdModal.open(row); }
async function confirmThreshold() {
  if (!thresholdModal.data.value || thresholdValue.value < 0) return;
  submitting.value = true;
  try {
    await updateSupplierStockThresholdApi(thresholdModal.data.value.id, thresholdValue.value);
    thresholdModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.health = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="我的库存" subtitle="维护可用库存与预警阈值；锁定库存由集采系统自动占用">

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="名称 / SKU" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">健康度</Label>
        <Select v-model="search.health">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SUPPLIER_STOCK_HEALTH_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #health="{ row }">
        <Badge :variant="SUPPLIER_STOCK_HEALTH_VARIANT[row.health]">{{ SUPPLIER_STOCK_HEALTH_LABEL[row.health] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '调整库存', authCode: 'b2b:supplier:stock', onClick: () => openQty(row) },
            { label: '改阈值', authCode: 'b2b:supplier:stock', onClick: () => openThreshold(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="qtyModal.visible.value"
      title="调整可用库存"
      :description="qtyModal.data.value ? `${qtyModal.data.value.productName}（${qtyModal.data.value.productSku}）` : ''"
      :confirm-loading="submitting"
      @confirm="confirmQty"
    >
      <div class="space-y-2">
        <Label>新可用库存（{{ qtyModal.data.value?.unit || '-' }}）</Label>
        <Input v-model.number="qtyValue" type="number" min="0" />
      </div>
    </BasicModal>

    <BasicModal
      v-model:open="thresholdModal.visible.value"
      title="调整预警阈值"
      :description="thresholdModal.data.value ? `${thresholdModal.data.value.productName}（${thresholdModal.data.value.productSku}）` : ''"
      :confirm-loading="submitting"
      @confirm="confirmThreshold"
    >
      <div class="space-y-2">
        <Label>预警阈值（低于此值标记为「不足」）</Label>
        <Input v-model.number="thresholdValue" type="number" min="0" />
      </div>
    </BasicModal>
  </PageWrapper>
</template>
