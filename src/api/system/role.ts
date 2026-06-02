import { defHttp } from '/@/api/http';
import type { PageResult, PermissionTreeNode, SystemRole, SystemUser } from '/#/system';
import { buildRolePermissionPayload, normalizePageResult } from './_helpers';
import * as systemMock from '/@/mocks/system.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

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
  if (USE_MOCK) return systemMock.mockListRoles(params);
  const res = await defHttp.get<any>({ url: Api.ListByTenant, params });
  return normalizePageResult<SystemRole>(res);
}

export function saveRoleApi(data: Partial<SystemRole> & Recordable, isUpdate: boolean) {
  if (USE_MOCK) return systemMock.mockSaveRole(data, isUpdate);
  return defHttp.post({ url: isUpdate ? Api.Edit : Api.Save, data });
}

export function deleteRoleApi(id: string) {
  if (USE_MOCK) return systemMock.mockDeleteRole(id);
  return defHttp.delete({ url: Api.Delete, params: { id } });
}

export async function queryRolePermissionTreeApi(): Promise<{ treeList: PermissionTreeNode[]; ids: string[] }> {
  if (USE_MOCK) return systemMock.mockPermissionTree();
  return defHttp.get({ url: Api.QueryTreeListForRole });
}

export function queryRolePermissionApi(roleId: string): Promise<string[]> {
  if (USE_MOCK) return systemMock.mockRolePermission(roleId);
  return defHttp.get({ url: Api.QueryRolePermission, params: { roleId } });
}

export function saveRolePermissionApi(roleId: string, permissionIds: string[], lastPermissionIds: string[]) {
  if (USE_MOCK) return systemMock.mockSaveRolePermission(roleId, permissionIds);
  return defHttp.post({
    url: Api.SaveRolePermission,
    data: buildRolePermissionPayload(roleId, permissionIds, lastPermissionIds),
  });
}

export type RoleUser = SystemUser;
