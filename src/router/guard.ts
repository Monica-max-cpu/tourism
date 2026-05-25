/**
 * 路由守卫
 * - 登录态校验
 * - 角色路由前缀校验
 * - 角色菜单生成
 */
import type { Router } from 'vue-router';
import { useUserStoreWithOut } from '/@/stores/modules/user';
import { usePermissionStoreWithOut } from '/@/stores/modules/permission';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { UserRole } from '/#/user';

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: ROUTE_PATHS.ADMIN_WORKBENCH,
  SUPPLIER: ROUTE_PATHS.SUPPLIER_WORKBENCH,
  STORE: ROUTE_PATHS.STORE_WORKBENCH,
};

const PUBLIC_NAMES = new Set(['Login', 'SupplierApply', 'StoreApply', 'ApplyResult', 'NotFound', 'Forbidden']);

export function setupGuards(router: Router) {
  router.beforeEach((to) => {
    const userStore = useUserStoreWithOut();
    const permissionStore = usePermissionStoreWithOut();
    const isLoggedIn = userStore.isLoggedIn;
    const role = userStore.getRole as UserRole | '';

    // 已登录后访问登录页 → 跳到对应角色首页
    if (to.name === 'Login' && isLoggedIn && role) {
      return ROLE_HOME[role];
    }

    // 公开路由直接放行
    if (PUBLIC_NAMES.has(String(to.name))) {
      return true;
    }

    // 需要登录但未登录 → 登录页
    if (to.meta.requiresAuth && !isLoggedIn) {
      return { path: ROUTE_PATHS.LOGIN, query: { redirect: to.fullPath } };
    }

    // 角色不匹配 → 403
    const allowed = to.meta.roles as UserRole[] | undefined;
    if (allowed && allowed.length > 0 && !allowed.includes(role as UserRole)) {
      return ROUTE_PATHS.FORBIDDEN;
    }

    // 登录状态下进入业务页时确保菜单已生成
    if (isLoggedIn && role && permissionStore.getMenus.length === 0) {
      permissionStore.setMenusByRole(role);
    }

    return true;
  });
}
