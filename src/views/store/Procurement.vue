<script setup lang="ts">
/**
 * 门店 - 商品采购
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】对齐合约字段、去 searchInfo、加 minPrice/maxPrice、加阶梯价展示
 * update-end--author:claude---date:2026-05-26---for:【阶段7】对齐合约字段、去 searchInfo、加 minPrice/maxPrice、加阶梯价展示
 */
import { reactive, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ShoppingCart, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { SearchBar } from '/@/components/SearchBar';
import { listStoreCatalogApi } from '/@/api/store/catalog';
import { STORE_CATEGORY_OPTIONS } from '/@/constants/storeStatus';
import { formatCurrency } from '/@/utils/format';
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
const tierExpanded = reactive<Record<string, boolean>>({});

function getCover(item: StoreCatalogItem): string {
  if (!item.productImages) return '';
  try {
    const arr = JSON.parse(item.productImages);
    return (Array.isArray(arr) && arr.length) ? arr[0] : '';
  } catch {
    return '';
  }
}

async function loadData() {
  loading.value = true;
  try {
    const res = await listStoreCatalogApi({
      pageNo: pageNo.value, pageSize: pageSize.value, ...search,
    });
    list.value = res.records;
    total.value = res.total;
    res.records.forEach((it: StoreCatalogItem) => {
      if (qtyMap[it.id] === undefined) qtyMap[it.id] = it.minOrderQty || 1;
    });
  } finally {
    loading.value = false;
  }
}
onMounted(loadData);

function onSearch() { pageNo.value = 1; loadData(); }
function onReset() {
  search.productName = ''; search.categoryId = ''; search.minPrice = ''; search.maxPrice = '';
  pageNo.value = 1; loadData();
}

function inc(it: StoreCatalogItem) {
  const cur = qtyMap[it.id] ?? it.minOrderQty ?? 1;
  qtyMap[it.id] = cur + 1;
}
function dec(it: StoreCatalogItem) {
  const cur = qtyMap[it.id] ?? it.minOrderQty ?? 1;
  qtyMap[it.id] = Math.max(cur - 1, it.minOrderQty ?? 1);
}
function addToCart(it: StoreCatalogItem) {
  const qty = qtyMap[it.id] ?? it.minOrderQty ?? 1;
  cartStore.addItem(it, qty);
  toast.value = `已加入：${it.productName} × ${qty}`;
  setTimeout(() => (toast.value = ''), 1500);
}
const toast = ref('');

function goDetail(it: StoreCatalogItem) {
  router.push(`/store/catalog/${it.id}`);
}

function toggleTier(id: string) {
  tierExpanded[id] = !tierExpanded[id];
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
function changePage(p: number) {
  pageNo.value = Math.max(1, Math.min(totalPages.value, p));
  loadData();
}

function goCart() { router.push(ROUTE_PATHS.STORE_CART); }
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
        <Input v-model="search.productName" placeholder="商品名" class="w-48" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">分类</Label>
        <Select v-model="search.categoryId">
          <SelectTrigger class="w-32"><SelectValue placeholder="全部分类" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in STORE_CATEGORY_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
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
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="it in list" :key="it.id"
        class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer"
        @click="goDetail(it)"
      >
        <div class="aspect-square bg-muted overflow-hidden">
          <img :src="getCover(it)" :alt="it.productName" class="w-full h-full object-cover" loading="lazy" />
        </div>
        <div class="p-3 flex flex-col flex-1">
          <div class="text-sm font-medium line-clamp-2 min-h-10">{{ it.productName }}</div>
          <div class="text-xs text-muted-foreground mt-1">{{ it.categoryId }}</div>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-lg font-bold text-primary tracking-tight">
              {{ formatCurrency(it.basePrice) }}
            </span>
            <span class="text-xs text-muted-foreground">/{{ it.unit }}</span>
          </div>
          <div class="text-xs text-muted-foreground mt-1">起订量 {{ it.minOrderQty }} {{ it.unit }}</div>

          <!-- 阶梯价 -->
          <div v-if="it.catalogTiers && it.catalogTiers.length" class="mt-2 border-t border-border pt-2" @click.stop>
            <button class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full" @click.stop="toggleTier(it.id)">
              <component :is="tierExpanded[it.id] ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
              阶梯价
            </button>
            <div v-if="tierExpanded[it.id]" class="mt-1.5 text-xs space-y-0.5">
              <div v-for="(t, i) in it.catalogTiers" :key="i" class="flex justify-between">
                <span class="text-muted-foreground">{{ t.minQty }}{{ t.maxQty ? `~${t.maxQty}` : '+' }}</span>
                <span class="font-medium">{{ formatCurrency(t.unitPrice) }}</span>
              </div>
            </div>
          </div>

          <!-- 操作 -->
          <div class="flex items-center justify-between mt-3 gap-2" @click.stop>
            <div class="inline-flex items-center border border-border rounded">
              <button class="w-7 h-7 flex items-center justify-center hover:bg-muted" @click="dec(it)" :disabled="qtyMap[it.id] <= (it.minOrderQty ?? 1)">
                <Minus class="w-3 h-3" />
              </button>
              <span class="w-9 text-center text-sm tabular-nums">{{ qtyMap[it.id] ?? it.minOrderQty }}</span>
              <button class="w-7 h-7 flex items-center justify-center hover:bg-muted" @click="inc(it)">
                <Plus class="w-3 h-3" />
              </button>
            </div>
            <Button size="sm" class="flex-1" @click="addToCart(it)">
              <ShoppingCart class="w-3.5 h-3.5 mr-1" />加入
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
