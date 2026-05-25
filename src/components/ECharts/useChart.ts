/**
 * 阶段 5 - useChart：BasicChart 内部使用
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】ECharts 实例 + autoResize 封装
 * - 一次性按需注册主题
 * - ResizeObserver 自动随容器尺寸变化 resize
 * - option 响应式：setOption(...,{notMerge:true}) 避免老配置残留
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】ECharts 实例封装
 */
import { onBeforeUnmount, onMounted, ref, shallowRef, watch, type Ref } from 'vue';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  BarChart,
  LineChart,
  PieChart,
  GaugeChart,
  type BarSeriesOption,
  type LineSeriesOption,
  type PieSeriesOption,
  type GaugeSeriesOption,
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';
import { B2B_LIGHT_THEME, B2B_THEME_NAME } from './themes/light';

// 仅注册一次
let registered = false;
function ensureInit() {
  if (registered) return;
  echarts.use([
    CanvasRenderer,
    BarChart,
    LineChart,
    PieChart,
    GaugeChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DataZoomComponent,
  ]);
  echarts.registerTheme(B2B_THEME_NAME, B2B_LIGHT_THEME as any);
  registered = true;
}

export type ChartSeriesOption = BarSeriesOption | LineSeriesOption | PieSeriesOption | GaugeSeriesOption;
export type ChartOption = echarts.ComposeOption<ChartSeriesOption> & Record<string, any>;

export interface UseChartOptions {
  /** 主题名，默认 b2b-light */
  theme?: string;
  /** option 是否合并模式，默认 false（不合并，避免脏数据） */
  notMerge?: boolean;
}

export function useChart(elRef: Ref<HTMLElement | null>, optionRef: Ref<ChartOption | null>, opts: UseChartOptions = {}) {
  ensureInit();
  const chart = shallowRef<echarts.ECharts | null>(null);
  const ready = ref(false);
  let observer: ResizeObserver | null = null;

  function doInit() {
    if (!elRef.value || chart.value) return;
    chart.value = echarts.init(elRef.value, opts.theme ?? B2B_THEME_NAME);
    if (optionRef.value) {
      chart.value.setOption(optionRef.value, { notMerge: opts.notMerge ?? true });
    }
    observer = new ResizeObserver(() => chart.value?.resize());
    observer.observe(elRef.value);
    ready.value = true;
  }

  function dispose() {
    observer?.disconnect();
    observer = null;
    chart.value?.dispose();
    chart.value = null;
    ready.value = false;
  }

  onMounted(doInit);
  onBeforeUnmount(dispose);

  // option 响应式更新
  watch(
    optionRef,
    (val) => {
      if (chart.value && val) {
        chart.value.setOption(val, { notMerge: opts.notMerge ?? true });
      }
    },
    { deep: true },
  );

  function resize() {
    chart.value?.resize();
  }

  return { chart, ready, resize, dispose };
}
