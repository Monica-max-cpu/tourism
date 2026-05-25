<script setup lang="ts">
/**
 * 阶段 5 - BasicChart
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】ECharts 通用图表
 * - props: option / height / loading / theme
 * - autoResize 由 useChart 内部 ResizeObserver 完成
 * - loading 状态显示骨架，空状态显示提示
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】BasicChart
 */
import { ref, computed, toRef } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { useChart, type ChartOption } from './useChart';

interface Props {
  option: ChartOption | null;
  /** 图表高度，默认 320 */
  height?: number | string;
  /** 加载中状态 */
  loading?: boolean;
  /** 自定义主题名，默认 b2b-light */
  theme?: string;
  /** 空状态文案 */
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: 320,
  loading: false,
  theme: 'b2b-light',
  emptyText: '暂无数据',
});

const elRef = ref<HTMLElement | null>(null);
const optionRef = toRef(props, 'option');

useChart(elRef, optionRef, { theme: props.theme });

const heightStyle = computed(() => (typeof props.height === 'number' ? `${props.height}px` : props.height));

const isEmpty = computed(() => {
  const o = props.option;
  if (!o) return true;
  const series = (o as any).series;
  if (!series) return true;
  if (Array.isArray(series)) {
    return series.length === 0 || series.every((s: any) => !s.data || (Array.isArray(s.data) && s.data.length === 0));
  }
  return false;
});
</script>

<template>
  <div class="basic-chart relative w-full" :style="{ height: heightStyle }">
    <div ref="elRef" class="w-full h-full" />

    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-md"
    >
      <Loader2 class="w-5 h-5 text-primary animate-spin" />
    </div>

    <div
      v-else-if="isEmpty"
      class="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none"
    >
      {{ emptyText }}
    </div>
  </div>
</template>
