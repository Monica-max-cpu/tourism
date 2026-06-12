<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Coins,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next';
import {
  Badge,
  Button,
  Input,
  Label,
} from '/@/components/ui';
import { Switch } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { storeCategoryLabel } from '/@/constants/storeStatus';
import { formatCurrency } from '/@/utils/format';
import { getProductImages } from '/@/utils/productImages';
import type { CatalogStatus, CatalogTier } from '/#/b2b';
import {
  addCatalogApi,
  getCatalogDetailApi,
  listApprovedQuotesForSelectApi,
  updateCatalogApi,
} from '/@/api/admin';
import {
  normalizeCatalogRecord,
  normalizeCatalogStatus,
  resolveCatalogSupplierName,
  resolveCatalogUnit,
} from './catalogHelpers';

const router = useRouter();
const route = useRoute();

const isEdit = computed(() => !!route.params.id);
const catalogId = computed(() => (route.params.id as string) || '');
const pageTitle = computed(() => (isEdit.value ? '编辑目录商品' : '新增目录商品'));
const pageDesc = computed(() =>
  isEdit.value
    ? '维护平台目录价格与运营字段，商品基础资料沿用供应商商品'
    : '从审核通过的供应商报价中选品，右侧直接编辑目录价格后提交',
);

interface QuoteOption {
  id: string;
  supplierId?: string;
  supplierName: string;
  productId?: string;
  productName: string;
  productImageList?: string[];
  productImages?: string;
  images?: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  spec?: string;
  originPlace?: string;
  packageSpec?: string;
  storageCondition?: string;
  shelfLife?: string;
  applicableScene?: string;
  afterSaleNote?: string;
  unit: string;
  minOrderQty: number;
  costPrice: number;
  tiers?: CatalogTier[];
}

interface SelectedCatalogItem {
  tempId: string;
  quoteId: string;
  supplierId?: string;
  supplierName: string;
  productId?: string;
  productName: string;
  productImageList?: string[];
  productImages?: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  spec?: string;
  originPlace?: string;
  packageSpec?: string;
  storageCondition?: string;
  shelfLife?: string;
  applicableScene?: string;
  afterSaleNote?: string;
  unit: string;
  supplierBasePrice: number;
  basePrice: number;
  minOrderQty: number;
  commissionRate: number;
  sortOrder: number;
  shelfNow: boolean;
  catalogTiers: CatalogTier[];
}

const loading = ref(isEdit.value);
const submitting = ref(false);
const quoteOptions = ref<QuoteOption[]>([]);
const selectedItems = ref<SelectedCatalogItem[]>([]);
const search = reactive({ keyword: '' });

const currentItem = computed(() => selectedItems.value[0] || null);

const filteredQuotes = computed(() => {
  const keyword = search.keyword.trim().toLowerCase();
  const selectedIds = new Set(selectedItems.value.map((item) => item.quoteId));
  return quoteOptions.value.filter((quote) => {
    const matchedKeyword =
      !keyword ||
      [quote.productName, quote.supplierName, quote.brand, quote.spec]
        .some((value) => String(value || '').toLowerCase().includes(keyword));
    return matchedKeyword && !selectedIds.has(quote.id);
  });
});

const hasSelected = computed(() => selectedItems.value.length > 0);
const belowCostItems = computed(() =>
  selectedItems.value.filter((item) => Number(item.basePrice) < Number(item.supplierBasePrice)),
);
const formValid = computed(() =>
  hasSelected.value &&
  selectedItems.value.every((item) => item.productName && item.unit && Number(item.basePrice) > 0) &&
  belowCostItems.value.length === 0,
);

function normalizeQuoteRecord(item: any): QuoteOption {
  const quote = item.quote || item;
  const product = item.product || item.productInfo || {};
  const productImageList = quote.productImageList || product.productImageList || item.productImageList || [];
  const productImages = quote.productImages || quote.images || product.productImages || product.images || '';
  const costPrice = quote.basePrice ?? quote.costPrice ?? quote.price ?? item.basePrice ?? 0;

  return {
    ...quote,
    id: quote.id || item.id,
    supplierId: quote.supplierId || item.supplierId,
    supplierName: quote.supplierName || item.supplierName || product.supplierName || '-',
    productId: quote.productId || product.id || item.productId,
    productName: quote.productName || product.productName || item.productName || '-',
    productImageList,
    productImages,
    images: productImages,
    description: quote.description || product.description || item.description || '',
    categoryId: quote.categoryId || product.categoryId || item.categoryId || '',
    brand: quote.brand || product.brand || item.brand || '',
    spec: quote.spec || product.spec || item.spec || '',
    originPlace: quote.originPlace || product.originPlace || item.originPlace || '',
    packageSpec: quote.packageSpec || product.packageSpec || item.packageSpec || '',
    storageCondition: quote.storageCondition || product.storageCondition || item.storageCondition || '',
    shelfLife: quote.shelfLife || product.shelfLife || item.shelfLife || '',
    applicableScene: quote.applicableScene || product.applicableScene || item.applicableScene || '',
    afterSaleNote: quote.afterSaleNote || product.afterSaleNote || item.afterSaleNote || '',
    unit: quote.unit || product.unit || item.unit || '件',
    minOrderQty: quote.minOrderQty ?? quote.minQty ?? item.minOrderQty ?? 1,
    costPrice,
    tiers: (item.tiers || quote.tiers || []).map((tier: any) => ({
      minQty: tier.minQty ?? tier.minOrderQty ?? 1,
      maxQty: tier.maxQty ?? null,
      unitPrice: tier.unitPrice ?? tier.price ?? costPrice,
    })),
  };
}

function createSelectedItem(quote: QuoteOption): SelectedCatalogItem {
  const productImageList = quote.productImageList || [];
  const productImages = quote.productImages || quote.images || productImageList[0] || '';
  return {
    tempId: `${quote.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    quoteId: quote.id,
    supplierId: quote.supplierId,
    supplierName: quote.supplierName,
    productId: quote.productId,
    productName: quote.productName,
    productImageList,
    productImages,
    description: quote.description || '',
    categoryId: quote.categoryId || '',
    brand: quote.brand,
    spec: quote.spec,
    originPlace: quote.originPlace,
    packageSpec: quote.packageSpec,
    storageCondition: quote.storageCondition,
    shelfLife: quote.shelfLife,
    applicableScene: quote.applicableScene,
    afterSaleNote: quote.afterSaleNote,
    unit: quote.unit || '件',
    supplierBasePrice: Number(quote.costPrice || 0),
    basePrice: Number(quote.costPrice || 0),
    minOrderQty: Number(quote.minOrderQty || 1),
    commissionRate: 0,
    sortOrder: selectedItems.value.length + 1,
    shelfNow: true,
    catalogTiers: quote.tiers?.length
      ? quote.tiers.map((tier) => ({ ...tier, unitPrice: Number(tier.unitPrice || quote.costPrice || 0) }))
      : [],
  };
}

function addQuote(quote: QuoteOption) {
  if (selectedItems.value.some((item) => item.quoteId === quote.id)) return;
  selectedItems.value.push(createSelectedItem(quote));
}

function addAllFiltered() {
  filteredQuotes.value.forEach(addQuote);
}

function removeSelected(index: number) {
  selectedItems.value.splice(index, 1);
}

function addTier(item: SelectedCatalogItem) {
  const last = item.catalogTiers[item.catalogTiers.length - 1];
  const startQty = last ? (last.maxQty ?? last.minQty) + 1 : item.minOrderQty;
  item.catalogTiers.push({ minQty: startQty, maxQty: startQty + 49, unitPrice: item.basePrice });
}

function removeTier(item: SelectedCatalogItem, index: number) {
  item.catalogTiers.splice(index, 1);
}

function buildPayload(item: SelectedCatalogItem) {
  return {
    productName: item.productName,
    supplierName: item.supplierName,
    preferredSupplierName: item.supplierName,
    productImages: item.productImages,
    productImageList: item.productImageList?.length ? item.productImageList : undefined,
    categoryId: item.categoryId,
    unit: item.unit,
    basePrice: item.basePrice,
    minOrderQty: item.minOrderQty,
    commissionRate: item.commissionRate,
    preferredQuoteId: item.quoteId,
    supplierBasePrice: item.supplierBasePrice,
    description: item.description,
    originPlace: item.originPlace,
    packageSpec: item.packageSpec,
    storageCondition: item.storageCondition,
    shelfLife: item.shelfLife,
    applicableScene: item.applicableScene,
    afterSaleNote: item.afterSaleNote,
    sortOrder: item.sortOrder,
    status: (item.shelfNow ? 1 : 0) as CatalogStatus,
    catalogTiers: item.catalogTiers.length ? item.catalogTiers : undefined,
  };
}

async function loadQuoteOptions() {
  try {
    const list = await listApprovedQuotesForSelectApi();
    const raw: any[] = Array.isArray(list) ? list : (list as any)?.records ?? [];
    quoteOptions.value = raw.map(normalizeQuoteRecord).filter((item) => item.id);
  } catch {
    quoteOptions.value = [];
  }
}

async function loadCatalog() {
  if (!isEdit.value) return;
  loading.value = true;
  try {
    const catalog = normalizeCatalogRecord(await getCatalogDetailApi(catalogId.value));
    if (!catalog) return;

    selectedItems.value = [{
      tempId: catalog.id,
      quoteId: catalog.preferredQuoteId || '',
      supplierName: catalog.supplierName || catalog.preferredSupplierName || '-',
      productName: catalog.productName || '',
      productImageList: catalog.productImageList || [],
      productImages: catalog.productImages || '',
      description: catalog.description || '',
      originPlace: (catalog as any).originPlace || '',
      packageSpec: (catalog as any).packageSpec || '',
      storageCondition: (catalog as any).storageCondition || '',
      shelfLife: (catalog as any).shelfLife || '',
      applicableScene: (catalog as any).applicableScene || '',
      afterSaleNote: (catalog as any).afterSaleNote || '',
      categoryId: catalog.categoryId || '',
      unit: catalog.unit || '件',
      supplierBasePrice: Number(catalog.supplierBasePrice || 0),
      basePrice: Number(catalog.basePrice || 0),
      minOrderQty: Number(catalog.minOrderQty || 1),
      commissionRate: Number(catalog.commissionRate || 0),
      sortOrder: Number(catalog.sortOrder || 1),
      shelfNow: normalizeCatalogStatus(catalog.status) === 1,
    catalogTiers: catalog.catalogTiers ? [...catalog.catalogTiers] : [],
  }];
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!formValid.value) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateCatalogApi(catalogId.value, buildPayload(selectedItems.value[0]));
    } else {
      await Promise.all(selectedItems.value.map((item) => addCatalogApi(buildPayload(item))));
    }
    router.push(ROUTE_PATHS.ADMIN_CATALOGS);
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await loadQuoteOptions();
  await loadCatalog();
});

function goBack() {
  router.push(ROUTE_PATHS.ADMIN_CATALOGS);
}

function goToQuoteReview() {
  router.push(ROUTE_PATHS.ADMIN_QUOTES);
}

function tierRangeText(tier: CatalogTier, unit: string) {
  if (tier.maxQty != null) return `${tier.minQty}~${tier.maxQty}${unit}`;
  return `≥${tier.minQty}${unit}`;
}

function firstProductImage(item: { productImages?: string }) {
  return getProductImages(item as any)[0] || '';
}
</script>

<template>
  <PageWrapper :title="pageTitle" :subtitle="pageDesc">
    <template #extra>
      <Button variant="outline" class="text-muted-foreground" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        返回商品目录
      </Button>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-[#1A2C54] border-t-transparent" />
      <span class="ml-3 text-sm text-muted-foreground">加载商品信息...</span>
    </div>

    <div v-else class="pt-4 pb-16">
      <form class="grid grid-cols-1 xl:grid-cols-[minmax(340px,0.88fr)_minmax(560px,1.32fr)] gap-5" @submit.prevent="handleSubmit">
        <template v-if="isEdit && currentItem">
          <div class="space-y-5">
            <section class="rounded-[20px] border border-border bg-white p-6 shadow-[0_8px_32px_rgba(15,23,42,0.05)]">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-[20px] font-semibold text-[#1A2C54]">商品信息</h3>
                </div>
              </div>

              <div class="mt-6 flex gap-5">
                <div v-if="firstProductImage(currentItem)" class="h-40 w-40 shrink-0 overflow-hidden rounded-2xl ring-1 ring-border/60">
                  <img
                    :src="firstProductImage(currentItem)"
                    :alt="currentItem.productName"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div v-else class="flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl bg-muted text-xs text-muted-foreground ring-1 ring-border/60">
                  暂无图片
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-[26px] font-semibold leading-tight text-foreground">
                    {{ currentItem.productName }}
                  </div>
                  <div class="mt-3 inline-flex max-w-full rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                    {{ resolveCatalogSupplierName(currentItem) || storeCategoryLabel(currentItem.categoryId) || '供应商商品' }}
                  </div>

                  <div class="mt-8 grid grid-cols-2 gap-5">
                    <div>
                      <div class="text-sm text-muted-foreground">供应价</div>
                      <div class="mt-1 text-[28px] font-semibold leading-none text-foreground">
                        {{ formatCurrency(currentItem.supplierBasePrice) }}
                      </div>
                    </div>
                    <div class="border-l border-border pl-5">
                      <div class="text-sm text-muted-foreground">单位</div>
                      <div class="mt-1 text-[28px] font-semibold leading-none text-foreground">
                        {{ resolveCatalogUnit(currentItem) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8 flex items-center gap-3">
                <span class="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-500">
                  <span class="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                  已上架
                </span>
              </div>

              <div class="mt-8 border-t border-border pt-5">
                <Button type="button" variant="ghost" class="h-auto px-0 text-[#5B67D8] hover:bg-transparent hover:text-[#4452d0]" @click="goToQuoteReview">
                  查看供应商报价
                  <ArrowRight class="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>

            <section class="rounded-[20px] border border-border bg-white p-6 shadow-[0_8px_32px_rgba(15,23,42,0.05)]">
              <div class="flex items-center gap-3">
                <h3 class="text-[20px] font-semibold text-[#1A2C54]">档位定价预览</h3>
                <span class="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">档位定价</span>
              </div>

              <div class="mt-5 rounded-2xl border border-border bg-white">
                <div v-if="!currentItem.catalogTiers.length" class="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                  <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                    <Coins class="h-6 w-6" />
                  </div>
                  <div class="text-lg font-semibold text-foreground">暂未设置阶梯价</div>
                  <div class="mt-2 text-sm text-muted-foreground">为不同采购量设置不同价格，提升门店下单效率。</div>
                </div>
                <div v-else class="divide-y divide-border">
                  <div v-for="(tier, tierIndex) in currentItem.catalogTiers" :key="tierIndex" class="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4">
                    <span
                      class="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold"
                      :class="tierIndex === 0 ? 'bg-indigo-50 text-indigo-500' : tierIndex === 1 ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'"
                    >
                      {{ tierIndex + 1 }}档
                    </span>
                    <span class="text-sm text-muted-foreground">{{ tierRangeText(tier, resolveCatalogUnit(currentItem)) }}</span>
                    <span class="text-lg font-semibold text-foreground">{{ formatCurrency(tier.unitPrice) }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section class="flex min-h-[760px] flex-col rounded-[20px] border border-border bg-white shadow-[0_8px_32px_rgba(15,23,42,0.05)]">
            <div class="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h3 class="text-[20px] font-semibold text-[#1A2C54]">定价配置</h3>
                <p class="mt-1 text-xs text-muted-foreground">调整目录售价、起订量与阶梯价后保存即可生效。</p>
              </div>
            </div>

            <div class="flex-1 px-6 py-6">
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <Label class="text-[15px] font-medium text-foreground/80">目录售价 ￥</Label>
                  <Input v-model.number="selectedItems[0].basePrice" type="number" min="0" step="0.01" class="h-12 rounded-xl text-[15px]" />
                </div>
                <div class="space-y-2">
                  <Label class="text-[15px] font-medium text-foreground/80">起订量</Label>
                  <div class="flex h-12 overflow-hidden rounded-xl border border-input bg-background">
                    <Input v-model.number="selectedItems[0].minOrderQty" type="number" min="1" class="h-full flex-1 rounded-none border-0 text-[15px] shadow-none focus-visible:ring-0" />
                    <div class="flex items-center px-4 text-sm font-semibold text-foreground/80">
                      {{ resolveCatalogUnit(currentItem) }}
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="text-[15px] font-medium text-foreground/80">展示排序</Label>
                  <div class="flex h-12 overflow-hidden rounded-xl border border-input bg-background">
                    <Input v-model.number="selectedItems[0].sortOrder" type="number" min="0" class="h-full flex-1 rounded-none border-0 text-[15px] shadow-none focus-visible:ring-0" />
                    <div class="flex items-center px-4 text-sm text-muted-foreground">数字越小越靠前</div>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex items-center gap-4 rounded-2xl border border-border px-4 py-4">
                <Switch v-model:checked="selectedItems[0].shelfNow" type="button" class="data-[state=checked]:bg-[#5B67D8]" />
                <div>
                  <div class="text-[15px] font-medium text-foreground">立即上架</div>
                  <div class="mt-1 text-sm text-muted-foreground">开启后商品将对采购商可见</div>
                </div>
              </div>

              <div class="mt-8 border-t border-border pt-7">
                <div class="flex items-center gap-3">
                  <h4 class="text-[20px] font-semibold text-foreground">阶梯定价</h4>
                  <Badge :variant="selectedItems[0].catalogTiers.length ? 'success' : 'warning'" class="rounded-full px-3 py-1 text-sm font-medium">
                    {{ selectedItems[0].catalogTiers.length ? '已配置' : '未配置' }}
                  </Badge>
                </div>

                <div class="mt-5 rounded-[20px] border border-dashed border-border bg-[#fbfcfe] p-5">
                  <div v-if="selectedItems[0].catalogTiers.length === 0" class="flex min-h-[220px] flex-col items-center justify-center text-center">
                    <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                      <Coins class="h-6 w-6" />
                    </div>
                    <div class="text-lg font-semibold text-foreground">暂未设置阶梯价</div>
                    <div class="mt-2 text-sm text-muted-foreground">为不同采购量设置不同价格</div>
                    <Button type="button" variant="outline" class="mt-6" @click="addTier(selectedItems[0])">
                      <Plus class="mr-2 h-4 w-4" />
                      添加价格阶梯
                    </Button>
                  </div>
                  <div v-else class="space-y-3">
                    <div v-for="(tier, tierIndex) in selectedItems[0].catalogTiers" :key="tierIndex" class="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
                      <span
                        class="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold"
                        :class="tierIndex === 0 ? 'bg-indigo-50 text-indigo-500' : tierIndex === 1 ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'"
                      >
                        {{ tierIndex + 1 }}档
                      </span>
                      <Input v-model.number="tier.minQty" type="number" min="1" class="h-10 w-24 rounded-xl text-[15px]" />
                      <span class="text-sm text-muted-foreground">至</span>
                      <Input v-model.number="tier.maxQty" type="number" min="1" class="h-10 w-24 rounded-xl text-[15px]" />
                      <span class="text-sm text-muted-foreground">单价</span>
                      <Input v-model.number="tier.unitPrice" type="number" min="0" step="0.01" class="h-10 w-28 rounded-xl text-[15px]" />
                      <button type="button" class="ml-auto rounded-full p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600" @click="removeTier(selectedItems[0], tierIndex)">
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                    <Button type="button" variant="outline" class="rounded-xl" @click="addTier(selectedItems[0])">
                      <Plus class="mr-2 h-4 w-4" />
                      添加价格阶梯
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-border bg-[#fafbfc] px-6 py-5">
              <Button type="button" variant="outline" class="rounded-xl px-6" @click="goBack">
                <ArrowLeft class="mr-1.5 h-4 w-4" />
                取消
              </Button>
              <Button type="submit" class="rounded-xl px-8" :disabled="submitting || !formValid">
                <div v-if="submitting" class="mr-1.5 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {{ submitting ? '保存中...' : '保存更改' }}
              </Button>
            </div>
          </section>
        </template>
        <template v-else>
        <section v-if="!isEdit" class="min-h-[620px] rounded-lg border border-border bg-white">
          <div class="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 class="text-base font-semibold text-[#1A2C54]">可选商品</h3>
              <p class="mt-1 text-xs text-muted-foreground">仅展示供应商报价审核通过的商品</p>
            </div>
            <Button type="button" variant="outline" size="sm" :disabled="filteredQuotes.length === 0" @click="addAllFiltered">
              <Plus class="w-4 h-4 mr-1" />
              全部移入
            </Button>
          </div>

          <div class="p-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input v-model="search.keyword" placeholder="搜索商品、供应商、规格" class="h-10 pl-9" />
            </div>
          </div>

          <div class="max-h-[680px] space-y-3 overflow-y-auto px-4 pb-4">
            <div v-if="filteredQuotes.length === 0" class="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              暂无可移入商品
            </div>

            <article
              v-for="quote in filteredQuotes"
              :key="quote.id"
              class="rounded-lg border border-border bg-white p-3 transition-colors hover:border-[#1A2C54]/40 hover:bg-[#f8fafc]"
            >
              <div class="flex gap-3">
                <div v-if="firstProductImage(quote)" class="h-16 w-16 shrink-0 overflow-hidden rounded-md">
                  <img
                    :src="firstProductImage(quote)"
                    class="h-full w-full object-cover"
                    alt=""
                  />
                </div>
                <div v-else class="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] text-muted-foreground">
                  暂无
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold text-foreground">{{ quote.productName }}</div>
                  <div class="mt-1 truncate text-xs text-muted-foreground">{{ quote.supplierName }}</div>
                  <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span v-if="quote.spec" class="rounded bg-muted px-1.5 py-0.5">{{ quote.spec }}</span>
                    <span>起订 {{ quote.minOrderQty }}{{ quote.unit }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <div>
                  <div class="text-xs text-muted-foreground">供应商报价</div>
                  <div class="text-base font-semibold text-[#1A2C54]">{{ formatCurrency(quote.costPrice) }}</div>
                </div>
                <Button type="button" size="sm" @click="addQuote(quote)">
                  移入
                  <ArrowRight class="ml-1 h-4 w-4" />
                </Button>
              </div>
            </article>
          </div>
        </section>

        <section class="min-h-[620px] rounded-lg border border-border bg-white">
          <div class="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 class="text-base font-semibold text-[#1A2C54]">已选目录商品</h3>
              <p class="mt-1 text-xs text-muted-foreground">商品图片、详情和描述沿用供应商上传内容，此处只维护目录价格</p>
            </div>
            <div class="text-sm text-muted-foreground">已选 {{ selectedItems.length }} 个</div>
          </div>

          <div v-if="belowCostItems.length" class="mx-5 mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
            <span>目录销售价不能低于供应商报价，请调整后再提交。</span>
          </div>

          <div class="max-h-[760px] space-y-4 overflow-y-auto p-5">
            <div v-if="selectedItems.length === 0" class="rounded-lg border border-dashed border-border py-24 text-center">
              <Package class="mx-auto h-10 w-10 text-muted-foreground/50" />
              <div class="mt-3 text-sm font-medium text-foreground">请从左侧移入商品</div>
              <div class="mt-1 text-xs text-muted-foreground">移入后可直接编辑目录价格并提交</div>
            </div>

            <article v-for="(item, index) in selectedItems" :key="item.tempId" class="rounded-lg border border-border bg-[#fbfcfe]">
              <div class="flex items-start gap-4 border-b border-border bg-white p-4">
                <div v-if="firstProductImage(item)" class="h-20 w-20 shrink-0 overflow-hidden rounded-md">
                  <img
                    :src="firstProductImage(item)"
                    class="h-full w-full object-cover"
                    alt=""
                  />
                </div>
                <div v-else class="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] text-muted-foreground">
                  暂无图片
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <h4 class="truncate text-base font-semibold text-foreground">{{ item.productName }}</h4>
                      <p class="mt-1 truncate text-sm text-muted-foreground">{{ item.supplierName }}</p>
                    </div>
                    <button
                      v-if="!isEdit"
                      type="button"
                      class="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      @click="removeSelected(index)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span v-if="item.brand" class="rounded bg-muted px-2 py-1">{{ item.brand }}</span>
                    <span v-if="item.spec" class="rounded bg-muted px-2 py-1">{{ item.spec }}</span>
                    <span class="rounded bg-muted px-2 py-1">单位：{{ resolveCatalogUnit(item) }}</span>
                    <span class="rounded bg-muted px-2 py-1">供应商报价：{{ formatCurrency(item.supplierBasePrice) }}</span>
                  </div>
                  <p v-if="item.description" class="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {{ item.description }}
                  </p>
                </div>
              </div>

              <div class="grid gap-4 p-4 md:grid-cols-4">
                <div class="space-y-1.5">
                  <Label class="text-xs text-muted-foreground">目录销售价 <span class="text-red-500">*</span></Label>
                  <Input v-model.number="item.basePrice" type="number" min="0" step="0.01" class="h-10 bg-white" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-xs text-muted-foreground">起订量</Label>
                  <Input v-model.number="item.minOrderQty" type="number" min="1" class="h-10 bg-white" />
                </div>
                <!-- <div class="space-y-1.5">
                  <Label class="text-xs text-muted-foreground">服务费率</Label>
                  <Input v-model.number="item.commissionRate" type="number" min="0" step="0.01" class="h-10 bg-white" />
                </div> -->
                <div class="space-y-1.5">
                  <Label class="text-xs text-muted-foreground">展示排序</Label>
                  <Input v-model.number="item.sortOrder" type="number" min="0" class="h-10 bg-white" />
                </div>
              </div>

              <div class="px-4 pb-4">
                <div class="rounded-[20px] border border-dashed border-border bg-[#fbfcfe] p-5">
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-2 text-sm font-medium text-[#1A2C54]">
                      <Coins class="h-4 w-4" />
                      阶梯价
                    </div>
                    <Button type="button" variant="outline" size="sm" @click="addTier(item)">
                      <Plus class="mr-1 h-4 w-4" />
                      添加
                    </Button>
                  </div>

                  <div class="mt-4">
                    <div v-if="item.catalogTiers.length === 0" class="py-2 text-xs text-muted-foreground">
                      未设置阶梯价，按目录销售价统一销售
                    </div>
                    <div v-else class="space-y-2">
                      <div v-for="(tier, tierIndex) in item.catalogTiers" :key="tierIndex" class="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
                        <span class="w-10 text-xs text-muted-foreground">档{{ tierIndex + 1 }}</span>
                        <Input v-model.number="tier.minQty" type="number" min="1" class="h-9 w-24 bg-white" />
                        <span class="text-xs text-muted-foreground">至</span>
                        <Input v-model.number="tier.maxQty" type="number" min="1" class="h-9 w-24 bg-white" />
                        <span class="text-xs text-muted-foreground">单价</span>
                        <Input v-model.number="tier.unitPrice" type="number" min="0" step="0.01" class="h-9 w-28 bg-white" />
                        <button type="button" class="ml-auto rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600" @click="removeTier(item, tierIndex)">
                          <X class="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="mt-5 flex items-center justify-end gap-3 border-t border-border pt-4">
                    <Label class="text-sm text-foreground/80">立即上架</Label>
                    <Switch v-model:checked="item.shelfNow" type="button" class="data-[state=checked]:bg-[#1A2C54]" />
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div class="flex items-center justify-between border-t border-border bg-[#fafbfc] px-5 py-4">
            <Button type="button" variant="outline" @click="goBack">
              <ArrowLeft class="mr-1.5 h-4 w-4" />
              取消
            </Button>
              <Button type="submit" :disabled="submitting || !formValid">
              <div v-if="submitting" class="mr-1.5 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {{ submitting ? '提交中...' : (isEdit ? '保存修改' : '提交到目录商品列表') }}
            </Button>
          </div>
        </section>
        </template>
      </form>
    </div>
  </PageWrapper>
</template>
