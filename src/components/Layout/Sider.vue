<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { LogOut } from 'lucide-vue-next';
import { usePermissionStore } from '/@/stores/modules/permission';
import { useAppStore } from '/@/stores/modules/app';
import { useUserStore } from '/@/stores/modules/user';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import MenuItemRenderer from './MenuItemRenderer.vue';
import type { MenuItem } from '/#/menu';

const permissionStore = usePermissionStore();
const appStore = useAppStore();
const userStore = useUserStore();
const { menus } = storeToRefs(permissionStore);
const { collapsed } = storeToRefs(appStore);
const route = useRoute();
const router = useRouter();

const entryMenus: MenuItem[] = [
  { name: 'EntryB2B', path: ROUTE_PATHS.ENTRY_B2B, title: 'B2B 入驻', icon: 'BadgeCheck' },
  { name: 'EntryB2C', path: ROUTE_PATHS.ENTRY_B2C, title: 'B2C 入驻', icon: 'Store' },
];

function filterHidden(items: MenuItem[]): MenuItem[] {
  return items
    .filter((item) => (
      !item.hidden
      && item.title !== '首页'
      && item.title !== '认证管理'
      && item.path !== '/dashboard/analysis'
    ))
    .map((item) => ({
      ...item,
      children: item.children ? filterHidden(item.children) : undefined,
    }));
}

const flatMenus = computed<MenuItem[]>(() => {
  if (userStore.isBasicUser) return entryMenus;
  if (menus.value.length > 0) return filterHidden(menus.value);
  return [];
});

const expandedGroups = reactive<Record<string, boolean>>({});

function isGroupExpanded(name: string) {
  return expandedGroups[name] !== false;
}

function toggleGroup(name: string) {
  expandedGroups[name] = !isGroupExpanded(name);
}

function go(item: MenuItem) {
  if (item.children && item.children.length) {
    toggleGroup(item.name);
    return;
  }
  if (item.path) router.push(item.path);
}

async function handleLogout() {
  await userStore.logout();
  router.push(ROUTE_PATHS.LOGIN);
}
</script>

<template>
  <aside
    class="h-full bg-card border-r border-border transition-all duration-300 flex flex-col"
    :class="collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-64'"
  >
    <!-- 品牌头 -->
    <div class="p-6 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
        <span class="text-primary-foreground font-bold text-xl">晋</span>
      </div>
      <div class="flex flex-col">
        <span class="font-bold text-lg tracking-tight leading-none">山西文旅平台</span>
        <span class="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Cultural Tourism SaaS</span>
      </div>
    </div>

    <!-- 导航区 -->
    <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      <template v-for="item in flatMenus" :key="item.name">
        <MenuItemRenderer
          :item="item"
          :depth="0"
          :active-path="route.path"
          :expanded-groups="expandedGroups"
          @toggle="toggleGroup"
          @navigate="go"
        />
      </template>
    </nav>

    <!-- 底部 -->
    <div class="p-4 mt-auto border-t border-border">
      <div class="bg-accent/50 rounded-2xl p-4 mb-4">
        <p class="text-xs text-muted-foreground mb-2">当前机构</p>
        <p class="text-sm font-semibold truncate">山西文旅集团</p>
      </div>
      <button
        class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        @click="handleLogout"
      >
        <LogOut class="w-5 h-5" />
        退出登录
      </button>
    </div>
  </aside>
</template>

