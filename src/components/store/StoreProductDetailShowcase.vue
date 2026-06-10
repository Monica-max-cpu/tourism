<script setup lang="ts">
import type { Component } from 'vue';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Sparkles } from 'lucide-vue-next';
import { Badge, Button } from '/@/components/ui';
import { formatCurrency } from '/@/utils/format';

type HighlightItem = {
  label: string;
  value: string;
  icon: Component;
};

type SpecItem = {
  label: string;
  value: string;
};

withDefaults(
  defineProps<{
    productName: string;
    images: string[];
    currentImageIdx: number;
    categoryLabel?: string;
    statusLabel?: string;
    statusVariant?: 'success' | 'warning' | 'destructive' | 'muted';
    description?: string;
    priceText?: string;
    unit?: string;
    minOrderQty?: number;
    qty?: number;
    showActions?: boolean;
    actionCountLabel?: string;
    bannerTag?: string;
    bannerTitle?: string;
    bannerText?: string;
    highlights?: HighlightItem[];
    specs?: SpecItem[];
    detailText?: string;
    tips?: string[];
    emptyImageText?: string;
  }>(),
  {
    images: () => [],
    currentImageIdx: 0,
    description: '',
    priceText: '',
    unit: '',
    minOrderQty: 1,
    qty: 1,
    showActions: true,
    actionCountLabel: '购物车',
    bannerTag: '门店精选采购',
    bannerTitle: '',
    bannerText: '',
    statusVariant: 'muted',
    highlights: () => [],
    specs: () => [],
    detailText: '',
    tips: () => [],
    emptyImageText: '暂无图片',
  },
);

const emit = defineEmits<{
  (e: 'change-image', step: number): void;
  (e: 'select-image', index: number): void;
  (e: 'increment'): void;
  (e: 'decrement'): void;
  (e: 'add-to-cart'): void;
}>();

function changeImage(step: number) {
  emit('change-image', step);
}

function selectImage(index: number) {
  emit('select-image', index);
}

function increment() {
  emit('increment');
}

function decrement() {
  emit('decrement');
}

function addToCart() {
  emit('add-to-cart');
}

</script>

<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-3">
        <div class="aspect-square bg-muted rounded-lg overflow-hidden relative group">
          <img v-if="images[currentImageIdx]" :src="images[currentImageIdx]" :alt="productName" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">
            {{ emptyImageText }}
          </div>

          <template v-if="images.length > 1">
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
                v-for="(_, index) in images"
                :key="index"
                class="w-2 h-2 rounded-full border border-white/80"
                :class="currentImageIdx === index ? 'bg-white' : 'bg-white/40'"
                :title="`第 ${index + 1} 张`"
                @click="selectImage(index)"
              />
            </div>
          </template>
        </div>

        <div v-if="images.length > 1" class="flex gap-2 overflow-x-auto">
          <button
            v-for="(img, index) in images"
            :key="index"
            class="w-16 h-16 rounded border-2 flex-shrink-0 cursor-pointer overflow-hidden"
            :class="index === currentImageIdx ? 'border-primary' : 'border-border'"
            :title="`切换到第 ${index + 1} 张`"
            @click="selectImage(index)"
          >
            <img :src="img" class="w-full h-full object-cover" :alt="`${productName} ${index + 1}`" />
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <Badge v-if="statusLabel" :variant="statusVariant">{{ statusLabel }}</Badge>
            <span v-if="categoryLabel" class="text-xs text-muted-foreground">{{ categoryLabel }}</span>
          </div>
          <h2 class="text-xl font-bold">{{ productName }}</h2>
        </div>

        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-primary">{{ priceText || formatCurrency(0) }}</span>
          <span v-if="unit" class="text-muted-foreground">/{{ unit }}</span>
        </div>

        <div class="flex items-center gap-6 text-sm">
          <div>
            <span class="text-muted-foreground">起订数量：</span>
            <span class="font-medium">{{ minOrderQty || 1 }} {{ unit }}</span>
          </div>
        </div>

        <div class="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
          <div class="text-xs text-muted-foreground mb-1">商品描述</div>
          {{ description || '暂无描述' }}
        </div>

        <div v-if="showActions" class="flex items-center gap-4 pt-4 border-t border-border">
          <div class="inline-flex items-center border border-border rounded">
            <button class="w-9 h-9 flex items-center justify-center hover:bg-muted" :disabled="qty <= (minOrderQty ?? 1)" @click="decrement">
              <Minus class="w-4 h-4" />
            </button>
            <span class="w-12 text-center tabular-nums">{{ qty }}</span>
            <button class="w-9 h-9 flex items-center justify-center hover:bg-muted" @click="increment">
              <Plus class="w-4 h-4" />
            </button>
          </div>
          <Button class="flex-1" size="lg" @click="addToCart">
            <ShoppingCart class="w-4 h-4 mr-1.5" />
            {{ actionCountLabel }}
          </Button>
        </div>
      </div>
    </div>

    <section class="bg-card border border-border rounded-lg overflow-hidden">
      <div class="relative min-h-[220px] bg-muted">
        <img
          v-if="images[0]"
          :src="images[0]"
          :alt="`${productName} 展示图`"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"></div>
        <div class="relative z-10 max-w-xl px-6 py-8 text-white">
          <div class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles class="w-3.5 h-3.5" />
            {{ bannerTag }}
          </div>
          <h3 class="mt-4 text-2xl font-bold leading-tight">{{ bannerTitle || productName }}</h3>
          <p class="mt-3 text-sm leading-6 text-white/85">
            {{ bannerText || description || '页面内容支持主图、规格、参数、图文详情与采购提示统一展示。' }}
          </p>
        </div>
      </div>

      <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div v-for="highlight in highlights" :key="highlight.label" class="border border-border rounded-md p-4 bg-muted/25">
          <component :is="highlight.icon" class="w-5 h-5 text-primary mb-3" />
          <div class="text-sm font-semibold">{{ highlight.label }}</div>
          <div class="text-xs text-muted-foreground leading-5 mt-1">{{ highlight.value }}</div>
        </div>
      </div>

      <div class="px-5 pb-5 grid grid-cols-1 gap-5">
        <div class="space-y-4">
          <div>
            <div class="text-base font-semibold">商品参数</div>
            <div class="text-xs text-muted-foreground mt-1">采购前快速确认基础规格</div>
          </div>
          <div class="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border text-sm">
            <template v-for="spec in specs" :key="spec.label">
              <div class="bg-background px-3 py-2 text-muted-foreground">{{ spec.label }}</div>
              <div class="bg-background px-3 py-2 font-medium">{{ spec.value }}</div>
            </template>
          </div>
          <div class="rounded-md border border-border bg-muted/25 p-4">
            <div class="text-sm font-semibold">采购提示</div>
            <ul class="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
              <li v-for="tip in tips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <div class="text-base font-semibold">图文详情</div>
            <div class="text-xs text-muted-foreground mt-1">展示商品图片与补充说明</div>
          </div>
          <div class="grid grid-cols-1 gap-3">
            <div v-for="(img, index) in images" :key="index" class="overflow-hidden rounded-md border border-border bg-muted">
              <img :src="img" :alt="`${productName} 详情图 ${index + 1}`" class="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
          <div v-if="detailText" class="rounded-md border border-border p-4 text-sm leading-6 text-muted-foreground">
            {{ detailText }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
