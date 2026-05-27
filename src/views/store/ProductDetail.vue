<script setup lang="ts">
/**
 * 门店 - 商品详情
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】门店商品详情页
 * update-end--author:claude---date:2026-05-26---for:【阶段7】门店商品详情页
 */
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-vue-next';
import { Badge, Button } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { getStoreCatalogItemApi } from '/@/api/store/catalog';
import { useCartStore } from '/@/stores/modules/cart';
import { useUserStore } from '/@/stores/modules/user';
import { formatCurrency } from '/@/utils/format';
import { CATALOG_STATUS_LABEL, CATALOG_STATUS_VARIANT } from '/@/constants/b2bStatus';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { StoreCatalogItem } from '/#/b2b-store';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
cartStore.init(userStore.getUserInfo?.storeId || '');

const item = ref<StoreCatalogItem | null>(null);
const loading = ref(true);
const qty = ref(1);
const currentImageIdx = ref(0);
const toast = ref('');

function parseImages(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function load() {
  loading.value = true;
  try {
    const id = route.params.id as string;
    const res: any = await getStoreCatalogItemApi(id);
    item.value = res.records !== undefined ? res : res;
    if (item.value) {
      qty.value = item.value.minOrderQty || 1;
    }
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const images = ref<string[]>([]);

function refreshImages() {
  if (item.value) {
    images.value = parseImages(item.value.productImages);
  }
}

function inc() { qty.value++; }
function dec() { qty.value = Math.max(qty.value - 1, item.value?.minOrderQty ?? 1); }

function addToCart() {
  if (!item.value) return;
  cartStore.addItem(item.value, qty.value);
  toast.value = `已加入：${item.value.productName} × ${qty.value}`;
  setTimeout(() => (toast.value = ''), 1500);
}

function goCart() { router.push(ROUTE_PATHS.STORE_CART); }
function goBack() { router.back(); }
</script>

<template>
  <PageWrapper :title="item?.productName || '商品详情'" subtitle="">
    <template #extra>
      <Button variant="outline" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        返回
      </Button>
      <Button variant="outline" @click="goCart">
        <ShoppingCart class="w-4 h-4 mr-1.5" />
        购物车 ({{ cartStore.getCount }})
      </Button>
    </template>

    <div v-if="loading" class="text-center text-muted-foreground py-16">加载中...</div>
    <div v-else-if="!item" class="text-center text-muted-foreground py-16">商品不存在</div>
    <div v-else class="max-w-4xl mx-auto">
      <!-- 图片 + 基本信息 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 图片 -->
        <div class="space-y-3">
          <div class="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              v-if="parseImages(item.productImages).length"
              :src="parseImages(item.productImages)[currentImageIdx]"
              :alt="item.productName"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">暂无图片</div>
          </div>
          <div v-if="parseImages(item.productImages).length > 1" class="flex gap-2 overflow-x-auto">
            <div
              v-for="(img, i) in parseImages(item.productImages)"
              :key="i"
              class="w-16 h-16 rounded border-2 flex-shrink-0 cursor-pointer overflow-hidden"
              :class="i === currentImageIdx ? 'border-primary' : 'border-border'"
              @click="currentImageIdx = i"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- 信息 -->
        <div class="space-y-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <Badge :variant="CATALOG_STATUS_VARIANT[item.status]">{{ CATALOG_STATUS_LABEL[item.status] }}</Badge>
              <span class="text-xs text-muted-foreground">{{ item.categoryId }}</span>
            </div>
            <h2 class="text-xl font-bold">{{ item.productName }}</h2>
          </div>

          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-primary">{{ formatCurrency(item.basePrice) }}</span>
            <span class="text-muted-foreground">/{{ item.unit }}</span>
          </div>

          <div class="flex items-center gap-6 text-sm">
            <div><span class="text-muted-foreground">起订量：</span><span class="font-medium">{{ item.minOrderQty }} {{ item.unit }}</span></div>
          </div>

          <div class="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
            <div class="text-xs text-muted-foreground mb-1">商品描述</div>
            {{ item.description || '暂无描述' }}
          </div>

          <!-- 阶梯价 -->
          <div v-if="item.catalogTiers && item.catalogTiers.length" class="border border-border rounded-md p-3 space-y-2">
            <div class="text-sm font-medium">阶梯价</div>
            <div class="grid grid-cols-3 gap-2 text-xs text-muted-foreground border-b border-border pb-1">
              <span>起订</span><span>上限</span><span class="text-right">单价</span>
            </div>
            <div v-for="(t, i) in item.catalogTiers" :key="i" class="grid grid-cols-3 gap-2 text-sm">
              <span>{{ t.minQty }}</span>
              <span>{{ t.maxQty ?? '不限' }}</span>
              <span class="text-right font-medium">{{ formatCurrency(t.unitPrice) }}</span>
            </div>
          </div>

          <!-- 操作 -->
          <div class="flex items-center gap-4 pt-4 border-t border-border">
            <div class="inline-flex items-center border border-border rounded">
              <button class="w-9 h-9 flex items-center justify-center hover:bg-muted" @click="dec" :disabled="qty <= (item.minOrderQty ?? 1)">
                <Minus class="w-4 h-4" />
              </button>
              <span class="w-12 text-center tabular-nums">{{ qty }}</span>
              <button class="w-9 h-9 flex items-center justify-center hover:bg-muted" @click="inc">
                <Plus class="w-4 h-4" />
              </button>
            </div>
            <Button class="flex-1" size="lg" @click="addToCart">
              <ShoppingCart class="w-4 h-4 mr-1.5" />加入购物车
            </Button>
          </div>
        </div>
      </div>
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
