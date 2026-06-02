/**
 * 权限/菜单 Store（BACK 模式）
 * 菜单路由 + 权限码从 /sys/permission/getUserPermissionByToken 动态获取
 */
import { defineStore } from 'pinia';
import { store } from '/@/stores';
import type { MenuItem } from '/#/menu';
import { getBackMenuAndPerms } from '/@/api/sys/menu';
import { useUserStore } from '/@/stores/modules/user';
import { transformObjToRoute, flatMultiLevelRoutes, addSlashToRouteComponent } from '/@/router/helper/routeHelper';
import { transformRouteToMenu } from '/@/router/helper/menuHelper';
import { filter } from '/@/utils/helper/treeHelper';
import type { AppRouteRecordRaw, Menu } from '/@/router/helper/types';

/** 将后端 Menu 转为前端 MenuItem */
function isDefaultHomeMenu(item: any) {
  const path = String(item?.path || item?.url || '').toLowerCase();
  const component = String(item?.component || '').toLowerCase();
  const title = String(item?.title || item?.name || item?.meta?.title || '');
  return title === '首页' || path === '/dashboard/analysis' || component === 'dashboard/analysis';
}

function isHiddenBusinessMenu(item: any) {
  const title = String(item?.title || item?.name || item?.meta?.title || '');
  return title === '认证管理';
}

const WORKBENCH_ROUTE_CONFIG: Record<string, { path: string; relativePath: string; name: string; component: string; title: string }> = {
  ADMIN: {
    path: '/b2b/admin/workbench',
    relativePath: '/admin/workbench',
    name: 'AdminWorkbench',
    component: 'workbench/AdminDashboard',
    title: 'B2B 工作台',
  },
  SUPPLIER: {
    path: '/b2b/supplier/workbench',
    relativePath: '/supplier/workbench',
    name: 'SupplierWorkbench',
    component: 'workbench/SupplierDashboard',
    title: '供应商工作台',
  },
  STORE: {
    path: '/b2b/store/workbench',
    relativePath: '/store/workbench',
    name: 'StoreWorkbench',
    component: 'workbench/StoreDashboard',
    title: '门店工作台',
  },
};

function createWorkbenchRoute(config: typeof WORKBENCH_ROUTE_CONFIG[string], source?: any) {
  return {
    ...(source || {}),
    path: config.path,
    name: config.name,
    component: config.component,
    route: true,
    menuType: 1,
    hidden: false,
    hideMenu: false,
    children: undefined,
    meta: {
      ...(source?.meta || {}),
      title: config.title,
      icon: 'LayoutDashboard',
      hideMenu: false,
      hidden: false,
    },
  };
}

function isWorkbenchRoute(item: any, config: typeof WORKBENCH_ROUTE_CONFIG[string]) {
  const path = String(item?.path || item?.url || '').toLowerCase();
  const name = String(item?.name || item?.routeName || item?.componentName || '');
  return name === config.name || path === config.path.toLowerCase() || path === config.relativePath.toLowerCase();
}

function extractWorkbenchRoute(items: any[], config: typeof WORKBENCH_ROUTE_CONFIG[string]): { routes: any[]; workbench?: any } {
  let workbench: any;
  const routes = items
    .map((item) => {
      if (isWorkbenchRoute(item, config)) {
        workbench = workbench || item;
        return null;
      }
      if (item.children?.length) {
        const extracted = extractWorkbenchRoute(item.children, config);
        if (extracted.workbench && !workbench) workbench = extracted.workbench;
        return { ...item, children: extracted.routes };
      }
      return item;
    })
    .filter(Boolean);
  return { routes, workbench };
}

function ensureWorkbenchFirst(routes: any[], role: string) {
  const config = WORKBENCH_ROUTE_CONFIG[role];
  if (!config || !Array.isArray(routes)) return routes;
  const extracted = extractWorkbenchRoute(routes, config);
  return [createWorkbenchRoute(config, extracted.workbench), ...extracted.routes];
}

function convertBackMenuToMenuItem(menus: Menu[]): MenuItem[] {
  return menus
    .filter((m) => {
      if (isDefaultHomeMenu(m)) return false;
      if (isHiddenBusinessMenu(m)) return false;
      // 过滤已标记隐藏的菜单项（不含子菜单的占位分组）
      if (m.hideMenu || (m as any).hidden) return false;
      return true;
    })
    .map((m) => ({
      name: m.name || '',
      path: m.path || '',
      title: m.title || m.name || '',
      icon: m.icon,
      children: m.children ? convertBackMenuToMenuItem(m.children) : undefined,
      // 传递隐藏标记用于侧边栏过滤
      hidden: m.hideMenu || (m as any).hidden || false,
    }));
}

/** 将 JeecgBoot SysPermission 格式标准化为前端路由格式 */
function normalizeBackendRoute(menus: any[]): any[] {
  if (!menus || !Array.isArray(menus)) return [];
  const result = menus
    .filter((item: any) => {
      // 过滤按钮权限（menuType === 2）
      if (item.menuType === 2) return false;
      if (isDefaultHomeMenu(item)) return false;
      if (isHiddenBusinessMenu(item)) return false;
      // 过滤空占位分组（隐藏、无子节点、且无 component/url 的空壳）
      if (item.hidden && !item.children?.length && !item.component && !item.url) return false;
      if (String(item.route) === '0' && !item.children?.length && !item.path) return false;
      return true;
    })
    .map((item: any) => {
      let p = item.path || item.url || '';
      // 确保路径以 / 开头，避免 joinParentPath 中错误拼接父路径
      if (p && !p.startsWith('/') && !/^https?:/.test(p)) {
        p = '/' + p;
      }
      const normalized: Record<string, any> = {
        ...item,
        path: p,
        // 构建 meta
        meta: {
          ...(item.meta || {}),
          title: item.meta?.title || item.name || '',
          icon: item.meta?.icon || item.icon || '',
        },
        component: item.component || '',
      };
      if (item.children?.length) {
        normalized.children = normalizeBackendRoute(item.children);
        // 修复双层 BasicLayout 嵌套：如果中间分组节点的 component 也是 BasicLayout
        // （LAYOUT 或 layouts/default/index），把它改为 layouts/RouteView 透传容器，
        // 避免 BasicLayout 嵌套 BasicLayout 导致双重侧边栏。
        // 注意：只改子节点，不改父节点，确保顶层 BasicLayout 保留侧边栏+标题栏。
        normalized.children = normalized.children.map((c: any) => {
          const isChildBasicLayout =
            c.component === 'layouts/default/index' || c.component === 'LAYOUT';
          if (isChildBasicLayout && c.children?.length) {
            return { ...c, component: 'layouts/RouteView' };
          }
          return c;
        });
      }
      return normalized;
    });

  return result;
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
      // 兼容 JeecgBoot 返回的多种字段名
      const codeList = systemPermission.codeList
        || systemPermission.auth
        || systemPermission.authList
        || systemPermission.permissionList
        || [];
      this.setPermCodeList(codeList);

      const rawMenu = systemPermission.menu
        || systemPermission.menuList
        || systemPermission.menus
        || [];

      const normalized = normalizeBackendRoute(rawMenu);
      const userStore = useUserStore();
      return ensureWorkbenchFirst(normalized, userStore.getRole);
    },

    /** 构建完整路由树 */
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      let routes: AppRouteRecordRaw[] = [];
      let routeList: AppRouteRecordRaw[] = [];

      try {
        routeList = (await this.changePermissionCode()) as AppRouteRecordRaw[];
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
