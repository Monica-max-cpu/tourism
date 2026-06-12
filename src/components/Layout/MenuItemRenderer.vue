<script setup lang="ts">
import { computed } from 'vue';
import {
  ChevronDown,
  CreditCard,
  ShoppingCart,
  Store,
  Truck,
  Boxes,
  UserCog,
  Settings,
  Wallet,
  BarChart3,
  PackageSearch,
  Building2,
  Users,
  FileText,
  BadgePercent,
  ClipboardCheck,
} from 'lucide-vue-next';
import * as Icons from 'lucide-vue-next';
import type { MenuItem } from '/#/menu';

const props = defineProps<{
  item: MenuItem;
  depth: number;
  activePath: string;
  expandedGroups: Record<string, boolean>;
}>();

const emit = defineEmits<{
  toggle: [name: string];
  navigate: [item: MenuItem];
}>();

const hasChildren = computed(() => props.item.children && props.item.children.length > 0);

function getFallbackIcon(item: MenuItem) {
  const title = item.title || '';
  const path = item.path || '';

  if (/授信/.test(title) || /\/credit(\/|$)/.test(path)) return Wallet;
  if (/账单|支付/.test(title)) return CreditCard;
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
  return null;
}

function getIcon(item: MenuItem) {
  if (item.icon) {
    const explicitIcon = (Icons as any)[item.icon];
    if (explicitIcon) return explicitIcon;
  }
  return getFallbackIcon(item);
}

function isExpanded(name: string) {
  return props.expandedGroups[name] !== false;
}

function isActive(item: MenuItem): boolean {
  if (item.path && item.path === props.activePath) return true;
  if (item.children) return item.children.some((c) => isActive(c));
  return false;
}

function handleClick(item: MenuItem) {
  if (item.children && item.children.length) {
    emit('toggle', item.name);
  } else {
    emit('navigate', item);
  }
}
</script>

<template>
  <!-- 叶子节点（无 children） -->
  <button
    v-if="!hasChildren"
    class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm"
    :class="isActive(item)
      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
    :style="{ paddingLeft: `${12 + depth * 16}px` }"
    @click="handleClick(item)"
  >
    <component :is="getIcon(item)" v-if="getIcon(item)" class="w-4 h-4 shrink-0" />
    <span class="font-medium truncate">{{ item.title }}</span>
    <span v-if="isActive(item)" class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground shrink-0" />
  </button>

  <!-- 分组节点（有 children） -->
  <div v-else>
    <button
      class="w-full flex items-center justify-between px-4 py-2 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
      :style="{ paddingLeft: `${12 + depth * 16}px` }"
      @click="handleClick(item)"
    >
      <span class="flex items-center gap-3">
        <component :is="getIcon(item)" v-if="getIcon(item)" class="w-4 h-4 shrink-0" />
        <span class="font-medium truncate">{{ item.title }}</span>
      </span>
      <ChevronDown
        class="w-4 h-4 shrink-0 transition-transform duration-200"
        :class="isExpanded(item.name) ? 'rotate-180' : ''"
      />
    </button>
    <div v-show="isExpanded(item.name)" class="space-y-1 mt-1">
      <MenuItemRenderer
        v-for="child in item.children"
        :key="child.name"
        :item="child"
        :depth="depth + 1"
        :active-path="activePath"
        :expanded-groups="expandedGroups"
        @toggle="(name) => emit('toggle', name)"
        @navigate="(item) => emit('navigate', item)"
      />
    </div>
  </div>
</template>
