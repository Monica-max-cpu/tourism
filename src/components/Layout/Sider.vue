<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ChevronDown, LogOut } from 'lucide-vue-next';
import * as Icons from 'lucide-vue-next';
import { usePermissionStore } from '/@/stores/modules/permission';
import { useAppStore } from '/@/stores/modules/app';
import { useUserStore } from '/@/stores/modules/user';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { MenuItem } from '/#/menu';

const permissionStore = usePermissionStore();
const appStore = useAppStore();
const userStore = useUserStore();
const { menus } = storeToRefs(permissionStore);
const { collapsed } = storeToRefs(appStore);
const route = useRoute();
const router = useRouter();

const flatMenus = computed<MenuItem[]>(() => menus.value);

// 分组折叠状态
const expandedGroups = reactive<Record<string, boolean>>({});

function isGroupExpanded(name: string) {
  return expandedGroups[name] !== false;
}

function toggleGroup(name: string) {
  expandedGroups[name] = !isGroupExpanded(name);
}

function getIcon(name?: string) {
  if (!name) return null;
  return (Icons as any)[name] || null;
}

function isActive(item: MenuItem) {
  if (item.path === route.path) return true;
  if (item.children) return item.children.some((c) => c.path === route.path);
  return false;
}

function isChildActive(child: MenuItem) {
  return route.path === child.path;
}

function go(item: MenuItem) {
  if (item.children && item.children.length) return;
  router.push(item.path);
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
    <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-2">
      <template v-for="item in flatMenus" :key="item.name">
        <!-- 一级菜单（无 children） -->
        <button
          v-if="!item.children || item.children.length === 0"
          class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm"
          :class="isActive(item)
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
          @click="go(item)"
        >
          <component :is="getIcon(item.icon)" v-if="getIcon(item.icon)" class="w-5 h-5 shrink-0" />
          <span class="font-medium truncate">{{ item.title }}</span>
          <span v-if="isActive(item)" class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground shrink-0" />
        </button>

        <!-- 一级带子菜单（可折叠） -->
        <div v-else>
          <button
            class="w-full flex items-center justify-between px-4 py-2 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            @click="toggleGroup(item.name)"
          >
            <span>{{ item.title }}</span>
            <ChevronDown
              class="w-4 h-4 shrink-0 transition-transform duration-200"
              :class="isGroupExpanded(item.name) ? 'rotate-180' : ''"
            />
          </button>
          <div v-show="isGroupExpanded(item.name)" class="space-y-1 mt-2">
            <button
              v-for="child in item.children"
              :key="child.name"
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm"
              :class="isChildActive(child)
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground ml-4'"
              @click="go(child)"
            >
              <component :is="getIcon(child.icon)" v-if="getIcon(child.icon)" class="w-4 h-4 shrink-0" />
              <span class="font-medium truncate">{{ child.title }}</span>
              <span v-if="isChildActive(child)" class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground shrink-0" />
            </button>
          </div>
        </div>
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
