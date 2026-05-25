/**
 * 权限/菜单 Store
 * 根据当前角色生成可见菜单。菜单源数据见 /@/router/menus.ts。
 */
import { defineStore } from 'pinia';
import { store } from '/@/stores';
import type { MenuItem } from '/#/menu';
import type { UserRole } from '/#/user';
import { adminMenus, supplierMenus, storeMenus } from '/@/router/menus';

interface PermissionState {
  menus: MenuItem[];
}

function buildMenusByRole(role: UserRole | ''): MenuItem[] {
  switch (role) {
    case 'ADMIN':
      return adminMenus;
    case 'SUPPLIER':
      return supplierMenus;
    case 'STORE':
      return storeMenus;
    default:
      return [];
  }
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    menus: [],
  }),
  getters: {
    getMenus(state): MenuItem[] {
      return state.menus;
    },
  },
  actions: {
    setMenusByRole(role: UserRole | '') {
      this.menus = buildMenusByRole(role);
    },
    clearMenus() {
      this.menus = [];
    },
  },
});

export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
