<script setup lang="ts">
/**
 * 平台管理员 - 库存流水
 */
import { reactive } from 'vue';
import { useRoute } from 'vue-router';
import { Badge, Input, Label } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { SearchBar } from '/@/components/SearchBar';
import { listStockLogsApi } from '/@/api/admin/operations';
import { formatDateTime } from '/@/utils/format';
import type { StockLogRecord } from '/#/b2b-2b';

const route = useRoute();
const [registerTable, { reload }] = useTable();

const search = reactive({
  keyword: String(route.query.keyword || ''),
  supplierId: String(route.query.supplierId || ''),
  productId: String(route.query.productId || ''),
  warehouseId: String(route.query.warehouseId || ''),
});

const CHANGE_TYPE_LABEL: Record<string, string> = {
  IN: '入库',
  OUT: '出库',
  DEDUCT: '扣减',
  LOCK: '锁定',
  UNLOCK: '释放锁定',
  REPLENISH: '补货',
  SALE: '销售出库',
  ORDER_LOCK: '订单锁定',
  ORDER_CANCEL: '订单取消',
  ADJUST: '库存调整',
};

const CHANGE_TYPE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  IN: 'default',
  REPLENISH: 'default',
  OUT: 'destructive',
  DEDUCT: 'destructive',
  SALE: 'destructive',
  LOCK: 'secondary',
  ORDER_LOCK: 'secondary',
  UNLOCK: 'outline',
  ORDER_CANCEL: 'outline',
  ADJUST: 'secondary',
};

function normalizeLog(row: any): StockLogRecord {
  return {
    ...row,
    id: row.id || row.logId,
    supplierName: row.supplierName || '-',
    productName: row.productName || row.productId || '-',
    warehouseName: row.warehouseName || row.warehouseId || '-',
    changeType: row.changeType || row.type,
    changeQty: row.changeQty ?? row.qty ?? row.quantity ?? 0,
    beforeAvailableQty: row.beforeAvailableQty ?? row.beforeAvailable ?? row.beforeQty ?? 0,
    afterAvailableQty: row.afterAvailableQty ?? row.afterAvailable ?? row.afterQty ?? 0,
    relatedNo: row.relatedNo || row.bizNo || row.orderNo || row.documentNo || '-',
    remark: row.remark || row.memo || '-',
    time: row.time || row.createTime || row.createdAt,
  };
}

async function loadData(params: any) {
  const query: any = { ...params };
  if (search.keyword) query.keyword = search.keyword;
  if (search.supplierId) query.supplierId = search.supplierId;
  if (search.productId) query.productId = search.productId;
  if (search.warehouseId) query.warehouseId = search.warehouseId;

  const res: any = await listStockLogsApi(query);
  const records = Array.isArray(res) ? res : res?.records || [];
  return {
    records: records.map(normalizeLog),
    total: Array.isArray(res) ? res.length : res?.total ?? records.length,
  };
}

const columns: BasicColumn[] = [
  { field: 'supplierName', title: '供应商', minWidth: 180, showOverflow: 'tooltip' },
  { field: 'productName', title: '商品', minWidth: 200, showOverflow: 'tooltip' },
  { field: 'warehouseName', title: '仓库', minWidth: 160, showOverflow: 'tooltip' },
  { field: 'changeType', title: '变动类型', width: 130, align: 'center', slots: { default: 'changeType' } },
  { field: 'changeQty', title: '变动数量', width: 120, align: 'right' },
  { field: 'beforeAvailableQty', title: '变动前可用', width: 130, align: 'right' },
  { field: 'afterAvailableQty', title: '变动后可用', width: 130, align: 'right' },
  { field: 'relatedNo', title: '关联单据', minWidth: 170, showOverflow: 'tooltip' },
  { field: 'time', title: '时间', width: 180, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'remark', title: '备注', minWidth: 200, showOverflow: 'tooltip' },
];

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = '';
  search.supplierId = '';
  search.productId = '';
  search.warehouseId = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="库存流水" subtitle="查看库存入库、出库、锁定、释放与调整记录">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="商品 / 供应商 / 单据" class="w-64" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">供应商</Label>
        <Input v-model="search.supplierId" placeholder="供应商" class="w-44" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">商品ID</Label>
        <Input v-model="search.productId" placeholder="商品ID" class="w-44" @keyup.enter="onSearch" />
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #changeType="{ row }">
        <Badge :variant="CHANGE_TYPE_VARIANT[row.changeType] || 'outline'">
          {{ CHANGE_TYPE_LABEL[row.changeType] || row.changeType || '-' }}
        </Badge>
      </template>
    </BasicTable>
  </PageWrapper>
</template>
