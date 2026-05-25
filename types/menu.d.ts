import type { UserRole } from './user';

export interface MenuItem {
  /** 路由 name */
  name: string;
  /** 路由 path */
  path: string;
  /** 显示名称 */
  title: string;
  /** lucide 图标名（可选） */
  icon?: string;
  /** 子菜单 */
  children?: MenuItem[];
  /** 可访问角色（不传则全部可访问） */
  roles?: UserRole[];
  /** 是否隐藏（仅作为路由不出现在侧边栏） */
  hidden?: boolean;
  /** 权限码（v-auth 双层防御） */
  authCode?: string;
}
