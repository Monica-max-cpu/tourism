import { defHttp } from '/@/api/http';

enum Api {
  GetMenuList = '/sys/permission/getUserPermissionByToken',
}

/**
 * 获取后台菜单权限和按钮权限
 */
export function getBackMenuAndPerms() {
  return defHttp.get<any>({ url: Api.GetMenuList });
}
