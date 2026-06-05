<script setup lang="ts">
/**
 * 供应商 - 自营商品库
 * - 维护本供应商 SKU 主数据，作为新建报价时的来源
 * - 新建/编辑跳转至 ProductForm 二级页面
 */
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Plus } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listSupplierProductsApi, toggleSupplierProductShelfApi, deleteSupplierProductApi } from '/@/api/supplier/quote';
import {
  SUPPLIER_PRODUCT_STATUS_LABEL, SUPPLIER_PRODUCT_STATUS_VARIANT, SUPPLIER_PRODUCT_STATUS_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatDateTime } from '/@/utils/format';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { SupplierProduct } from '/#/b2b-supplier';

const router = useRouter();


const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listSupplierProductsApi({ ...params, ...search });
}

const columns: BasicColumn[] = [
  { field: 'productName', title: '商品名称',align: 'center', minWidth: 120 },
  { field: 'brand', title: '品牌', align: 'center',width: 150 },
  { field: 'spec', title: '规格', align: 'center',width: 160 },
  { field: 'unit', title: '单位', align: 'center',width: 100 },
  { field: 'warehouseName', title: '仓库', align: 'center', width: 160, formatter: ({ row }) => row.warehouseName || row.warehouseId || '-' },
  { field: 'barcode', title: '条码',align: 'center', width: 180 },
  { field: 'status', title: '状态',align: 'center', width: 100, slots: { default: 'status' } },
  { field: 'createTime', title: '创建时间', align: 'center',width: 240, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 240, fixed: 'right', slots: { default: 'action' } },
];

function openCreate() { router.push(ROUTE_PATHS.SUPPLIER_PRODUCT_CREATE); }
function openEdit(row: SupplierProduct) { router.push({ path: ROUTE_PATHS.SUPPLIER_PRODUCT_EDIT.replace(':id', row.id) }); }

async function onShelf(row: SupplierProduct) {
  await toggleSupplierProductShelfApi(row.id, 1);
  reload();
}
async function offShelf(row: SupplierProduct) {
  await toggleSupplierProductShelfApi(row.id, 0);
  reload();
}
async function onDelete(row: SupplierProduct) {
  const res: any = await deleteSupplierProductApi(row.id);
  if (res?.success === false) return;
  reload();
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.status = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="商品库" subtitle="维护您的自营 SKU；启用商品才能创建报价">

    <template #extra>
      <Button v-auth="'b2b:supplier:product'" @click="openCreate">
        <Plus class="w-4 h-4 mr-1.5" />
        新建商品
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="名称 / 条码" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SUPPLIER_PRODUCT_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SUPPLIER_PRODUCT_STATUS_VARIANT[row.status]">{{ SUPPLIER_PRODUCT_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '编辑', authCode: 'b2b:supplier:product', onClick: () => openEdit(row) },
            { label: '启用', authCode: 'b2b:supplier:product', hidden: row.status === 1, onClick: () => onShelf(row) },
            { label: '停用', authCode: 'b2b:supplier:product', hidden: row.status === 0, onClick: () => offShelf(row) },
            { label: '删除', authCode: 'b2b:supplier:product', onClick: () => onDelete(row) },
          ]"
        />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
