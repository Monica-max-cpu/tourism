<script setup lang="ts">
/**
 * 阶段 5 - 门店看板
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】StoreDashboard
 * - KPI 4 卡 + 月度采购金额柱 + 销售上报趋势折线 + 库存周转仪表
 * - 兼容原 StoreWorkbench 的待办卡（订单状态 + 购物车）
 * - 价格隔离：仅 salePrice 口径
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】StoreDashboard
 */
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CreditCard, Truck, PackageCheck, ClipboardList, ShoppingBag, Wallet, TrendingUp } from 'lucide-vue-next';
import { Card, CardContent, Badge } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicChart, B2B_COLOR_PALETTE, type ChartOption } from '/@/components/ECharts';
import { useAuth } from '/@/composables/useAuth';
import { useUserStore } from '/@/stores/modules/user';
import { useCartStore } from '/@/stores/modules/cart';
import { getStoreWorkbenchSummaryApi } from '/@/api/store/order';
import { getStoreDashboardApi, type StoreDashboardData } from '/@/api/store/dashboard';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency, formatNumber } from '/@/utils/format';

const { user } = useAuth();
const userStore = useUserStore();
const router = useRouter();
const cartStore = useCartStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');

cartStore.init(storeId.value);

const loading = ref(true);
const dash = ref<StoreDashboardData | null>(null);

const sum = reactive({
  pendingPayment: 0, pendingConfirm: 0, shipping: 0, delivered: 0,
  completed30d: 0, purchaseAmount30d: 0,
});

async function loadAll() {
  const currentStoreId = storeId.value || 'mock-store';
  try {
    const [s, d] = await Promise.all([
      getStoreWorkbenchSummaryApi(currentStoreId),
      getStoreDashboardApi(currentStoreId),
    ]);
    Object.assign(sum, s);
    dash.value = d;
  } finally {
    loading.value = false;
  }
}
onMounted(loadAll);

const todos = computed(() => [
  { label: '待支付订单', value: sum.pendingPayment, icon: CreditCard, accent: 'bg-blue-500/10 text-blue-600', to: ROUTE_PATHS.STORE_ORDERS },
  { label: '待平台确认', value: sum.pendingConfirm, icon: Wallet, accent: 'bg-amber-500/10 text-amber-600', to: ROUTE_PATHS.STORE_ORDERS },
  { label: '配送中', value: sum.shipping, icon: Truck, accent: 'bg-violet-500/10 text-violet-600', to: ROUTE_PATHS.STORE_ORDERS },
  { label: '待签收', value: sum.delivered, icon: PackageCheck, accent: 'bg-cyan-500/10 text-cyan-600', to: ROUTE_PATHS.STORE_ORDERS },
  { label: '已完成（30 天）', value: sum.completed30d, icon: ClipboardList, accent: 'bg-emerald-500/10 text-emerald-600', to: ROUTE_PATHS.STORE_ORDERS },
  { label: '购物车', value: cartStore.getCount, icon: ShoppingBag, accent: 'bg-pink-500/10 text-pink-600', to: ROUTE_PATHS.STORE_CART },
]);

// 月度采购金额柱
const purchaseOption = computed<ChartOption | null>(() => {
  if (!dash.value) return null;
  const t = dash.value.purchaseMonthly;
  return {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `¥${formatNumber(v)}` },
    grid: { top: 16, left: 8, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: t.map((x) => x.month.slice(5)) },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => (v >= 10000 ? `${(v / 10000).toFixed(0)}万` : `${v}`) } },
    series: [
      {
        type: 'bar',
        name: '采购金额',
        data: t.map((x) => x.amount),
        color: B2B_COLOR_PALETTE[0],
        barMaxWidth: 22,
      },
    ],
  };
});

// 销售上报趋势折线
const salesOption = computed<ChartOption | null>(() => {
  if (!dash.value) return null;
  const t = dash.value.salesTrend;
  return {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `¥${formatNumber(v)}` },
    grid: { top: 16, left: 8, right: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: t.map((x) => x.date.slice(5)), boundaryGap: false },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        name: '销售金额',
        data: t.map((x) => x.amount),
        color: B2B_COLOR_PALETTE[1],
        areaStyle: { opacity: 0.1 },
        symbol: 'none',
      },
    ],
  };
});

// 库存周转率仪表
const turnoverOption = computed<ChartOption | null>(() => {
  if (!dash.value) return null;
  const tv = dash.value.turnover;
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: tv.max,
        splitNumber: tv.max,
        progress: { show: true, width: 14, itemStyle: { color: B2B_COLOR_PALETTE[3] } },
        axisLine: { lineStyle: { width: 14, color: [[1, '#eef2f7']] } },
        pointer: { length: '60%', width: 4 },
        anchor: { show: true, size: 8, itemStyle: { color: B2B_COLOR_PALETTE[3] } },
        title: { offsetCenter: [0, '78%'], color: '#94a3b8', fontSize: 12 },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '40%'],
          formatter: '{value} 次/月',
          color: '#0f172a',
          fontSize: 22,
          fontWeight: 600,
        },
        data: [{ value: tv.rate, name: '库存周转率' }],
      },
    ],
  };
});

const kpi = computed(() => dash.value?.kpi);

function go(to: string) { router.push(to); }
</script>

<template>
  <PageWrapper title="门店工作台" :subtitle="`欢迎，${user?.realName || '门店'}`" hero>
    <template #extra>
      <Badge variant="secondary">价格按平台销售价展示</Badge>
    </template>

    <!-- KPI 4 卡 — 浮在 Hero 上 -->
    <section class="-mt-16 relative z-10 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg" style="animation-delay:0s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">本月采购金额</p>
                <h3 class="text-3xl font-bold tracking-tight">{{ kpi ? formatCurrency(kpi.monthPurchase) : '—' }}</h3>
              </div>
              <div class="p-4 rounded-xl bg-primary/5 text-primary">
                <ShoppingBag class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg" style="animation-delay:0.08s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">本月销售金额</p>
                <h3 class="text-3xl font-bold tracking-tight text-[hsl(var(--status-success))]">
                  {{ kpi ? formatCurrency(kpi.monthSales) : '—' }}
                </h3>
              </div>
              <div class="p-4 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg" style="animation-delay:0.16s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">在途订单</p>
                <h3 class="text-3xl font-bold tracking-tight">{{ kpi ? formatNumber(kpi.shippingOrders) : '—' }}</h3>
              </div>
              <div class="p-4 rounded-xl bg-primary/5 text-primary">
                <Truck class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="overflow-hidden transition-all duration-300 hover:shadow-lg" style="animation-delay:0.24s">
          <CardContent class="py-16 px-3">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">库存周转率</p>
                <h3 class="text-3xl font-bold tracking-tight">
                  {{ kpi ? kpi.turnoverRate.toFixed(1) : '—' }}<span class="text-sm text-muted-foreground font-normal ml-1">次/月</span>
                </h3>
              </div>
              <div class="p-4 rounded-xl bg-primary/5 text-primary">
                <PackageCheck class="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- 月度采购金额 + 库存周转率 -->
    <section class="grid lg:grid-cols-3 gap-6 mb-6">
      <Card class="lg:col-span-2 animate-fade-in-up">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold mb-3">月度采购金额（近 12 月）</h3>
          <BasicChart :option="purchaseOption" :loading="loading" :height="280" />
        </CardContent>
      </Card>
      <Card class="animate-fade-in-up" style="animation-delay:0.06s">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold mb-3">库存周转率</h3>
          <BasicChart :option="turnoverOption" :loading="loading" :height="280" />
        </CardContent>
      </Card>
    </section>

    <!-- 销售上报趋势 + 待办 -->
    <section class="grid lg:grid-cols-3 gap-6 mb-6">
      <Card class="lg:col-span-2 animate-fade-in-up">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold mb-3">销售上报趋势（近 30 天）</h3>
          <BasicChart :option="salesOption" :loading="loading" :height="280" />
        </CardContent>
      </Card>
      <Card class="animate-fade-in-up" style="animation-delay:0.06s">
        <CardContent class="p-5">
          <h3 class="text-base font-semibold mb-3">待办</h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="t in todos" :key="t.label"
              class="rounded-lg border border-border/60 p-3 hover:bg-muted/40 cursor-pointer transition-colors"
              @click="go(t.to)"
            >
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center mb-2', t.accent]">
                <component :is="t.icon" class="w-4 h-4" />
              </div>
              <div class="text-lg font-semibold tabular-nums leading-none">{{ t.value }}</div>
              <div class="text-[11px] text-muted-foreground mt-1">{{ t.label }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <section class="animate-fade-in-up">
      <Card class="hover:shadow-md transition-shadow cursor-pointer max-w-sm" @click="go(ROUTE_PATHS.STORE_ORDERS)">
        <CardContent class="p-5">
          <div class="text-xs text-muted-foreground mb-2">30 天采购金额</div>
          <div class="text-2xl font-semibold tabular-nums">{{ formatCurrency(sum.purchaseAmount30d) }}</div>
        </CardContent>
      </Card>
    </section>
  </PageWrapper>
</template>
