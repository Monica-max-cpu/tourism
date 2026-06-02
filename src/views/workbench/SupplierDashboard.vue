<script setup lang="ts">
/**
 * 阶段 5 - 供应商看板
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】SupplierDashboard
 * - KPI 4 卡 + 接单趋势折线 + 报价转化率仪表 + 月度结算柱
 * - 兼容原 SupplierWorkbench 的统计卡（订单/库存/发货/结算）
 * - 价格隔离：仅出现 costPrice / 自报价金额，无 salePrice / profit
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】SupplierDashboard
 */
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Tags, Truck, Boxes, Wallet, GitMerge, AlertTriangle, FileCheck } from 'lucide-vue-next';
import { Card, CardContent, Badge } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicChart, B2B_COLOR_PALETTE, type ChartOption } from '/@/components/ECharts';
import { useAuth } from '/@/composables/useAuth';
import { getSupplierOrderSummaryApi } from '/@/api/supplier/order';
import { getSupplierStockSummaryApi, getSupplierSettlementSummaryApi } from '/@/api/supplier/inventory';
import { getShipmentSummaryApi } from '/@/api/supplier/shipment';
import { getSupplierDashboardApi, type SupplierDashboardData } from '/@/api/supplier/dashboard';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency, formatNumber } from '/@/utils/format';

const { user } = useAuth();
const router = useRouter();

const loading = ref(true);
const dash = ref<SupplierDashboardData | null>(null);

const orderSum = reactive({ triggered: 0, confirmed: 0, shipping: 0, completed: 0 });
const stockSum = reactive({ total: 0, low: 0, out: 0 });
const shipSum = reactive({ pending: 0, shipped: 0, delivered: 0, exception: 0 });
const settleSum = reactive({ pendingAmount: 0, confirmedAmount: 0, paidAmount: 0 });

async function loadAll() {
  try {
    const [o, s, sh, st, d] = await Promise.all([
      getSupplierOrderSummaryApi(),
      getSupplierStockSummaryApi(),
      getShipmentSummaryApi(),
      getSupplierSettlementSummaryApi(),
      getSupplierDashboardApi(),
    ]);
    Object.assign(orderSum, o);
    Object.assign(stockSum, s);
    Object.assign(shipSum, sh);
    Object.assign(settleSum, st);
    dash.value = d;
  } finally {
    loading.value = false;
  }
}
onMounted(loadAll);

const todos = computed(() => [
  { label: '待确认集采单', value: orderSum.triggered, icon: Tags, accent: 'bg-blue-500/10 text-blue-600', to: ROUTE_PATHS.SUPPLIER_ORDERS_PENDING },
  { label: '待发货任务', value: shipSum.pending, icon: Truck, accent: 'bg-amber-500/10 text-amber-600', to: ROUTE_PATHS.SUPPLIER_SHIPMENTS },
  { label: '进行中订单', value: orderSum.confirmed + orderSum.shipping, icon: GitMerge, accent: 'bg-violet-500/10 text-violet-600', to: ROUTE_PATHS.SUPPLIER_ORDERS_ACTIVE },
  { label: '库存不足/缺货', value: stockSum.low + stockSum.out, icon: AlertTriangle, accent: 'bg-red-500/10 text-red-600', to: ROUTE_PATHS.SUPPLIER_INVENTORY },
  { label: '库存 SKU 数', value: stockSum.total, icon: Boxes, accent: 'bg-emerald-500/10 text-emerald-600', to: ROUTE_PATHS.SUPPLIER_INVENTORY },
]);

// 接单趋势折线
const acceptOption = computed<ChartOption | null>(() => {
  if (!dash.value) return null;
  const t = dash.value.acceptTrend;
  return {
    tooltip: { trigger: 'axis' },
    grid: { top: 16, left: 8, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: t.map((x) => x.week), boundaryGap: false },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        name: '接单数',
        data: t.map((x) => x.orders),
        color: B2B_COLOR_PALETTE[0],
        areaStyle: { opacity: 0.08 },
      },
    ],
  };
});

// 报价转化率仪表
const funnelOption = computed<ChartOption | null>(() => {
  if (!dash.value) return null;
  const f = dash.value.quoteFunnel;
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 5,
        progress: { show: true, width: 14, itemStyle: { color: B2B_COLOR_PALETTE[1] } },
        axisLine: { lineStyle: { width: 14, color: [[1, '#eef2f7']] } },
        pointer: { length: '60%', width: 4 },
        anchor: { show: true, size: 8, itemStyle: { color: B2B_COLOR_PALETTE[1] } },
        title: { offsetCenter: [0, '78%'], color: '#94a3b8', fontSize: 12 },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '40%'],
          formatter: '{value}%',
          color: '#0f172a',
          fontSize: 24,
          fontWeight: 600,
        },
        data: [{ value: f.conversion, name: `通过 ${f.approved} / 提交 ${f.submitted}` }],
      },
    ],
  };
});

// 月度结算柱
const settleOption = computed<ChartOption | null>(() => {
  if (!dash.value) return null;
  const t = dash.value.settleMonthly;
  return {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `¥${formatNumber(v)}` },
    grid: { top: 16, left: 8, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: t.map((x) => x.month.slice(5)) },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => (v >= 10000 ? `${(v / 10000).toFixed(0)}万` : `${v}`) } },
    series: [
      {
        type: 'bar',
        name: '结算金额',
        data: t.map((x) => x.amount),
        color: B2B_COLOR_PALETTE[2],
        barMaxWidth: 22,
      },
    ],
  };
});

const kpi = computed(() => dash.value?.kpi);

function go(to: string) { router.push(to); }
</script>

<template>
  <PageWrapper title="供应商工作台" :subtitle="`欢迎，${user?.realName || '供应商'}`" hero>
    <template #extra>
      <Badge variant="secondary">仅展示与您相关的数据</Badge>
    </template>

    <!-- KPI 4 卡 — 浮在 Hero 上 -->
    <section class="-mt-16 relative z-10 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary" style="animation-delay:0s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">12 周累计接单</p>
                <h3 class="text-3xl font-bold tracking-tight">{{ kpi ? formatNumber(kpi.totalOrders) : '—' }}</h3>
              </div>
              <div class="p-4 rounded-xl bg-primary/5 text-primary">
                <Tags class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary" style="animation-delay:0.08s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">12 周累计发货</p>
                <h3 class="text-3xl font-bold tracking-tight">{{ kpi ? formatNumber(kpi.totalShipped) : '—' }}</h3>
              </div>
              <div class="p-4 rounded-xl bg-primary/5 text-primary">
                <Truck class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary" style="animation-delay:0.16s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">报价提交数</p>
                <h3 class="text-3xl font-bold tracking-tight">{{ kpi ? formatNumber(kpi.totalQuotes) : '—' }}</h3>
              </div>
              <div class="p-4 rounded-xl bg-primary/5 text-primary">
                <FileCheck class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary" style="animation-delay:0.24s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">报价通过率</p>
                <h3 class="text-3xl font-bold tracking-tight text-[hsl(var(--status-success))]">
                  {{ kpi ? kpi.approveRate.toFixed(1) + '%' : '—' }}
                </h3>
              </div>
              <div class="p-4 rounded-xl bg-emerald-50 text-emerald-600">
                <GitMerge class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- 接单趋势 + 报价转化率 -->
    <section class="grid lg:grid-cols-3 gap-6 mb-6">
      <Card class="lg:col-span-2 animate-fade-in-up">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold mb-3">接单趋势（近 12 周）</h3>
          <BasicChart :option="acceptOption" :loading="loading" :height="280" />
        </CardContent>
      </Card>
      <Card class="animate-fade-in-up" style="animation-delay:0.06s">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold mb-3">报价转化率</h3>
          <BasicChart :option="funnelOption" :loading="loading" :height="280" />
        </CardContent>
      </Card>
    </section>

    <!-- 月度结算 + 待办卡片 -->
    <section class="grid lg:grid-cols-3 gap-6 mb-6">
      <Card class="lg:col-span-2 animate-fade-in-up">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold mb-3">月度结算金额（近 12 月）</h3>
          <BasicChart :option="settleOption" :loading="loading" :height="280" />
        </CardContent>
      </Card>

      <Card class="animate-fade-in-up" style="animation-delay:0.06s">
        <CardContent class="p-5 space-y-3">
          <h3 class="text-base font-semibold mb-1">待办</h3>
          <div
            v-for="t in todos" :key="t.label"
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
            @click="go(t.to)"
          >
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0', t.accent]">
              <component :is="t.icon" class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs text-muted-foreground">{{ t.label }}</div>
              <div class="text-lg font-semibold tabular-nums leading-tight">{{ t.value }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- 结算 3 卡 -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
      <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="go(ROUTE_PATHS.SUPPLIER_SETTLEMENTS)">
        <CardContent class="p-5">
          <div class="flex items-center gap-3 mb-2">
            <Wallet class="w-4 h-4 text-amber-600" />
            <div class="text-xs text-muted-foreground">待确认应收</div>
          </div>
          <div class="text-2xl font-semibold tabular-nums">{{ formatCurrency(settleSum.pendingAmount) }}</div>
        </CardContent>
      </Card>
      <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="go(ROUTE_PATHS.SUPPLIER_SETTLEMENTS)">
        <CardContent class="p-5">
          <div class="flex items-center gap-3 mb-2">
            <Wallet class="w-4 h-4 text-blue-600" />
            <div class="text-xs text-muted-foreground">已确认未到账</div>
          </div>
          <div class="text-2xl font-semibold tabular-nums">{{ formatCurrency(settleSum.confirmedAmount) }}</div>
        </CardContent>
      </Card>
      <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="go(ROUTE_PATHS.SUPPLIER_SETTLEMENTS)">
        <CardContent class="p-5">
          <div class="flex items-center gap-3 mb-2">
            <Wallet class="w-4 h-4 text-emerald-600" />
            <div class="text-xs text-muted-foreground">累计已到账</div>
          </div>
          <div class="text-2xl font-semibold tabular-nums">{{ formatCurrency(settleSum.paidAmount) }}</div>
        </CardContent>
      </Card>
    </section>
  </PageWrapper>
</template>
