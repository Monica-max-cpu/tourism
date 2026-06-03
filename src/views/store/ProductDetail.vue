<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
} from 'lucide-vue-next';
import { Badge, Button } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { getStoreCatalogItemApi } from '/@/api/store/catalog';
import { useCartStore } from '/@/stores/modules/cart';
import { useUserStore } from '/@/stores/modules/user';
import { formatCurrency } from '/@/utils/format';
import { getProductImages } from '/@/utils/mockProductImages';
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

const productImages = computed(() => getProductImages(item.value));
const currentImage = computed(() => productImages.value[currentImageIdx.value] || '');
const detailHighlights = computed(() => [
  { label: '稳定供应', value: '平台目录商品，适合门店日常补货。', icon: PackageCheck },
  { label: '品质可控', value: item.value?.description || '按平台目录标准采购，规格、单位、起订量清晰。', icon: ShieldCheck },
  { label: '配送履约', value: '下单后进入集采与发货流程，可在订单中跟踪物流状态。', icon: Truck },
]);
const detailSpecs = computed(() => [
  { label: '商品分类', value: item.value?.categoryId || '-' },
  { label: '销售单位', value: item.value?.unit || '-' },
  { label: '起订数量', value: `${item.value?.minOrderQty || 1} ${item.value?.unit || ''}` },
  { label: '目录价格', value: item.value ? formatCurrency(item.value.basePrice) : '-' },
]);

async function load() {
  loading.value = true;
  try {
    const id = route.params.id as string;
    const res: any = await getStoreCatalogItemApi(id);
    item.value = res.records !== undefined ? res : res;
    if (item.value) {
      const cartItem = cartStore.getItems.find((x) => x.catalogId === item.value!.id);
      qty.value = cartItem?.qty || item.value.minOrderQty || 1;
      currentImageIdx.value = 0;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function inc() {
  qty.value++;
}

function dec() {
  qty.value = Math.max(qty.value - 1, item.value?.minOrderQty ?? 1);
}

function changeImage(step: number) {
  if (productImages.value.length <= 1) return;
  currentImageIdx.value = (currentImageIdx.value + step + productImages.value.length) % productImages.value.length;
}

function addToCart() {
  if (!item.value) return;
  cartStore.addItem(item.value, qty.value);
  toast.value = `已加入：${item.value.productName} x ${qty.value}`;
  setTimeout(() => (toast.value = ''), 1500);
}

function goCart() {
  router.push(ROUTE_PATHS.STORE_CART);
}

function goBack() {
  router.back();
}
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
    <div v-else class="max-w-5xl mx-auto space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <div class="aspect-square bg-muted rounded-lg overflow-hidden relative group">
            <img v-if="currentImage" :src="currentImage" :alt="item.productName" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">暂无图片</div>

            <template v-if="productImages.length > 1">
              <button
                class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="上一张"
                @click="changeImage(-1)"
              >
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="下一张"
                @click="changeImage(1)"
              >
                <ChevronRight class="w-5 h-5" />
              </button>
              <div class="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
                <button
                  v-for="(_, index) in productImages"
                  :key="index"
                  class="w-2 h-2 rounded-full border border-white/80"
                  :class="currentImageIdx === index ? 'bg-white' : 'bg-white/40'"
                  :title="`第 ${index + 1} 张`"
                  @click="currentImageIdx = index"
                />
              </div>
            </template>
          </div>

          <div v-if="productImages.length > 1" class="flex gap-2 overflow-x-auto">
            <button
              v-for="(img, index) in productImages"
              :key="index"
              class="w-16 h-16 rounded border-2 flex-shrink-0 cursor-pointer overflow-hidden"
              :class="index === currentImageIdx ? 'border-primary' : 'border-border'"
              :title="`切换到第 ${index + 1} 张`"
              @click="currentImageIdx = index"
            >
              <img :src="img" class="w-full h-full object-cover" :alt="`${item.productName} ${index + 1}`" />
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <Badge :variant="CATALOG_STATUS_VARIANT[item.status]">{{ CATALOG_STATUS_LABEL[item.status] }}</Badge>
              <span class="text-xs text-muted-foreground">{{ item.categoryId || '-' }}</span>
            </div>
            <h2 class="text-xl font-bold">{{ item.productName }}</h2>
          </div>

          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-primary">{{ formatCurrency(item.basePrice) }}</span>
            <span class="text-muted-foreground">/{{ item.unit }}</span>
          </div>

          <div class="flex items-center gap-6 text-sm">
            <div>
              <span class="text-muted-foreground">起订数量：</span>
              <span class="font-medium">{{ item.minOrderQty || 1 }} {{ item.unit }}</span>
            </div>
          </div>

          <div class="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
            <div class="text-xs text-muted-foreground mb-1">商品描述</div>
            {{ item.description || '暂无描述' }}
          </div>

          <div v-if="item.catalogTiers && item.catalogTiers.length" class="border border-border rounded-md p-3 space-y-2">
            <div class="text-sm font-medium">阶梯价</div>
            <div class="grid grid-cols-3 gap-2 text-xs text-muted-foreground border-b border-border pb-1">
              <span>起订</span>
              <span>上限</span>
              <span class="text-right">单价</span>
            </div>
            <div v-for="(tier, index) in item.catalogTiers" :key="index" class="grid grid-cols-3 gap-2 text-sm">
              <span>{{ tier.minQty }}</span>
              <span>{{ tier.maxQty ?? '不限' }}</span>
              <span class="text-right font-medium">{{ formatCurrency(tier.unitPrice) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-4 pt-4 border-t border-border">
            <div class="inline-flex items-center border border-border rounded">
              <button class="w-9 h-9 flex items-center justify-center hover:bg-muted" :disabled="qty <= (item.minOrderQty ?? 1)" @click="dec">
                <Minus class="w-4 h-4" />
              </button>
              <span class="w-12 text-center tabular-nums">{{ qty }}</span>
              <button class="w-9 h-9 flex items-center justify-center hover:bg-muted" @click="inc">
                <Plus class="w-4 h-4" />
              </button>
            </div>
            <Button class="flex-1" size="lg" @click="addToCart">
              <ShoppingCart class="w-4 h-4 mr-1.5" />
              加入购物车
            </Button>
          </div>
        </div>
      </div>

      <section class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="relative min-h-[220px] bg-muted">
          <img :src="productImages[0]" :alt="`${item.productName} 展示图`" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"></div>
          <div class="relative z-10 max-w-xl px-6 py-8 text-white">
            <div class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles class="w-3.5 h-3.5" />
              门店精选采购
            </div>
            <h3 class="mt-4 text-2xl font-bold leading-tight">{{ item.productName }}</h3>
            <p class="mt-3 text-sm leading-6 text-white/85">
              {{ item.description || '适合门店日常补货、陈列销售与组合采购。页面内容为前端模拟详情，后续可接入商品富文本、规格参数与真实详情图片。' }}
            </p>
          </div>
        </div>

        <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div v-for="highlight in detailHighlights" :key="highlight.label" class="border border-border rounded-md p-4 bg-muted/25">
            <component :is="highlight.icon" class="w-5 h-5 text-primary mb-3" />
            <div class="text-sm font-semibold">{{ highlight.label }}</div>
            <div class="text-xs text-muted-foreground leading-5 mt-1">{{ highlight.value }}</div>
          </div>
        </div>

        <div class="px-5 pb-5 grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-5">
          <div class="space-y-4">
            <div>
              <div class="text-base font-semibold">商品参数</div>
              <div class="text-xs text-muted-foreground mt-1">采购前快速确认基础规格</div>
            </div>
            <div class="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border text-sm">
              <template v-for="spec in detailSpecs" :key="spec.label">
                <div class="bg-background px-3 py-2 text-muted-foreground">{{ spec.label }}</div>
                <div class="bg-background px-3 py-2 font-medium">{{ spec.value }}</div>
              </template>
            </div>
            <div class="rounded-md border border-border bg-muted/25 p-4">
              <div class="text-sm font-semibold">采购提示</div>
              <ul class="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
                <li>按起订数量加入购物车，可在购物车统一调整采购数量。</li>
                <li>阶梯价根据采购数量匹配，数量越高可获得对应档位报价。</li>
                <li>提交订单后进入集采、履约和收货流程。</li>
              </ul>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <div class="text-base font-semibold">图文详情</div>
              <div class="text-xs text-muted-foreground mt-1">模拟展示图，真实接口接入后自动替换</div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="(img, index) in productImages" :key="index" class="overflow-hidden rounded-md border border-border bg-muted">
                <img :src="img" :alt="`${item.productName} 详情图 ${index + 1}`" class="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
            <div class="rounded-md border border-border p-4 text-sm leading-6 text-muted-foreground">
              商品详情可扩展为产地、包装规格、储存条件、保质期、适用场景、售后说明等模块。当前先以门店采购视角组织信息，保证页面结构完整、后续字段接入清晰。
            </div>
          </div>
        </div>
      </section>
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
