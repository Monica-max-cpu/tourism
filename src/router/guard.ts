/**
 * 路由守卫（BACK 模式）
 * - 登录态校验 / 角色路由前缀校验
 * - 首次登录动态构建路由 + 权限码
 * - 参考 tourismweb permissionGuard.ts
 */
import type { Router, RouteRecordRaw } from 'vue-router';
import { useUserStoreWithOut } from '/@/stores/modules/user';
import { usePermissionStoreWithOut } from '/@/stores/modules/permission';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { UserRole } from '/#/user';
import { PAGE_NOT_FOUND_NAME, LAYOUT, EXCEPTION_COMPONENT } from '/@/router/constant';

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: ROUTE_PATHS.ADMIN_WORKBENCH,
  SUPPLIER: ROUTE_PATHS.SUPPLIER_WORKBENCH,
  STORE: ROUTE_PATHS.STORE_WORKBENCH,
  BASIC_USER: ROUTE_PATHS.ENTRY_B2B,
};

const WHITE_LIST = new Set(['Login', 'Register', 'ForgetPassword', 'SupplierApply', 'StoreApply', 'ApplyResult', 'ClaimOnboarding', 'NotFound', 'Forbidden']);
/** 404 兜底路由，动态路由构建后追加 */
const PAGE_NOT_FOUND_ROUTE: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'PageNotFoundParent',
  component: LAYOUT,
  meta: { hideMenu: true, hideBreadcrumb: true },
  children: [
    {
      path: '/:pathMatch(.*)*',
      name: PAGE_NOT_FOUND_NAME,
      component: EXCEPTION_COMPONENT,
      meta: { hideMenu: true, hideBreadcrumb: true },
    },
  ],
};

export function setupGuards(router: Router) {
  router.beforeEach(async (to, from) => {
    const userStore = useUserStoreWithOut();
    const permissionStore = usePermissionStoreWithOut();
    const token = userStore.getToken;
    const role = userStore.getRole as UserRole | '';

    // ========== 已登录访问登录页 → 跳到角色首页 ==========
    if (to.name === 'Login' && token && role) {
      return ROLE_HOME[role];
    }

    // ========== 白名单路由直接放行 ==========
    if (WHITE_LIST.has(String(to.name))) {
      return true;
    }

    // ========== 未登录 → 登录页 ==========
    if (!token) {
      return { path: ROUTE_PATHS.LOGIN, query: { redirect: to.fullPath }, replace: true };
    }

    // ========== 角色不匹配 → 403 ==========
    const allowed = to.meta.roles as UserRole[] | undefined;
    if (allowed && allowed.length > 0 && !allowed.includes(role as UserRole)) {
      return ROUTE_PATHS.FORBIDDEN;
    }

    // ========== 已构建过路由，直接放行 ==========
    if (permissionStore.getIsDynamicAddedRoute) {
      return true;
    }

    // ========== 首次进入业务页：构建动态路由 ==========
    try {
      const routes = await permissionStore.buildRoutesAction();

      /** 修复 flatMultiLevelRoutes 引入的 RouteRecordNormalized：components → component */
      function normalizeRouteComponent(r: any) {
        if (r.children?.length) {
          r.children.forEach((c: any) => normalizeRouteComponent(c));
        }
        if (!r.component && r.components) {
          r.component = r.components.default || Object.values(r.components)[0];
        }
      }

      routes.forEach((route) => {
        normalizeRouteComponent(route);
        router.addRoute(route as unknown as RouteRecordRaw);
      });
      router.addRoute(PAGE_NOT_FOUND_ROUTE);
      permissionStore.setDynamicAddedRoute(true);

      // 动态路由加完后，重新导航到目标
      if (to.name === PAGE_NOT_FOUND_NAME) {
        return { path: to.fullPath, replace: true, query: to.query };
      }
      const redirectPath = (from.query.redirect as string) || to.path;
      const redirect = decodeURIComponent(redirectPath);
      if (to.path === redirect) {
        return { ...to, replace: true };
      }
      return { path: redirect, replace: true };
    } catch (error) {
      console.error('[guard] 动态路由构建异常:', error);
      permissionStore.setDynamicAddedRoute(true);
      return true;
    }
  });
}
