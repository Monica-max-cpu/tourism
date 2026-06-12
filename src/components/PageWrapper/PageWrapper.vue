<script setup lang="ts">
import { computed } from 'vue';
import {
  ChevronLeft,
  Calendar,
  CreditCard,
  ShoppingCart,
  Store,
  Truck,
  Boxes,
  Users,
  FileText,
  ClipboardCheck,
  Settings,
  Wallet,
  BarChart3,
  PackageSearch,
  BadgePercent,
  Building2,
  UserCog,
  type LucideIcon,
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { Button } from '/@/components/ui';

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  hero?: boolean;
  backTo?: string;
}
const props = withDefaults(defineProps<Props>(), { showBack: false, hero: false, backTo: '' });
const router = useRouter();

function handleBack() {
  if (props.backTo) {
    router.push(props.backTo);
    return;
  }
  router.back();
}

const titleIcon = computed<LucideIcon>(() => {
  const title = props.title || '';

  if (/授信|账单|支付/.test(title)) return CreditCard;
  if (/订单|采购|购物车/.test(title)) return ShoppingCart;
  if (/门店/.test(title)) return Store;
  if (/供应商|发货|物流/.test(title)) return Truck;
  if (/库存|仓库/.test(title)) return Boxes;
  if (/用户|账号/.test(title)) return UserCog;
  if (/角色|菜单|字典|配置|系统/.test(title)) return Settings;
  if (/审核|审批/.test(title)) return ClipboardCheck;
  if (/结算|利润|对账/.test(title)) return Wallet;
  if (/报表|分析|统计|看板/.test(title)) return BarChart3;
  if (/商品|目录|报价|集采/.test(title)) return PackageSearch;
  if (/企业资料|资料/.test(title)) return Building2;
  if (/客户|成员|组织/.test(title)) return Users;
  if (/合同|单据|记录|详情/.test(title)) return FileText;
  if (/营销|活动|优惠/.test(title)) return BadgePercent;

  return CreditCard;
});
</script>

<template>
  <div class="min-h-full pb-12">
    <!-- Hero 模式：工作台专用，带背景图的高 banner -->
    <div v-if="props.hero" class="relative min-h-48 w-full overflow-hidden bg-primary">
      <div class="absolute inset-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzc5NTV8MHwxfHNlYXJjaHw1fHxkYXRhJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzfGVufDB8MHx8fDE3NzA3MDQ2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
          class="w-full h-full object-cover"
          alt=""
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
      <div class="relative container mx-auto flex min-h-48 flex-col justify-center px-6 py-10 md:py-12">
        <div class="animate-fade-in-up text-primary-foreground">
          <h1 class="text-3xl font-bold mb-2">{{ props.title }}</h1>
          <p class="text-primary-foreground/80 flex items-center gap-2">
            <Calendar class="w-4 h-4" />
            {{ props.subtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- 默认模式：轻量化标题栏 -->
    <div v-else class="px-6 pt-6">
      <div class="mb-6">
        <div class="flex items-center justify-between gap-4 md:gap-6">
          <div class="flex items-center gap-3 min-w-0">
            <Button
              v-if="props.showBack"
              variant="ghost"
              size="icon"
              class="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 shrink-0"
              @click="handleBack()"
            >
              <ChevronLeft class="w-5 h-5" />
            </Button>
            <div class="flex h-9 w-9 shrink-0 items-center justify-center self-center">
              <component :is="titleIcon" class="h-7 w-7 text-primary" />
            </div>
            <div class="min-w-0">
              <h1 v-if="props.title" class="text-2xl md:text-3xl font-semibold leading-none tracking-tight text-slate-900">{{ props.title }}</h1>
              <p v-if="props.subtitle" class="mt-2.5 text-xs leading-5 text-slate-500">{{ props.subtitle }}</p>
            </div>
          </div>
          <div v-if="$slots.extra" class="header-extra flex items-center gap-2 shrink-0 pr-1 md:pr-2">
            <slot name="extra" />
          </div>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="px-0">
        <slot />
      </div>
    </div>

    <!-- hero 模式内容区 -->
    <div v-if="props.hero" class="px-6 py-6">
      <slot />
    </div>
  </div>
</template>

<style>
/* 默认标题栏 extra 区统一压缩为更轻量的操作按钮 */
.header-extra button {
  height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border-color: transparent;
  background-color: #e2e8f0;
  color: #1e293b;
  font-size: 13px;
  box-shadow: none;
}

.header-extra button:hover {
  background-color: #cbd5e1;
  border-color: transparent;
  color: #0f172a;
}

.header-extra svg {
  width: 16px;
  height: 16px;
}
</style>
