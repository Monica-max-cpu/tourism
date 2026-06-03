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
import { Button, Input, Label } from '/@/components/ui';
import { Switch } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency } from '/@/utils/format';
import { getProductCover } from '/@/utils/mockProductImages';
import type { CatalogStatus, CatalogTier, PlatformCatalog } from '/#/b2b';
import {
  addCatalogApi,
  listApprovedQuotesForSelectApi,
  listCatalogsApi,
  updateCatalogApi,
} from '/@/api/admin';

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
  productImages?: string;
  images?: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  spec?: string;
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
  productImages?: string;
  description?: string;
  categoryId?: string;
  brand?: string;
  spec?: string;
  unit: string;
  supplierBasePrice: number;
  basePrice: number;
  minOrderQty: number;
  commissionRate: number;
  sortOrder: number;
  shelfNow: boolean;
  catalogTiers: CatalogTier[];
}

const loading = ref(false);
const submitting = ref(false);
const quoteOptions = ref<QuoteOption[]>([]);
const selectedItems = ref<SelectedCatalogItem[]>([]);
const search = reactive({ keyword: '' });

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
  const productImages = quote.productImages || quote.images || product.productImages || product.images || '';
  const costPrice = quote.basePrice ?? quote.costPrice ?? quote.price ?? item.basePrice ?? 0;

  return {
    ...quote,
    id: quote.id || item.id,
    supplierId: quote.supplierId || item.supplierId,
    supplierName: quote.supplierName || item.supplierName || product.supplierName || '-',
    productId: quote.productId || product.id || item.productId,
    productName: quote.productName || product.productName || item.productName || '-',
    productImages,
    images: productImages,
    description: quote.description || product.description || item.description || '',
    categoryId: quote.categoryId || product.categoryId || item.categoryId || '',
    brand: quote.brand || product.brand || item.brand || '',
    spec: quote.spec || product.spec || item.spec || '',
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
  return {
    tempId: `${quote.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    quoteId: quote.id,
    supplierId: quote.supplierId,
    supplierName: quote.supplierName,
    productId: quote.productId,
    productName: quote.productName,
    productImages: quote.productImages || quote.images || '',
    description: quote.description || '',
    categoryId: quote.categoryId || '',
    brand: quote.brand,
    spec: quote.spec,
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

function calcGrossRate(item: SelectedCatalogItem) {
  if (!item.basePrice) return '-';
  const rate = ((Number(item.basePrice) - Number(item.supplierBasePrice)) / Number(item.basePrice)) * 100;
  return `${rate.toFixed(1)}%`;
}

function buildPayload(item: SelectedCatalogItem) {
  return {
    productName: item.productName,
    productImages: item.productImages,
    categoryId: item.categoryId,
    unit: item.unit,
    basePrice: item.basePrice,
    minOrderQty: item.minOrderQty,
    commissionRate: item.commissionRate,
    preferredQuoteId: item.quoteId,
    description: item.description,
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
    const result: any = await listCatalogsApi({ pageNo: 1, pageSize: 200 });
    const catalog = result.records?.find((item: PlatformCatalog) => item.id === catalogId.value);
    if (!catalog) return;

    selectedItems.value = [{
      tempId: catalog.id,
      quoteId: catalog.preferredQuoteId || '',
      supplierName: catalog.preferredSupplierName || '-',
      productName: catalog.productName || '',
      productImages: catalog.productImages || '',
      description: catalog.description || '',
      categoryId: catalog.categoryId || '',
      unit: catalog.unit || '件',
      supplierBasePrice: Number(catalog.supplierBasePrice || 0),
      basePrice: Number(catalog.basePrice || 0),
      minOrderQty: Number(catalog.minOrderQty || 1),
      commissionRate: Number(catalog.commissionRate || 0),
      sortOrder: Number(catalog.sortOrder || 1),
      shelfNow: catalog.status === 1,
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
      <form class="grid grid-cols-1 xl:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.35fr)] gap-5" @submit.prevent="handleSubmit">
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
                <img
                  :src="getProductCover({ id: quote.productId || quote.id, productName: quote.productName, categoryId: quote.categoryId, productImages: quote.productImages || quote.images })"
                  class="h-16 w-16 shrink-0 rounded-md object-cover"
                  alt=""
                />
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
                <img
                  :src="getProductCover({ id: item.productId || item.quoteId, productName: item.productName, categoryId: item.categoryId, productImages: item.productImages })"
                  class="h-20 w-20 shrink-0 rounded-md object-cover"
                  alt=""
                />
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
                    <span class="rounded bg-muted px-2 py-1">单位：{{ item.unit }}</span>
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

              <div class="grid gap-4 px-4 pb-4 md:grid-cols-[1fr_auto]">
                <div class="rounded-md border border-dashed border-border bg-white p-3">
                  <div class="mb-3 flex items-center justify-between">
                    <div class="flex items-center gap-2 text-sm font-medium text-[#1A2C54]">
                      <Coins class="h-4 w-4" />
                      阶梯价
                    </div>
                    <Button type="button" variant="outline" size="sm" @click="addTier(item)">
                      <Plus class="mr-1 h-4 w-4" />
                      添加
                    </Button>
                  </div>
                  <div v-if="item.catalogTiers.length === 0" class="py-2 text-xs text-muted-foreground">
                    未设置阶梯价，按目录销售价统一销售
                  </div>
                  <div v-else class="space-y-2">
                    <div v-for="(tier, tierIndex) in item.catalogTiers" :key="tierIndex" class="flex flex-wrap items-center gap-2">
                      <span class="w-10 text-xs text-muted-foreground">档{{ tierIndex + 1 }}</span>
                      <Input v-model.number="tier.minQty" type="number" min="1" class="h-9 w-24 bg-white" />
                      <span class="text-xs text-muted-foreground">至</span>
                      <Input v-model.number="tier.maxQty" type="number" min="1" class="h-9 w-24 bg-white" />
                      <span class="text-xs text-muted-foreground">单价</span>
                      <Input v-model.number="tier.unitPrice" type="number" min="0" step="0.01" class="h-9 w-28 bg-white" />
                      <button type="button" class="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600" @click="removeTier(item, tierIndex)">
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex min-w-[150px] flex-col justify-between rounded-md bg-white p-3">
                  <!-- <div>
                    <div class="text-xs text-muted-foreground">毛利率</div>
                    <div class="mt-1 text-lg font-semibold text-[#1A2C54]">{{ calcGrossRate(item) }}</div>
                  </div> -->
                  <div class="mt-4 flex items-center gap-2">
                    <Switch v-model:checked="item.shelfNow" class="data-[state=checked]:bg-[#1A2C54]" />
                    <Label class="text-sm text-foreground">立即上架</Label>
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
      </form>
    </div>
  </PageWrapper>
</template>
