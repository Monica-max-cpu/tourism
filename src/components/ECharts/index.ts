/**
 * 阶段 5 - ECharts 封装出口
 */
import BasicChart from './BasicChart.vue';

export { BasicChart };
export { useChart } from './useChart';
export type { ChartOption, ChartSeriesOption } from './useChart';
export { B2B_COLOR_PALETTE, B2B_THEME_NAME } from './themes/light';

export default BasicChart;
