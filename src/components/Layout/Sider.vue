<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import * as Icons from 'lucide-vue-next';
import { usePermissionStore } from '/@/stores/modules/permission';
import { useAppStore } from '/@/stores/modules/app';
import type { MenuItem } from '/#/menu';

const permissionStore = usePermissionStore();
const appStore = useAppStore();
const { menus } = storeToRefs(permissionStore);
const { collapsed } = storeToRefs(appStore);
const route = useRoute();
const router = useRouter();

const flatMenus = computed<MenuItem[]>(() => menus.value);

function getIcon(name?: string) {
  if (!name) return null;
  return (Icons as any)[name] || null;
}

function isActive(item: MenuItem) {
  if (item.path === route.path) return true;
  if (item.children) return item.children.some((c) => c.path === route.path);
  return false;
}

function go(item: MenuItem) {
  if (item.children && item.children.length) return;
  router.push(item.path);
}
</script>

<template>
  <aside
    class="h-full bg-card border-r border-border transition-all duration-200 flex flex-col"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <div class="h-16 flex items-center px-4 border-b border-border gap-3">
      <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 shrink-0">B2B</div>
      <span v-if="!collapsed" class="font-semibold text-foreground tracking-tight">集采管理平台</span>
    </div>

    <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
      <template v-for="item in flatMenus" :key="item.name">
        <!-- 一级菜单（无 children） -->
        <button
          v-if="!item.children || item.children.length === 0"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          :class="isActive(item) ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' : 'text-foreground hover:bg-accent hover:text-accent-foreground'"
          @click="go(item)"
        >
          <component :is="getIcon(item.icon)" v-if="getIcon(item.icon)" class="w-4 h-4 shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ item.title }}</span>
        </button>

        <!-- 一级带子菜单（默认展开） -->
        <div v-else class="space-y-0.5">
          <div class="flex items-center gap-3 px-3 pt-3 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            <component :is="getIcon(item.icon)" v-if="getIcon(item.icon)" class="w-4 h-4 shrink-0" />
            <span v-if="!collapsed" class="truncate">{{ item.title }}</span>
          </div>
          <button
            v-for="child in item.children"
            :key="child.name"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            :class="route.path === child.path ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' : 'text-foreground hover:bg-accent hover:text-accent-foreground'"
            @click="go(child)"
          >
            <span class="w-4 h-4 shrink-0 flex items-center justify-center">
              <span class="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
            </span>
            <span v-if="!collapsed" class="truncate">{{ child.title }}</span>
          </button>
        </div>
      </template>
    </nav>
  </aside>
</template>
