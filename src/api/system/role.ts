import { defHttp } from '/@/api/http';
import type { PageResult, PermissionTreeNode, SystemRole, SystemUser } from '/#/system';
import { buildRolePermissionPayload, normalizePageResult } from './_helpers';

enum Api {
  List = '/sys/role/list',
  ListByTenant = '/sys/role/listByTenant',
  Save = '/sys/role/add',
  Edit = '/sys/role/edit',
  Delete = '/sys/role/delete',
  QueryTreeListForRole = '/sys/role/queryTreeList',
  QueryRolePermission = '/sys/permission/queryRolePermission',
  SaveRolePermission = '/sys/permission/saveRolePermission',
}

export async function listRolesApi(params: Recordable): Promise<PageResult<SystemRole>> {
  const res = await defHttp.get<any>({ url: Api.ListByTenant, params });
  return normalizePageResult<SystemRole>(res);
}

export function saveRoleApi(data: Partial<SystemRole> & Recordable, isUpdate: boolean) {
  return defHttp.post({ url: isUpdate ? Api.Edit : Api.Save, data });
}

export function deleteRoleApi(id: string) {
  return defHttp.delete({ url: Api.Delete, params: { id } });
}

export async function queryRolePermissionTreeApi(): Promise<{ treeList: PermissionTreeNode[]; ids: string[] }> {
  return defHttp.get({ url: Api.QueryTreeListForRole });
}

export function queryRolePermissionApi(roleId: string): Promise<string[]> {
  return defHttp.get({ url: Api.QueryRolePermission, params: { roleId } });
}

export function saveRolePermissionApi(roleId: string, permissionIds: string[], lastPermissionIds: string[]) {
  return defHttp.post({
    url: Api.SaveRolePermission,
    data: buildRolePermissionPayload(roleId, permissionIds, lastPermissionIds),
  });
}

export type RoleUser = SystemUser;
