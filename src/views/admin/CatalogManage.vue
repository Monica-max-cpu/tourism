<script setup lang="ts">
/**
 * 平台管理员 - 平台商品目录
 * update-begin--author:claude---date:2026-05-27---for:【弹窗改页面】新建/编辑移入独立路由页面 CatalogForm
 * update-end--author:claude---date:2026-05-27---for:【弹窗改页面】新建/编辑移入独立路由页面 CatalogForm
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
import { listCatalogsApi, toggleShelfApi } from '/@/api/admin';
import { CATALOG_STATUS_LABEL, CATALOG_STATUS_VARIANT, CATALOG_STATUS_OPTIONS } from '/@/constants/b2bStatus';
import { storeCategoryLabel } from '/@/constants/storeStatus';
import { formatCurrency } from '/@/utils/format';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { PlatformCatalog } from '/#/b2b';

const router = useRouter();
const search = reactive({ keyword: '', status: '', categoryId: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listCatalogsApi({ ...params, ...search });
}

const columns: BasicColumn[] = [
  { field: 'productName', title: '商品名称', minWidth: 200 },
   { field: 'basePrice', title: '售价', width: 120, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'minOrderQty', title: '起订量', width: 120, align: 'center' },
  { field: 'categoryId', title: '分类', width: 120, formatter: ({ cellValue }) => storeCategoryLabel(cellValue) },
  { field: 'unit', title: '单位', width: 100, align: 'center' },
  { field: 'catalogTiers', title: '档位', width: 100, align: 'center', formatter: ({ row }) => {
    return row.catalogTiers && row.catalogTiers.length > 0 ? `${row.catalogTiers.length} 档` : '-';
  } },
  { field: 'catalogTiersDetail', title: '档位详情', width: 300, formatter: ({ row }) => {
    if (!row.catalogTiers || row.catalogTiers.length === 0) return `${row.minOrderQty}件起 ${formatCurrency(row.basePrice)}`;
    return row.catalogTiers.map((t: any) => {
      const qty = t.maxQty != null ? `${t.minQty}~${t.maxQty}件` : `${t.minQty}件以上`;
      return `${qty}：${formatCurrency(t.unitPrice)}`;
    }).join('，');
  } },
  {
    field: 'supplierBasePrice', title: '成本价', width: 110, align: 'right',
    formatter: ({ cellValue }) => formatCurrency(cellValue),
    authCode: 'b2b:settlement:profitList',
  },
  // {
  //   field: 'marginRate', title: '毛利率', width: 90, align: 'center',
  //   formatter: ({ row }) => row.marginRate ? (row.marginRate * 100).toFixed(1) + '%' : '-',
  //   authCode: 'b2b:settlement:profitList',
  // },
  { field: 'status', title: '状态', width: 180, align: 'center', slots: { default: 'status' } },
  { field: 'action', title: '操作', width: 260, fixed: 'right', slots: { default: 'action' } },
];

function openCreate() {
  router.push(ROUTE_PATHS.ADMIN_CATALOG_CREATE);
}

function openEdit(row: PlatformCatalog) {
  router.push({ path: ROUTE_PATHS.ADMIN_CATALOG_EDIT.replace(':id', row.id) });
}

async function onShelf(row: PlatformCatalog) {
  await toggleShelfApi(row.id, 1);
  reload();
}
async function offShelf(row: PlatformCatalog) {
  await toggleShelfApi(row.id, 0);
  reload();
}
async function markSoldOut(row: PlatformCatalog) {
  await toggleShelfApi(row.id, 2);
  reload();
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = ''; search.status = ''; search.categoryId = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="平台商品目录" subtitle="管理平台对外销售的商品（刊价 = 门店看到的价格）">

    <template #extra>
      <Button v-auth="'b2b:catalog:edit'" @click="openCreate">
        <Plus class="w-4 h-4 mr-1.5" />
        新建目录商品
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="商品名" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-36"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in CATALOG_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="CATALOG_STATUS_VARIANT[row.status]">{{ CATALOG_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '编辑', authCode: 'b2b:catalog:edit', onClick: () => openEdit(row) },
            { label: '上架', authCode: 'b2b:catalog:edit', hidden: row.status === 1, onClick: () => onShelf(row) },
            { label: '下架', authCode: 'b2b:catalog:edit', hidden: row.status === 0, onClick: () => offShelf(row) },
            { label: '标记售罄', authCode: 'b2b:catalog:edit', hidden: row.status === 2, onClick: () => markSoldOut(row) },
          ]"
        />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
