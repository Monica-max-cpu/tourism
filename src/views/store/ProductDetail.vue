<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, PackageCheck, ShieldCheck, ShoppingCart, Truck } from 'lucide-vue-next';
import { Button } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import StoreProductDetailShowcase from '/@/components/store/StoreProductDetailShowcase.vue';
import { getStoreCatalogItemApi } from '/@/api/store/catalog';
import { useCartStore } from '/@/stores/modules/cart';
import { useUserStore } from '/@/stores/modules/user';
import { formatCurrency } from '/@/utils/format';
import { getProductImages } from '/@/utils/productImages';
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
  { label: '产地', value: item.value?.originPlace || '-' },
  { label: '包装规格', value: item.value?.packageSpec || '-' },
  { label: '储存条件', value: item.value?.storageCondition || '-' },
  { label: '保质期', value: item.value?.shelfLife || '-' },
  { label: '适用场景', value: item.value?.applicableScene || '-' },
  { label: '售后说明', value: item.value?.afterSaleNote || '-' },
]);
const detailTips = [
  '按起订数量加入购物车，可在购物车统一调整采购数量。',
  '阶梯价根据采购数量匹配，数量越高可获得对应档位报价。',
  '提交订单后进入集采、履约和收货流程。',
];
const detailBannerText = computed(() =>
  item.value?.description || '适合门店日常补货、陈列销售与组合采购。页面内容为前端模拟详情，后续可接入商品富文本、规格参数与真实详情图片。',
);

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
    <div v-else class="max-w-5xl mx-auto">
      <StoreProductDetailShowcase
        :product-name="item.productName"
        :images="productImages"
        :current-image-idx="currentImageIdx"
        :category-label="item.categoryId || '-'"
        :status-label="CATALOG_STATUS_LABEL[item.status]"
        :status-variant="CATALOG_STATUS_VARIANT[item.status]"
        :description="item.description || '暂无描述'"
        :price-text="formatCurrency(item.basePrice)"
        :unit="item.unit"
        :min-order-qty="item.minOrderQty || 1"
        :qty="qty"
        :show-actions="true"
        action-count-label="加入购物车"
        banner-tag="门店精选采购"
        :banner-title="item.productName"
        :banner-text="detailBannerText"
        :highlights="detailHighlights"
        :specs="detailSpecs"
        :detail-text="item.afterSaleNote || item.applicableScene || item.storageCondition || item.description || '暂无更多商品说明'"
        :tips="detailTips"
        empty-image-text="暂无图片"
        @change-image="changeImage"
        @select-image="currentImageIdx = $event"
        @increment="inc"
        @decrement="dec"
        @add-to-cart="addToCart"
      />
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
