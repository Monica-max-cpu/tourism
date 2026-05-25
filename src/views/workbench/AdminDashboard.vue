<script setup lang="ts">
/**
 * 阶段 5 - 平台管理员看板
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】AdminDashboard
 * - KPI 4 卡 + 销售/采购/毛利趋势折线 + 供应商分布饼 + Top10 SKU 柱
 * - 兼容原 AdminWorkbench 的待办区与风险提醒
 * - 利润口径用 v-auth='b2b:profit:view' 控制
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】AdminDashboard
 */
import { ref, computed, onMounted } from 'vue';
import { TrendingUp, AlertCircle, FileCheck, CreditCard, GitMerge, Wallet, ShoppingCart } from 'lucide-vue-next';
import { Card, CardContent, Badge, Button } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicChart, B2B_COLOR_PALETTE, type ChartOption } from '/@/components/ECharts';
import { useAuth } from '/@/composables/useAuth';
import { formatCurrency, formatNumber } from '/@/utils/format';
import { getAdminDashboardApi, type AdminDashboardData } from '/@/api/admin/dashboard';

const { user } = useAuth();
const loading = ref(true);
const data = ref<AdminDashboardData | null>(null);

onMounted(async () => {
  try {
    data.value = await getAdminDashboardApi();
  } finally {
    loading.value = false;
  }
});

const todos = [
  { label: '待审核供应商', value: 8, icon: FileCheck, accent: 'bg-amber-500/10 text-amber-600' },
  { label: '待审核门店', value: 12, icon: FileCheck, accent: 'bg-amber-500/10 text-amber-600' },
  { label: '待审核报价', value: 23, icon: FileCheck, accent: 'bg-amber-500/10 text-amber-600' },
  { label: '待确认收款', value: 5, icon: CreditCard, accent: 'bg-blue-500/10 text-blue-600' },
  { label: '待集采商品', value: 7, icon: GitMerge, accent: 'bg-violet-500/10 text-violet-600' },
  { label: '异常发货单', value: 2, icon: AlertCircle, accent: 'bg-red-500/10 text-red-600' },
];

// 趋势折线
const trendOption = computed<ChartOption | null>(() => {
  if (!data.value) return null;
  const t = data.value.trend;
  return {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `¥${formatNumber(v)}` },
    legend: { data: ['门店销售', '供应商采购', '平台毛利'], top: 0, right: 0 },
    grid: { top: 36, left: 8, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: t.map((x) => x.month.slice(5)), boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => (v >= 10000 ? `${(v / 10000).toFixed(0)}万` : `${v}`) } },
    series: [
      { name: '门店销售', type: 'line', data: t.map((x) => x.sales), color: B2B_COLOR_PALETTE[0], areaStyle: { opacity: 0.06 } },
      { name: '供应商采购', type: 'line', data: t.map((x) => x.cost), color: B2B_COLOR_PALETTE[3] },
      { name: '平台毛利', type: 'line', data: t.map((x) => x.profit), color: B2B_COLOR_PALETTE[1] },
    ],
  };
});

// 供应商交易额分布饼
const shareOption = computed<ChartOption | null>(() => {
  if (!data.value) return null;
  return {
    tooltip: { trigger: 'item', valueFormatter: (v: number) => `¥${formatNumber(v)}` },
    legend: { orient: 'vertical', right: 8, top: 'middle', itemHeight: 8 },
    series: [
      {
        type: 'pie',
        radius: ['52%', '74%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: data.value.supplierShare,
      },
    ],
  };
});

// Top10 SKU 柱
const skuOption = computed<ChartOption | null>(() => {
  if (!data.value) return null;
  const list = [...data.value.topSkus].sort((a, b) => a.qty - b.qty);
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = params[0];
        const item = data.value!.topSkus.find((x) => x.name === p.name);
        return `<div style="font-weight:600;margin-bottom:4px">${p.name}</div>
          销量：${formatNumber(p.value)} 件<br/>金额：¥${formatNumber(item?.amount ?? 0)}`;
      },
    },
    grid: { top: 8, left: 8, right: 24, bottom: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`) } },
    yAxis: { type: 'category', data: list.map((x) => x.name), axisLabel: { width: 110, overflow: 'truncate' } },
    series: [
      {
        type: 'bar',
        data: list.map((x) => x.qty),
        color: B2B_COLOR_PALETTE[0],
        barMaxWidth: 14,
        itemStyle: { borderRadius: [0, 4, 4, 0] },
      },
    ],
  };
});

const kpi = computed(() => data.value?.kpi);
</script>

<template>
  <PageWrapper title="B2B 工作台" :subtitle="`欢迎回来，${user?.realName || '管理员'}`" hero>
    <template #extra>
      <Badge variant="secondary">数据每 5 分钟自动刷新</Badge>
    </template>

    <!-- KPI 区 — 浮在 Hero 上 -->
    <section class="-mt-16 relative z-10 mb-6" v-auth="'b2b:profit:view'">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary" style="animation-delay:0s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">门店销售总额（近 12 月）</p>
                <h3 class="text-3xl font-bold tracking-tight">{{ kpi ? formatCurrency(kpi.totalSales) : '—' }}</h3>
              </div>
              <div class="p-4 rounded-xl bg-primary/5 text-primary">
                <TrendingUp class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary" style="animation-delay:0.08s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">供应商采购总额</p>
                <h3 class="text-3xl font-bold tracking-tight">{{ kpi ? formatCurrency(kpi.totalCost) : '—' }}</h3>
              </div>
              <div class="p-4 rounded-xl bg-primary/5 text-primary">
                <ShoppingCart class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary" style="animation-delay:0.16s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">累计毛利</p>
                <h3 class="text-3xl font-bold tracking-tight text-[hsl(var(--status-success))]">
                  {{ kpi ? formatCurrency(kpi.totalProfit) : '—' }}
                </h3>
              </div>
              <div class="p-4 rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary" style="animation-delay:0.24s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">综合毛利率</p>
                <h3 class="text-3xl font-bold tracking-tight text-[hsl(var(--status-success))]">
                  {{ kpi ? kpi.profitRate.toFixed(1) + '%' : '—' }}
                </h3>
              </div>
              <div class="p-4 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- 图表：销售/采购/毛利 趋势 + 供应商分布 -->
    <section class="grid lg:grid-cols-3 gap-6 mb-6">
      <Card class="lg:col-span-2 animate-fade-in-up">
        <CardContent class="p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-semibold flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-primary" />
              销售 / 采购 / 毛利 趋势
            </h3>
            <Button variant="outline" size="sm" v-auth="'b2b:profit:view'">查看明细</Button>
          </div>
          <BasicChart :option="trendOption" :loading="loading" :height="300" />
        </CardContent>
      </Card>

      <Card class="animate-fade-in-up" style="animation-delay:0.06s">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold flex items-center gap-2 mb-3">
            <ShoppingCart class="w-4 h-4 text-primary" />
            供应商交易额分布
          </h3>
          <BasicChart :option="shareOption" :loading="loading" :height="300" />
        </CardContent>
      </Card>
    </section>

    <!-- Top10 SKU -->
    <section class="grid lg:grid-cols-3 gap-6 mb-6">
      <Card class="lg:col-span-2 animate-fade-in-up">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold flex items-center gap-2 mb-3">
            <GitMerge class="w-4 h-4 text-primary" />
            热销 SKU Top 10
          </h3>
          <BasicChart :option="skuOption" :loading="loading" :height="380" />
        </CardContent>
      </Card>

      <Card class="animate-fade-in-up" style="animation-delay:0.06s">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold flex items-center gap-2 mb-4">
            <Wallet class="w-4 h-4 text-primary" />
            待办事项
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="t in todos"
              :key="t.label"
              class="rounded-lg border border-border/60 p-3 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center mb-2', t.accent]">
                <component :is="t.icon" class="w-4 h-4" />
              </div>
              <div class="text-xl font-semibold tabular-nums leading-none">{{ t.value }}</div>
              <div class="text-[11px] text-muted-foreground mt-1">{{ t.label }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- 风险提醒 -->
    <section class="animate-fade-in-up">
      <Card>
        <CardContent class="p-5">
          <h3 class="text-base font-semibold flex items-center gap-2 mb-3">
            <AlertCircle class="w-4 h-4 text-destructive" />
            风险提醒
          </h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
              <div class="flex items-center gap-3">
                <Badge variant="destructive">报价过期</Badge>
                <span class="text-sm">3 个商品报价已过有效期，影响集采触发</span>
              </div>
              <Button variant="ghost" size="sm">查看</Button>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <div class="flex items-center gap-3">
                <Badge variant="warning">库存不足</Badge>
                <span class="text-sm">2 个供应商库存低于预警阈值</span>
              </div>
              <Button variant="ghost" size="sm">查看</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  </PageWrapper>
</template>
