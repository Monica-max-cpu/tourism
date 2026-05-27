<script setup lang="ts">
/**
 * 门店工作台
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店工作台接入真实统计
 * - 订单/销售汇总通过 API 拉取（按 storeId）
 * - 卡片可点击跳转对应模块
 * - 仅展示销售价口径
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店工作台接入真实统计
 */
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CreditCard, Truck, PackageCheck, ClipboardList, ShoppingBag, Wallet } from 'lucide-vue-next';
import { Card, CardContent, Badge } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { useAuth } from '/@/composables/useAuth';
import { useUserStore } from '/@/stores/modules/user';
import { useCartStore } from '/@/stores/modules/cart';
import { getStoreWorkbenchSummaryApi } from '/@/api/store/order';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency } from '/@/utils/format';

const { user } = useAuth();
const userStore = useUserStore();
const router = useRouter();
const cartStore = useCartStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');

cartStore.init(storeId.value);

const sum = reactive({
  pendingPayment: 0, pendingConfirm: 0, shipping: 0, delivered: 0,
  completed30d: 0, purchaseAmount30d: 0,
});

async function loadAll() {
  if (!storeId.value) return;
  const s = await getStoreWorkbenchSummaryApi(storeId.value);
  Object.assign(sum, s);
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

function go(to: string) { router.push(to); }
</script>

<template>
  <PageWrapper title="门店工作台" :subtitle="`欢迎，${user?.realName || '门店'}`">
    <template #extra>
      <Badge variant="secondary">价格按平台销售价展示</Badge>
    </template>

    <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-up">
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
          <div class="text-2xl font-bold tracking-tight tabular-nums">{{ t.value }}</div>
          <div class="text-xs text-muted-foreground mt-1">{{ t.label }}</div>
        </CardContent>
      </Card>
    </section>

    <section class="mt-6 animate-fade-in-up">
      <Card class="hover:shadow-md transition-shadow cursor-pointer max-w-sm" @click="go(ROUTE_PATHS.STORE_ORDERS)">
        <CardContent class="p-5">
          <div class="flex items-center gap-3 mb-2">
            <ShoppingBag class="w-4 h-4 text-blue-600" />
            <div class="text-xs text-muted-foreground">30 天采购金额</div>
          </div>
          <div class="text-2xl font-bold tracking-tight tabular-nums">{{ formatCurrency(sum.purchaseAmount30d) }}</div>
        </CardContent>
      </Card>
    </section>
  </PageWrapper>
</template>
