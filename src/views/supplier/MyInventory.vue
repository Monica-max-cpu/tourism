<script setup lang="ts">
/**
 * 供应商 - 我的库存
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存
 * - 仅展示本供应商库
 * - 当前仅支持补货入库；锁定库存待后端字段支持
 * - 预警阈值仅平台端维护，不在供应商端展示
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存
 */
import { reactive, ref, computed } from 'vue';
import { Input, Label } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listSupplierStocksApi, replenishStockApi } from '/@/api/supplier/inventory';
import { listSupplierProductsApi } from '/@/api/supplier/quote';
import type { SupplierStock } from '/#/b2b-supplier';


const search = reactive({ keyword: '' });
const [registerTable, { reload }] = useTable();

/** 从商品档案中补齐库存列表里不存在的商品（虚拟行，availableQty=0） */
async function mergeProductsIntoStocks(stocks: SupplierStock[]): Promise<SupplierStock[]> {
  const stockKeys = new Set(stocks.map((s) => `${s.supplierId || '__current__'}::${s.productId}`));
  const productRes: any = await listSupplierProductsApi({
    pageNo: 1, pageSize: 999,
  });
  const productList: any[] = Array.isArray(productRes) ? productRes : (productRes?.records || []);
  const virtualRows: SupplierStock[] = [];
  const currentSupplierId = stocks[0]?.supplierId || '';

  for (const p of productList) {
    const pid = p.id || '';
    const key = `${currentSupplierId || '__current__'}::${pid}`;
    if (!pid || stockKeys.has(key)) continue;
    virtualRows.push({
      id: '',
      supplierId: currentSupplierId,
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
  const query: any = { ...params };
  if (search.keyword) query.keyword = search.keyword;
  const res: any = await listSupplierStocksApi(query);
  let stocks: SupplierStock[] = [];
  if (Array.isArray(res)) {
    stocks = res;
  } else {
    stocks = res?.records || [];
  }
  const merged = await mergeProductsIntoStocks(stocks);
  return { records: merged, total: merged.length };
}

const columns: BasicColumn[] = [
  // { field: 'productSku', title: 'SKU', width: 130 },
  { field: 'productName', title: '商品名称', minWidth: 180 },
  // { field: 'warehouseName', title: '仓库', width: 200 },
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
function onReset() { search.keyword = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="我的库存" subtitle="当前仅支持补货入库；锁定库存字段待后端支持，预警阈值仅平台端维护">

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="名称" class="w-60" @keyup.enter="onSearch" />
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
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
      title="补货入库"
      :description="qtyModal.data.value ? `${qtyModal.data.value.productName}（${qtyModal.data.value.productSku}）` : ''"
      :confirm-loading="submitting"
      :confirm-disabled="!qtyValid"
      @confirm="confirmQty"
    >
      <div class="space-y-2">
        <Label>补货后可用库存（{{ qtyModal.data.value?.unit || '-' }}）</Label>
        <Input :model-value="qtyValue" @update:model-value="onQtyInput" type="number" min="0" />
        <p class="text-xs text-muted-foreground">这里只调整可用库存，锁定库存会在后端补齐字段后再展示。</p>
      </div>
    </BasicModal>

  </PageWrapper>
</template>
