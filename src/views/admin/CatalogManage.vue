<script setup lang="ts">
/**
 * 平台管理端 - 平台商品目录
 * update-begin--author:claude---date:2026-05-27---for:【弹窗改页面】新建/编辑移入独立路由页面 CatalogForm
 * update-end--author:claude---date:2026-05-27---for:【弹窗改页面】新建/编辑移入独立路由页面 CatalogForm
 */
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Search } from 'lucide-vue-next';
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listCatalogsApi, toggleShelfApi } from '/@/api/admin';
import { CATALOG_STATUS_LABEL, CATALOG_STATUS_VARIANT } from '/@/constants/b2bStatus';
import { STORE_CATEGORY_OPTIONS } from '/@/constants/storeStatus';
import { formatCurrency } from '/@/utils/format';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { PlatformCatalog } from '/#/b2b';
import {
  normalizeCatalogRecord,
  resolveCatalogCategoryText,
  resolveCatalogSupplierName,
  resolveCatalogUnit,
} from './catalogHelpers';

const router = useRouter();
const search = reactive({ keyword: '', status: '', categoryId: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const result: any = await listCatalogsApi({ ...params, ...search });
  const records = (result.records || []).map(normalizeCatalogRecord);
  return { ...result, records };
}

const columns: BasicColumn[] = [
  { field: 'productName', title: '商品信息', minWidth: 320, slots: { default: 'product' } },
  { field: 'basePrice', title: '售价', width: 130, align: 'right', slots: { default: 'price' } },
  { field: 'minOrderQty', title: '起订量', width: 120, align: 'center', slots: { default: 'minOrderQty' } },
  { field: 'categoryId', title: '分类', width: 120, formatter: ({ row }) => resolveCatalogCategoryText(row) },
  { field: 'unit', title: '单位', width: 100, align: 'center', formatter: ({ row }) => resolveCatalogUnit(row) },
  {
    field: 'catalogTiers',
    title: '档位',
    width: 100,
    align: 'center',
    formatter: ({ row }) => {
      return row.catalogTiers && row.catalogTiers.length > 0 ? `${row.catalogTiers.length} 档` : '-';
    },
  },
  {
    field: 'catalogTiersDetail',
    title: '档位详情',
    width: 300,
    formatter: ({ row }) => {
      if (!row.catalogTiers || row.catalogTiers.length === 0) return `${row.minOrderQty}件起 ${formatCurrency(row.basePrice)}`;
      return row.catalogTiers.map((t: any) => {
        const qty = t.maxQty != null ? `${t.minQty}~${t.maxQty}件` : `${t.minQty}件以上`;
        return `${qty}: ${formatCurrency(t.unitPrice)}`;
      }).join(' / ');
    },
  },
  {
    field: 'supplierBasePrice',
    title: '成本价',
    width: 110,
    align: 'right',
    slots: { default: 'supplierBasePrice' },
    authCode: 'b2b:settlement:profitList',
  },
  { field: 'status', title: '状态', width: 140, align: 'center', slots: { default: 'status' } },
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

function productCover(row: PlatformCatalog) {
  return row.productImageList?.[0] || row.productImages || '';
}

function onSearch() {
  reload({ pageNo: 1 });
}

function onReset() {
  search.keyword = '';
  search.status = '';
  search.categoryId = '';
  reload({ pageNo: 1 });
}

</script>

<template>
  <PageWrapper title="平台商品目录" subtitle="按商品分类、供应商与售价策略管理平台对外售卖目录">
    <template #extra>
      <Button
        v-auth="'b2b:catalog:edit'"
        class="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-6 rounded-xl"
        @click="openCreate"
      >
        <Plus class="mr-2 h-5 w-5" />
        新建目录商品
      </Button>
    </template>

    <div class="catalog-console">
      <SearchBar class="catalog-search" @search="onSearch" @reset="onReset">
        <div class="catalog-keyword">
          <Label class="catalog-label">商品检索</Label>
          <div class="catalog-keyword__input">
            <Search class="w-4 h-4 text-muted-foreground" />
            <Input v-model="search.keyword" placeholder="输入商品名称" class="catalog-input" @keyup.enter="onSearch" />
          </div>
        </div>
        <div class="catalog-category-filter">
          <Label class="catalog-label">商品分类</Label>
          <Select v-model="search.categoryId">
            <SelectTrigger class="catalog-category-select">
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="o in STORE_CATEGORY_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SearchBar>

      <BasicTable :columns="columns" :api="loadData" row-key="id" class="catalog-table" @register="registerTable">
        <template #product="{ row }">
          <div class="catalog-product">
            <div v-if="productCover(row)" class="catalog-product__image-wrap">
              <img :src="productCover(row)" :alt="row.productName" class="catalog-product__image" />
            </div>
            <div v-else class="catalog-product__image catalog-product__image--empty">
              <span>暂无图片</span>
            </div>
            <div class="catalog-product__main">
              <div class="catalog-product__name">{{ row.productName }}</div>
              <div class="catalog-product__supplier">{{ row.supplierName || resolveCatalogSupplierName(row) || '暂无优选供应商' }}</div>
            </div>
          </div>
        </template>
        <template #price="{ row }">
          <span class="catalog-price">{{ formatCurrency(row.basePrice) }}</span>
        </template>
        <template #supplierBasePrice="{ row }">
          <span class="catalog-price catalog-price--cost">{{ formatCurrency(row.supplierBasePrice) }}</span>
        </template>
        <template #minOrderQty="{ row }">
          <span class="catalog-min-qty">{{ row.minOrderQty || '-' }} 件起</span>
        </template>
        <template #status="{ row }">
          <Badge :variant="CATALOG_STATUS_VARIANT[row.status]" class="catalog-status-pill">
            {{ CATALOG_STATUS_LABEL[row.status] }}
          </Badge>
        </template>
        <template #action="{ row }">
          <div class="catalog-actions">
            <TableAction
              :actions="[
                { label: '编辑', authCode: 'b2b:catalog:edit', onClick: () => openEdit(row) },
                { label: '上架', authCode: 'b2b:catalog:edit', hidden: Number(row.status) === 1, onClick: () => onShelf(row) },
                { label: '下架', authCode: 'b2b:catalog:edit', hidden: Number(row.status) === 0, onClick: () => offShelf(row) },
                { label: '标记售罄', authCode: 'b2b:catalog:edit', hidden: Number(row.status) === 2, onClick: () => markSoldOut(row) },
              ]"
            />
          </div>
        </template>
      </BasicTable>
    </div>
  </PageWrapper>
</template>

<style lang="less" scoped>
.catalog-console {
  display: grid;
  gap: 16px;
}

.catalog-search {
  margin-bottom: 0;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--card));
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.catalog-keyword,
.catalog-category-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.catalog-label {
  white-space: nowrap;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  font-weight: 700;
}

.catalog-keyword__input {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 260px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--background));
}

.catalog-input {
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.catalog-input:focus-visible {
  outline: none;
  box-shadow: none;
}

.catalog-category-select {
  width: 180px;
  height: 38px;
  border-radius: 8px;
  background: hsl(var(--background));
}

.catalog-product {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 10px 0;
  text-align: left;
}

.catalog-product__image {
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  object-fit: cover;
  background: #f8fafc;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
}

.catalog-product__image-wrap {
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
}

.catalog-product__image--empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.2;
  text-align: center;
}

.catalog-product__main {
  min-width: 0;
}

.catalog-product__name {
  overflow: hidden;
  color: #111827;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catalog-product__supplier {
  overflow: hidden;
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.catalog-price {
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0;
}

.catalog-price--cost {
  color: #475569;
}

.catalog-min-qty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid rgba(59, 130, 246, 0.14);
  border-radius: 999px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  background: rgba(59, 130, 246, 0.08);
}

.catalog-status-pill {
  min-width: 68px;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 12px;
  font-weight: 700;
}

.catalog-actions {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .catalog-keyword,
  .catalog-category-filter {
    align-items: flex-start;
    flex-direction: column;
  }

  .catalog-keyword__input,
  .catalog-category-select {
    width: 100%;
  }
}
</style>
