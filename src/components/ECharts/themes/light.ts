/**
 * 阶段 5 - ECharts 自定义 light 主题
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】克制低饱和主题，禁渐变/发光
 * 主色板：#3b82f6 #10b981 #f59e0b #8b5cf6
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】克制低饱和主题
 */

/** 主色板（与业务侧配色保持一致：克制、低饱和） */
export const B2B_COLOR_PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'] as const;

/** ECharts 主题对象，registerTheme 时使用名称 'b2b-light' */
export const B2B_LIGHT_THEME = {
  color: [...B2B_COLOR_PALETTE],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
    color: '#475569',
  },
  title: {
    textStyle: { color: '#0f172a', fontWeight: 600, fontSize: 14 },
    subtextStyle: { color: '#94a3b8', fontSize: 12 },
  },
  legend: {
    textStyle: { color: '#64748b', fontSize: 12 },
    icon: 'roundRect',
    itemWidth: 10,
    itemHeight: 10,
  },
  grid: {
    left: 16,
    right: 16,
    top: 32,
    bottom: 24,
    containLabel: true,
  },
  tooltip: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: '#0f172a', fontSize: 12 },
    extraCssText: 'box-shadow: 0 6px 18px rgba(15,23,42,0.08); border-radius: 8px;',
  },
  categoryAxis: {
    axisLine: { show: true, lineStyle: { color: '#e2e8f0' } },
    axisTick: { show: false },
    axisLabel: { color: '#94a3b8', fontSize: 12 },
    splitLine: { show: false },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#94a3b8', fontSize: 12 },
    splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
  },
  line: {
    lineStyle: { width: 2 },
    symbol: 'circle',
    symbolSize: 6,
    smooth: true,
    itemStyle: { borderWidth: 0 },
  },
  bar: {
    itemStyle: { borderRadius: [4, 4, 0, 0] },
  },
  pie: {
    label: { color: '#64748b', fontSize: 12 },
    itemStyle: { borderColor: '#fff', borderWidth: 2 },
  },
  gauge: {
    axisLine: { lineStyle: { width: 14 } },
    splitLine: { length: 6, lineStyle: { color: '#fff', width: 2 } },
    axisTick: { show: false },
    axisLabel: { color: '#94a3b8', fontSize: 11, distance: 14 },
    pointer: { width: 4 },
    detail: { color: '#0f172a', fontSize: 22, fontWeight: 600 },
    title: { color: '#94a3b8', fontSize: 12 },
  },
};

export const B2B_THEME_NAME = 'b2b-light';
