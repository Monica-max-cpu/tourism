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
import { listSupplierStocksApi, replenishStockApi } from '/@/api/supplier/inventory';
import { listSupplierProductsApi } from '/@/api/supplier/quote';
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

/** 从商品档案中补齐库存列表里不存在的商品（虚拟行，availableQty=0） */
async function mergeProductsIntoStocks(stocks: SupplierStock[]): Promise<SupplierStock[]> {
  if (!supplierId.value) return stocks;

  const stockProductIds = new Set(stocks.map((s) => s.productId));
  const productRes: any = await listSupplierProductsApi({
    pageNo: 1, pageSize: 999,
    supplierId: supplierId.value,
  });
  const productList: any[] = Array.isArray(productRes) ? productRes : (productRes?.records || []);
  const virtualRows: SupplierStock[] = [];

  for (const p of productList) {
    const pid = p.id || '';
    if (!pid || stockProductIds.has(pid)) continue;
    virtualRows.push({
      id: '',
      productId: pid,
      productName: p.productName || '',
      productSku: p.sku || '',
      unit: p.unit || '',
      warehouseId: '',
      warehouseName: '',
      availableQty: 0,
      lockedQty: 0,
      warnThreshold: 0,
      health: 'LOW',
      updatedAt: '',
      _virtual: true,
    } as unknown as SupplierStock);
  }

  return [...stocks, ...virtualRows];
}

async function loadData(params: any) {
  const query: any = { ...params, supplierId: supplierId.value };
  if (search.keyword) query.keyword = search.keyword;
  if (search.health) query.health = search.health;
  const res: any = await listSupplierStocksApi(query);
  let stocks: SupplierStock[] = [];
  let total = 0;
  if (Array.isArray(res)) {
    stocks = res;
    total = res.length;
  } else {
    stocks = res?.records || [];
    total = res?.total || 0;
  }
  const merged = await mergeProductsIntoStocks(stocks);
  return { records: merged, total: total + (merged.length - stocks.length) };
}

const columns: BasicColumn[] = [
  // { field: 'productSku', title: 'SKU', width: 130 },
  { field: 'productName', title: '商品名称', minWidth: 180 },
  { field: 'warehouseName', title: '仓库', width: 200 },
  // { field: 'unit', title: '单位', width: 180 },
  { field: 'availableQty', title: '可用库存', width: 200, align: 'center' },
  // { field: 'lockedQty', title: '锁定库存', width: 100, align: 'right' },
  // { field: 'warnThreshold', title: '预警阈值', width: 100, align: 'right' },
  // { field: 'health', title: '健康度', width: 90, slots: { default: 'health' } },
  // { field: 'updatedAt', title: '更新时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 280, fixed: 'right', slots: { default: 'action' } },
];

// ====== 调整库存 ======
const qtyModal = useModal<SupplierStock>();
const qtyValue = ref(0);
const qtyValid = computed(() => Number.isFinite(qtyValue.value) && qtyValue.value >= 0);
const submitting = ref(false);

function openQty(row: SupplierStock) { qtyValue.value = row.availableQty; qtyModal.open(row); }
function onQtyInput(v: any) {
  const n = Number(v);
  qtyValue.value = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}
async function confirmQty() {
  if (!qtyModal.data.value || !qtyValid.value) return;
  submitting.value = true;
  try {
    const row = qtyModal.data.value as any;
    await replenishStockApi({
      supplierId: supplierId.value,
      productId: row.productId,
      warehouseId: row.warehouseId || undefined,
      qty: qtyValue.value,
    });
    qtyModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.health = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="我的库存" subtitle="维护可用库存；锁定库存由集采系统自动占用">

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="名称" class="w-60" @keyup.enter="onSearch" />
      </div>
      <!-- <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">健康度</Label>
        <Select v-model="search.health">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SUPPLIER_STOCK_HEALTH_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div> -->
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #health="{ row }">
        <Badge :variant="SUPPLIER_STOCK_HEALTH_VARIANT[row.health]">{{ SUPPLIER_STOCK_HEALTH_LABEL[row.health] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '补货入库', authCode: 'b2b:supplier:stock', onClick: () => openQty(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="qtyModal.visible.value"
      title="调整可用库存"
      :description="qtyModal.data.value ? `${qtyModal.data.value.productName}（${qtyModal.data.value.productSku}）` : ''"
      :confirm-loading="submitting"
      :confirm-disabled="!qtyValid"
      @confirm="confirmQty"
    >
      <div class="space-y-2">
        <Label>新可用库存（{{ qtyModal.data.value?.unit || '-' }}）</Label>
        <Input :model-value="qtyValue" @update:model-value="onQtyInput" type="number" min="0" />
      </div>
    </BasicModal>

  </PageWrapper>
</template>
