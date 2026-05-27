<script setup lang="ts">
/**
 * 平台管理员 - 平台商品目录
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】对齐合约字段、去 searchInfo、新增新建、Switch 改按钮
 * update-end--author:claude---date:2026-05-26---for:【阶段7】对齐合约字段、去 searchInfo、新增新建、Switch 改按钮
 */
import { reactive, ref, computed } from 'vue';
import { Plus } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import {
  listCatalogsApi, updateCatalogApi, toggleShelfApi, addCatalogApi,
  listApprovedQuotesForSelectApi,
} from '/@/api/admin';
import { CATALOG_STATUS_LABEL, CATALOG_STATUS_VARIANT, CATALOG_STATUS_OPTIONS } from '/@/constants/b2bStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { PlatformCatalog, CatalogTier } from '/#/b2b';

const search = reactive({ keyword: '', status: '', categoryId: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listCatalogsApi({ ...params, ...search });
}

const columns: BasicColumn[] = [
  { field: 'productName', title: '商品名称', minWidth: 200 },
   { field: 'basePrice', title: '刊价', width: 120, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'minOrderQty', title: '起订量', width: 120, align: 'center' },
  { field: 'categoryId', title: '分类', width: 120 },
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
    authCode: 'b2b:profit:view',
  },
  {
    field: 'marginRate', title: '毛利率', width: 90, align: 'center',
    formatter: ({ row }) => row.marginRate ? (row.marginRate * 100).toFixed(1) + '%' : '-',
    authCode: 'b2b:profit:view',
  },
  { field: 'status', title: '状态', width: 180, align: 'center', slots: { default: 'status' } },
  // { field: 'updateTime', title: '更新时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 260, fixed: 'right', slots: { default: 'action' } },
];

// ===== 新建/编辑 =====
const editModal = useModal<PlatformCatalog | null>();
const submitting = ref(false);

const form = reactive({
  id: '',
  productName: '',
  productImages: '',
  categoryId: '',
  unit: '',
  basePrice: 0,
  minOrderQty: 1,
  commissionRate: 0,
  preferredQuoteId: '',
  description: '',
  sortOrder: 1,
  catalogTiers: [] as CatalogTier[],
});

const isEdit = computed(() => !!form.id);
const formValid = computed(() => !!form.productName && !!form.unit && form.basePrice > 0);

// 已生效报价下拉选项
interface QuoteOption { id: string; supplierId: string; supplierName: string; productName: string; unit?: string; costPrice?: number; }
const quoteOptions = ref<QuoteOption[]>([]);
const selectedQuote = computed(() => quoteOptions.value.find((q) => q.id === form.preferredQuoteId));

function addTier() {
  const last = form.catalogTiers[form.catalogTiers.length - 1];
  const startQty = last ? (last.maxQty ?? last.minQty + 1) : form.minOrderQty;
  form.catalogTiers.push({ minQty: startQty, maxQty: startQty + 49, unitPrice: form.basePrice });
}

function removeTier(index: number) {
  form.catalogTiers.splice(index, 1);
}

function resetForm() {
  Object.assign(form, {
    id: '', productName: '', productImages: '', categoryId: '', unit: '',
    basePrice: 0, minOrderQty: 1, commissionRate: 0, preferredQuoteId: '',
    description: '', sortOrder: 1, catalogTiers: [] as CatalogTier[],
  });
}

async function loadQuoteOptions() {
  try {
    const list = await listApprovedQuotesForSelectApi();
    const raw: any[] = Array.isArray(list) ? list : (list as any)?.records ?? [];
    // 真实后端返回 [{ tiers, quote }]，拆平 quote 字段
    quoteOptions.value = raw.map((item: any) => ({
      ...(item.quote || item),
      tiers: item.tiers,
      supplierName: item.quote?.supplierName || item.supplierName || '',
      productName: item.quote?.productName || item.productName || '',
      unit: item.quote?.unit || item.unit || '',
      costPrice: item.quote?.basePrice ?? item.basePrice ?? item.costPrice ?? 0,
    }));
  } catch {
    quoteOptions.value = [];
  }
}

async function openCreate() {
  resetForm();
  await loadQuoteOptions();
  editModal.open(null);
}

async function openEdit(row: PlatformCatalog) {
  resetForm();
  await loadQuoteOptions();
  Object.assign(form, {
    id: row.id, productName: row.productName, productImages: row.productImages || '',
    categoryId: row.categoryId || '', unit: row.unit, basePrice: row.basePrice,
    minOrderQty: row.minOrderQty ?? 1, commissionRate: row.commissionRate ?? 0,
    preferredQuoteId: row.preferredQuoteId || '', description: row.description || '',
    sortOrder: row.sortOrder ?? 1, catalogTiers: row.catalogTiers ? [...row.catalogTiers] : [],
  });
  editModal.open(row);
}

async function confirmSave() {
  if (!formValid.value) return;
  submitting.value = true;
  try {
    const payload = {
      productName: form.productName,
      productImages: form.productImages,
      categoryId: form.categoryId,
      unit: form.unit,
      basePrice: form.basePrice,
      minOrderQty: form.minOrderQty,
      commissionRate: form.commissionRate,
      preferredQuoteId: form.preferredQuoteId,
      description: form.description,
      sortOrder: form.sortOrder,
      catalogTiers: form.catalogTiers.length ? form.catalogTiers : undefined,
    };
    if (isEdit.value) {
      await updateCatalogApi(form.id, payload);
    } else {
      await addCatalogApi(payload);
    }
    editModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
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

    <BasicModal
      v-model:open="editModal.visible.value"
      :title="isEdit ? '编辑目录商品' : '新建目录商品'"
      description="保存后立即生效，门店侧可见"
      :confirm-loading="submitting"
      :confirm-disabled="!formValid"
      width="640px"
      @confirm="confirmSave"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2 space-y-1.5">
          <Label>商品名称 <span class="text-destructive">*</span></Label>
          <Input v-model="form.productName" placeholder="如：山西老陈醋（特级）500ml×12" />
        </div>
        <div class="space-y-1.5">
          <Label>分类</Label>
          <Input v-model="form.categoryId" placeholder="cat_001" />
        </div>
        <div class="space-y-1.5">
          <Label>单位 <span class="text-destructive">*</span></Label>
          <Input v-model="form.unit" placeholder="箱 / 个 / kg" />
        </div>
        <div class="space-y-1.5">
          <Label>刊价（¥）<span class="text-destructive">*</span></Label>
          <Input v-model.number="form.basePrice" type="number" min="0" step="0.01" placeholder="0.00" />
        </div>
        <div class="space-y-1.5">
          <Label>起订量</Label>
          <Input v-model.number="form.minOrderQty" type="number" min="1" />
        </div>
        <div class="space-y-1.5">
          <Label>服务费率</Label>
          <Input v-model.number="form.commissionRate" type="number" min="0" step="0.01" placeholder="0" />
        </div>
        <div class="space-y-1.5">
          <Label>排序</Label>
          <Input v-model.number="form.sortOrder" type="number" min="0" />
        </div>
        <div class="space-y-1.5">
          <Label>优选报价</Label>
          <Select v-model="form.preferredQuoteId">
            <SelectTrigger><SelectValue placeholder="选择已生效的供应商报价" /></SelectTrigger>
            <SelectContent class="max-h-60">
              <SelectItem value="">无（不关联报价）</SelectItem>
              <SelectItem v-for="q in quoteOptions" :key="q.id" :value="q.id">
                {{ q.supplierName }} — {{ q.productName }} — {{ formatCurrency(q.costPrice) }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="selectedQuote" class="text-xs text-muted-foreground">
            供应商：{{ selectedQuote.supplierName }}&nbsp;&nbsp;|&nbsp;&nbsp;报价：¥{{ selectedQuote.costPrice }}
          </p>
          <p v-else-if="!quoteOptions.length" class="text-xs text-muted-foreground">
            暂无已生效报价，请先在「供应商报价审核」中审核通过
          </p>
        </div>
        <div class="space-y-1.5">
          <Label>商品图片</Label>
          <Input v-model="form.productImages" placeholder='["https://oss.example.com/img.jpg"]' />
        </div>
        <div class="col-span-2 space-y-1.5">
          <Label>描述</Label>
          <Input v-model="form.description" placeholder="商品描述（可选）" />
        </div>

        <!-- 阶梯价 -->
        <div class="col-span-2 space-y-2">
          <div class="flex items-center justify-between">
            <Label>阶梯价（选填）</Label>
            <Button type="button" variant="outline" size="sm" @click="addTier">+ 添加阶梯</Button>
          </div>
          <div v-if="form.catalogTiers.length" class="space-y-2">
            <div v-for="(t, i) in form.catalogTiers" :key="i" class="flex items-center gap-2">
              <Input v-model.number="t.minQty" type="number" min="1" placeholder="起" class="w-20" />
              <span class="text-xs text-muted-foreground">~</span>
              <Input v-model.number="t.maxQty" type="number" min="1" placeholder="止（留空不限）" class="w-24" />
              <Input v-model.number="t.unitPrice" type="number" min="0" step="0.01" placeholder="单价" class="w-24" />
              <Button type="button" variant="ghost" size="icon" class="text-destructive h-8 w-8" @click="removeTier(i)">×</Button>
            </div>
          </div>
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
