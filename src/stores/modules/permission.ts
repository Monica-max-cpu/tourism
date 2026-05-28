/**
 * 权限/菜单 Store（BACK 模式）
 * 菜单路由 + 权限码从 /sys/permission/getUserPermissionByToken 动态获取
 */
import { defineStore } from 'pinia';
import { store } from '/@/stores';
import type { MenuItem } from '/#/menu';
import { getBackMenuAndPerms } from '/@/api/sys/menu';
import { transformObjToRoute, flatMultiLevelRoutes, addSlashToRouteComponent } from '/@/router/helper/routeHelper';
import { transformRouteToMenu } from '/@/router/helper/menuHelper';
import { filter } from '/@/utils/helper/treeHelper';
import type { AppRouteRecordRaw, Menu } from '/@/router/helper/types';

/** 将后端 Menu 转为前端 MenuItem */
function convertBackMenuToMenuItem(menus: Menu[]): MenuItem[] {
  return menus.map((m) => ({
    name: m.name || '',
    path: m.path || '',
    title: m.title || m.name || '',
    icon: m.icon,
    children: m.children ? convertBackMenuToMenuItem(m.children) : undefined,
  }));
}

interface PermissionState {
  menus: MenuItem[];
  permCodeList: string[];
  isDynamicAddedRoute: boolean;
  backMenuList: Menu[];
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    menus: [],
    permCodeList: [],
    isDynamicAddedRoute: false,
    backMenuList: [],
  }),
  getters: {
    getMenus(state): MenuItem[] {
      return state.menus;
    },
    getPermCodeList(state): string[] {
      return state.permCodeList;
    },
    getIsDynamicAddedRoute(state): boolean {
      return state.isDynamicAddedRoute;
    },
    getBackMenuList(state): Menu[] {
      return state.backMenuList;
    },
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList;
    },

    setBackMenuList(list: Menu[]) {
      this.backMenuList = list;
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added;
    },

    resetState(): void {
      this.isDynamicAddedRoute = false;
      this.permCodeList = [];
      this.backMenuList = [];
      this.menus = [];
    },

    /** 从接口获取权限码和菜单路由 */
    async changePermissionCode() {
      const systemPermission = await getBackMenuAndPerms();
      const codeList = systemPermission.codeList;
      this.setPermCodeList(codeList);
      const routeList = systemPermission.menu;
      return routeList;
    },

    /** 构建完整路由树 */
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      let routes: AppRouteRecordRaw[] = [];
      let routeList: AppRouteRecordRaw[] = [];

      try {
        routeList = (await this.changePermissionCode()) as AppRouteRecordRaw[];
        console.log('[perm] API 返回 routeList:', routeList?.length, '条, codeList:', this.permCodeList?.length, '条');
      } catch (error) {
        console.error('[perm] changePermissionCode 失败:', error);
      }

      if (!routeList || routeList.length === 0) {
        console.warn('[perm] routeList 为空，返回空路由');
        return [];
      }

      try {
        // 组件地址前加斜杠
        routeList = addSlashToRouteComponent(routeList) as unknown as AppRouteRecordRaw[];
        // 动态引入组件
        routeList = transformObjToRoute(routeList);

        // 构建侧边栏菜单
        const backMenuList = transformRouteToMenu(routeList);
        this.setBackMenuList(backMenuList);
        this.menus = convertBackMenuToMenuItem(backMenuList);

        // 过滤 ignoreRoute 项
        const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
          const { meta } = route;
          const { ignoreRoute } = meta || {};
          return !ignoreRoute;
        };
        routeList = filter(routeList, routeRemoveIgnoreFilter);
        routeList = routeList.filter(routeRemoveIgnoreFilter);

        routeList = flatMultiLevelRoutes(routeList);
        routes = [...routeList];
      } catch (error) {
        console.error('[perm] 路由构建失败:', error);
        return [];
      }

      return routes;
    },
  },
});

export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
