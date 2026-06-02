<script setup lang="ts">
/**
 * 供应商工作台
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商工作台接入真实统计
 * - 订单/库存/结算汇总通过 API 拉取（后端按登录用户自动关联）
 * - 卡片可点击跳转对应模块
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商工作台接入真实统计
 */
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Tags, Truck, Boxes, Wallet, GitMerge, AlertTriangle } from 'lucide-vue-next';
import { Card, CardContent, Badge } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { useAuth } from '/@/composables/useAuth';
import { getSupplierOrderSummaryApi } from '/@/api/supplier/order';
import { getSupplierStockSummaryApi, getSupplierSettlementSummaryApi } from '/@/api/supplier/inventory';
import { getShipmentSummaryApi } from '/@/api/supplier/shipment';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency } from '/@/utils/format';

const { user } = useAuth();
const router = useRouter();

const orderSum = reactive({ triggered: 0, confirmed: 0, shipping: 0, completed: 0 });
const stockSum = reactive({ total: 0, low: 0, out: 0 });
const shipSum = reactive({ pending: 0, shipped: 0, delivered: 0, exception: 0 });
const settleSum = reactive({ pendingAmount: 0, confirmedAmount: 0, paidAmount: 0 });

async function loadAll() {
  const [o, s, sh, st] = await Promise.all([
    getSupplierOrderSummaryApi(),
    getSupplierStockSummaryApi(),
    getShipmentSummaryApi(),
    getSupplierSettlementSummaryApi(),
  ]);
  Object.assign(orderSum, o);
  Object.assign(stockSum, s);
  Object.assign(shipSum, sh);
  Object.assign(settleSum, st);
}
onMounted(() => loadAll());

const todos = computed(() => [
  { label: '待确认集采单', value: orderSum.triggered, icon: Tags, accent: 'bg-blue-500/10 text-blue-600', to: ROUTE_PATHS.SUPPLIER_ORDERS_PENDING },
  { label: '待发货任务', value: shipSum.pending, icon: Truck, accent: 'bg-amber-500/10 text-amber-600', to: ROUTE_PATHS.SUPPLIER_SHIPMENTS },
  { label: '进行中订单', value: orderSum.confirmed + orderSum.shipping, icon: GitMerge, accent: 'bg-violet-500/10 text-violet-600', to: ROUTE_PATHS.SUPPLIER_ORDERS_ACTIVE },
  { label: '库存不足/缺货', value: stockSum.low + stockSum.out, icon: AlertTriangle, accent: 'bg-red-500/10 text-red-600', to: ROUTE_PATHS.SUPPLIER_INVENTORY },
  { label: '库存 SKU 数', value: stockSum.total, icon: Boxes, accent: 'bg-emerald-500/10 text-emerald-600', to: ROUTE_PATHS.SUPPLIER_INVENTORY },
]);

function go(to: string) { router.push(to); }
</script>

<template>
  <PageWrapper title="供应商工作台" :subtitle="`欢迎，${user?.realName || '供应商'}`">
    <template #extra>
      <Badge variant="secondary">仅展示与您相关的数据</Badge>
    </template>

    <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in-up">
      <Card
        v-for="(t, idx) in todos" :key="t.label"
        class="hover:shadow-md transition-shadow animate-fade-in-up cursor-pointer"
        :style="{ animationDelay: `${idx * 0.04}s` }"
        @click="go(t.to)"
      >
        <CardContent class="p-5">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mb-3', t.accent]">
            <component :is="t.icon" class="w-5 h-5" />
          </div>
          <div class="text-2xl font-bold tracking-tight">{{ t.value }}</div>
          <div class="text-xs text-muted-foreground mt-1">{{ t.label }}</div>
        </CardContent>
      </Card>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-fade-in-up">
      <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="go(ROUTE_PATHS.SUPPLIER_SETTLEMENTS)">
        <CardContent class="p-5">
          <div class="flex items-center gap-3 mb-2">
            <Wallet class="w-4 h-4 text-amber-600" />
            <div class="text-xs text-muted-foreground">待确认应收</div>
          </div>
          <div class="text-2xl font-bold tracking-tight">{{ formatCurrency(settleSum.pendingAmount) }}</div>
        </CardContent>
      </Card>
      <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="go(ROUTE_PATHS.SUPPLIER_SETTLEMENTS)">
        <CardContent class="p-5">
          <div class="flex items-center gap-3 mb-2">
            <Wallet class="w-4 h-4 text-blue-600" />
            <div class="text-xs text-muted-foreground">已确认未到账</div>
          </div>
          <div class="text-2xl font-bold tracking-tight">{{ formatCurrency(settleSum.confirmedAmount) }}</div>
        </CardContent>
      </Card>
      <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="go(ROUTE_PATHS.SUPPLIER_SETTLEMENTS)">
        <CardContent class="p-5">
          <div class="flex items-center gap-3 mb-2">
            <Wallet class="w-4 h-4 text-emerald-600" />
            <div class="text-xs text-muted-foreground">累计已到账</div>
          </div>
          <div class="text-2xl font-bold tracking-tight">{{ formatCurrency(settleSum.paidAmount) }}</div>
        </CardContent>
      </Card>
    </section>
  </PageWrapper>
</template>
