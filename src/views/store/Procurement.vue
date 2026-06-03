<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from 'lucide-vue-next';
import {
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
import { SearchBar } from '/@/components/SearchBar';
import { listStoreCatalogApi } from '/@/api/store/catalog';
import { STORE_CATEGORY_OPTIONS } from '/@/constants/storeStatus';
import { formatCurrency } from '/@/utils/format';
import { getProductImages } from '/@/utils/mockProductImages';
import { useCartStore } from '/@/stores/modules/cart';
import { useUserStore } from '/@/stores/modules/user';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { StoreCatalogItem } from '/#/b2b-store';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
cartStore.init(userStore.getUserInfo?.storeId || '');

const search = reactive({ productName: '', categoryId: '', minPrice: '', maxPrice: '' });
const list = ref<StoreCatalogItem[]>([]);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(12);
const loading = ref(false);
const qtyMap = reactive<Record<string, number>>({});
const imageIndexMap = reactive<Record<string, number>>({});
const toast = ref('');

function getCover(item: StoreCatalogItem): string {
  const images = getProductImages(item);
  return images[imageIndexMap[item.id] || 0] || '';
}

function changeProductImage(item: StoreCatalogItem, step: number) {
  const images = getProductImages(item);
  if (images.length <= 1) return;
  const current = imageIndexMap[item.id] || 0;
  imageIndexMap[item.id] = (current + step + images.length) % images.length;
}

function setProductImage(item: StoreCatalogItem, index: number) {
  imageIndexMap[item.id] = index;
}

async function loadData() {
  loading.value = true;
  try {
    const res = await listStoreCatalogApi({ pageNo: pageNo.value, pageSize: pageSize.value, ...search });
    list.value = res.records;
    total.value = res.total;
    res.records.forEach((item: StoreCatalogItem) => {
      if (qtyMap[item.id] === undefined) qtyMap[item.id] = item.minOrderQty || 1;
      if (imageIndexMap[item.id] === undefined) imageIndexMap[item.id] = 0;
    });
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

function onSearch() {
  pageNo.value = 1;
  loadData();
}

function onReset() {
  search.productName = '';
  search.categoryId = '';
  search.minPrice = '';
  search.maxPrice = '';
  pageNo.value = 1;
  loadData();
}

function inc(item: StoreCatalogItem) {
  const current = qtyMap[item.id] ?? item.minOrderQty ?? 1;
  qtyMap[item.id] = current + 1;
}

function dec(item: StoreCatalogItem) {
  const current = qtyMap[item.id] ?? item.minOrderQty ?? 1;
  qtyMap[item.id] = Math.max(current - 1, item.minOrderQty ?? 1);
}

function addToCart(item: StoreCatalogItem) {
  const qty = qtyMap[item.id] ?? item.minOrderQty ?? 1;
  cartStore.addItem(item, qty);
  toast.value = `已加入：${item.productName} x ${qty}`;
  setTimeout(() => (toast.value = ''), 1500);
}

function goDetail(item: StoreCatalogItem) {
  router.push(`/b2b/store/catalog/${item.id}`);
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

function changePage(page: number) {
  pageNo.value = Math.max(1, Math.min(totalPages.value, page));
  loadData();
}

function goCart() {
  router.push(ROUTE_PATHS.STORE_CART);
}
</script>

<template>
  <PageWrapper title="商品采购" subtitle="按平台目录浏览并下单">
    <template #extra>
      <Button variant="outline" @click="goCart">
        <ShoppingCart class="w-4 h-4 mr-1.5" />
        购物车 ({{ cartStore.getCount }})
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.productName" placeholder="商品名称" class="w-48" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">分类</Label>
        <Select v-model="search.categoryId">
          <SelectTrigger class="w-32">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in STORE_CATEGORY_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">价格</Label>
        <Input v-model="search.minPrice" type="number" min="0" placeholder="最低" class="w-20" />
        <span class="text-xs text-muted-foreground">~</span>
        <Input v-model="search.maxPrice" type="number" min="0" placeholder="最高" class="w-20" />
      </div>
    </SearchBar>

    <div v-if="loading" class="text-center text-muted-foreground py-12">加载中...</div>
    <div v-else-if="list.length === 0" class="text-center text-muted-foreground py-16">暂无商品</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <div
        v-for="item in list"
        :key="item.id"
        class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer"
        @click="goDetail(item)"
      >
        <div class="aspect-[4/3] bg-muted overflow-hidden relative group" @click.stop="goDetail(item)">
          <img :src="getCover(item)" :alt="item.productName" class="w-full h-full object-cover" loading="lazy" />
          <template v-if="getProductImages(item).length > 1">
            <button
              class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/85 border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="上一张"
              @click.stop="changeProductImage(item, -1)"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/85 border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="下一张"
              @click.stop="changeProductImage(item, 1)"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
            <div class="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
              <button
                v-for="(_, index) in getProductImages(item)"
                :key="index"
                class="w-1.5 h-1.5 rounded-full border border-white/80"
                :class="(imageIndexMap[item.id] || 0) === index ? 'bg-white' : 'bg-white/40'"
                :title="`第 ${index + 1} 张`"
                @click.stop="setProductImage(item, index)"
              />
            </div>
          </template>
        </div>

        <div class="p-3.5 flex flex-col flex-1">
          <div class="min-h-[62px]">
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="inline-flex max-w-[70%] items-center rounded bg-muted px-2 py-0.5 text-[11px] leading-4 text-muted-foreground truncate">
                {{ item.categoryId || '未分类' }}
              </span>
              <span class="text-[11px] leading-4 text-muted-foreground whitespace-nowrap">
                起订 {{ item.minOrderQty || 1 }} {{ item.unit }}
              </span>
            </div>
            <div class="text-[15px] font-semibold leading-5 line-clamp-2 text-foreground">{{ item.productName }}</div>
          </div>

          <div class="mt-3">
            <div class="text-[11px] leading-4 text-muted-foreground">目录价</div>
            <div class="flex items-baseline gap-1">
              <span class="text-[22px] leading-none font-bold text-primary tabular-nums tracking-tight">
                {{ formatCurrency(item.basePrice) }}
              </span>
              <span class="text-xs text-muted-foreground whitespace-nowrap">/{{ item.unit }}</span>
            </div>
          </div>

          <div v-if="item.catalogTiers && item.catalogTiers.length" class="mt-3 rounded-md border border-border bg-muted/25 px-3 py-2" @click.stop>
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="text-xs font-medium text-foreground">阶梯价</span>
              <span v-if="item.catalogTiers.length > 2" class="text-[11px] text-muted-foreground">
                +{{ item.catalogTiers.length - 2 }} 档
              </span>
            </div>
            <div class="space-y-1">
              <div v-for="(tier, index) in item.catalogTiers.slice(0, 2)" :key="index" class="grid grid-cols-[1fr_auto] items-center gap-2 text-xs">
                <span class="text-muted-foreground truncate">
                  {{ tier.minQty }}{{ tier.maxQty ? `~${tier.maxQty}` : '+' }} {{ item.unit }}
                </span>
                <span class="font-semibold text-foreground tabular-nums">{{ formatCurrency(tier.unitPrice) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-auto pt-3 gap-2" @click.stop>
            <div class="inline-flex h-8 items-center border border-border rounded-md overflow-hidden bg-background">
              <button
                class="w-8 h-8 flex items-center justify-center hover:bg-muted disabled:opacity-40"
                :disabled="qtyMap[item.id] <= (item.minOrderQty ?? 1)"
                @click="dec(item)"
              >
                <Minus class="w-3 h-3" />
              </button>
              <span class="w-10 text-center text-sm tabular-nums">{{ qtyMap[item.id] ?? item.minOrderQty }}</span>
              <button class="w-8 h-8 flex items-center justify-center hover:bg-muted" @click="inc(item)">
                <Plus class="w-3 h-3" />
              </button>
            </div>
            <Button size="sm" class="flex-1 h-8" @click="addToCart(item)">
              <ShoppingCart class="w-3.5 h-3.5 mr-1" />
              加入
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > pageSize" class="flex items-center justify-center gap-3 mt-6">
      <Button variant="outline" size="sm" :disabled="pageNo <= 1" @click="changePage(pageNo - 1)">上一页</Button>
      <span class="text-sm text-muted-foreground tabular-nums">{{ pageNo }} / {{ totalPages }}</span>
      <Button variant="outline" size="sm" :disabled="pageNo >= totalPages" @click="changePage(pageNo + 1)">下一页</Button>
    </div>

    <Transition name="fade">
      <div v-if="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm rounded-lg px-4 py-2 shadow-lg z-50">
        {{ toast }}
      </div>
    </Transition>
  </PageWrapper>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
