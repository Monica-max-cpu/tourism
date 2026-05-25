<script setup lang="ts">
import { TrendingUp, AlertCircle, FileCheck, CreditCard, GitMerge, Truck, Wallet } from 'lucide-vue-next';
import { Card, CardContent, Badge, Button } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { useAuth } from '/@/composables/useAuth';
import { formatCurrency, formatNumber } from '/@/utils/format';

const { user } = useAuth();

const todos = [
  { label: '待审核供应商', value: 8, icon: FileCheck, accent: 'bg-amber-500/10 text-amber-600' },
  { label: '待审核门店', value: 12, icon: FileCheck, accent: 'bg-amber-500/10 text-amber-600' },
  { label: '待审核报价', value: 23, icon: FileCheck, accent: 'bg-amber-500/10 text-amber-600' },
  { label: '待确认收款', value: 5, icon: CreditCard, accent: 'bg-blue-500/10 text-blue-600' },
  { label: '待集采商品', value: 7, icon: GitMerge, accent: 'bg-violet-500/10 text-violet-600' },
  { label: '异常发货单', value: 2, icon: AlertCircle, accent: 'bg-red-500/10 text-red-600' },
];

const profit = {
  revenue: 8523000,
  cost: 6210000,
  gross: 2313000,
  rate: 27.1,
};

const collective = {
  pendingGroups: 7,
  inProgress: 12,
  awaitConfirm: 3,
  awaitDelivery: 18,
};
</script>

<template>
  <PageWrapper title="B2B 工作台" :subtitle="`欢迎回来，${user?.realName || '管理员'}`">
    <template #extra>
      <Badge variant="secondary">数据每 5 分钟自动刷新</Badge>
    </template>

    <!-- 待办区 -->
    <section class="mb-8 animate-fade-in-up">
      <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <span class="w-1 h-5 rounded-full bg-primary" />
        待办事项
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card
          v-for="(t, idx) in todos"
          :key="t.label"
          class="cursor-pointer hover:shadow-md transition-shadow animate-fade-in-up"
          :style="{ animationDelay: `${idx * 0.04}s` }"
        >
          <CardContent class="p-5">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mb-3', t.accent]">
              <component :is="t.icon" class="w-5 h-5" />
            </div>
            <div class="text-2xl font-bold tracking-tight">{{ t.value }}</div>
            <div class="text-xs text-muted-foreground mt-1">{{ t.label }}</div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- 利润 + 集采 -->
    <section class="grid lg:grid-cols-3 gap-6 mb-8">
      <Card class="lg:col-span-2 animate-fade-in-up">
        <CardContent class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-primary" />
              利润概览
            </h3>
            <Button variant="outline" size="sm" v-auth="'b2b:profit:view'">查看详情</Button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div class="text-xs text-muted-foreground mb-1">门店收入</div>
              <div class="text-2xl font-bold">{{ formatCurrency(profit.revenue) }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">供应商成本</div>
              <div class="text-2xl font-bold">{{ formatCurrency(profit.cost) }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">毛利润</div>
              <div class="text-2xl font-bold text-[hsl(var(--status-success))]">{{ formatCurrency(profit.gross) }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">毛利率</div>
              <div class="text-2xl font-bold text-[hsl(var(--status-success))]">{{ profit.rate }}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="animate-fade-in-up" style="animation-delay: 0.08s">
        <CardContent class="p-6 space-y-4">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <GitMerge class="w-5 h-5 text-primary" />
            集采概览
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">待集采商品</span>
              <span class="font-semibold">{{ formatNumber(collective.pendingGroups) }} 组</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">集采进行中</span>
              <span class="font-semibold">{{ formatNumber(collective.inProgress) }} 单</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">待供应商确认</span>
              <span class="font-semibold">{{ formatNumber(collective.awaitConfirm) }} 单</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">待发货</span>
              <span class="font-semibold">{{ formatNumber(collective.awaitDelivery) }} 单</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- 风险提醒 -->
    <section class="animate-fade-in-up" style="animation-delay: 0.12s">
      <Card>
        <CardContent class="p-6">
          <h3 class="text-lg font-semibold flex items-center gap-2 mb-4">
            <AlertCircle class="w-5 h-5 text-destructive" />
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
