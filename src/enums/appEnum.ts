/**
 * 权限模式
 */
export enum PermissionModeEnum {
  /** 前端角色模式：根据角色匹配本地路由 */
  ROLE = 'ROLE',
  /** 后端模式：菜单和权限从接口动态获取 */
  BACK = 'BACK',
  /** 前端路由映射模式 */
  ROUTE_MAPPING = 'ROUTE_MAPPING',
}
