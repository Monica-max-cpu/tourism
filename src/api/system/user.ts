import { defHttp } from '/@/api/http';
import axios from 'axios';
import { getToken } from '/@/utils/auth';
import type { PageResult, SystemRole, SystemUser } from '/#/system';
import { buildQueryString, normalizePageResult } from './_helpers';
import * as systemMock from '/@/mocks/system.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  List = '/sys/user/list',
  Save = '/sys/user/add',
  Edit = '/sys/user/edit',
  Delete = '/sys/user/delete',
  QueryUserRole = '/sys/user/queryUserRole',
  AllRoles = '/sys/role/listByTenant',
  ImportExcel = '/sys/user/importExcel',
  ExportXls = '/sys/user/exportXls',
}

export async function listUsersApi(params: Recordable): Promise<PageResult<SystemUser>> {
  if (USE_MOCK) return systemMock.mockListUsers(params);
  const res = await defHttp.get<any>({ url: Api.List, params });
  return normalizePageResult<SystemUser>(res);
}

export function saveUserApi(data: Partial<SystemUser> & Recordable, isUpdate: boolean) {
  if (USE_MOCK) return systemMock.mockSaveUser(data, isUpdate);
  return defHttp.post({ url: isUpdate ? Api.Edit : Api.Save, data });
}

export function deleteUserApi(id: string) {
  if (USE_MOCK) return systemMock.mockDeleteUser(id);
  return defHttp.delete({ url: Api.Delete, params: { id } });
}

export function queryUserRoleApi(userId: string): Promise<string[]> {
  if (USE_MOCK) return systemMock.mockUserRoles(userId);
  return defHttp.get({ url: Api.QueryUserRole, params: { userid: userId } });
}

export async function queryAllRolesApi(): Promise<SystemRole[]> {
  if (USE_MOCK) return systemMock.mockRoles();
  const res = await defHttp.get<any>({ url: Api.AllRoles, params: { pageNo: 1, pageSize: 999 } });
  return normalizePageResult<SystemRole>(res).records;
}

export function getUserImportUrl() {
  return Api.ImportExcel;
}

export function buildUserExportUrl(params: Record<string, any>) {
  const base = import.meta.env.VITE_API_BASE ?? '/jeecgboot';
  const query = buildQueryString(params);
  return `${base}${Api.ExportXls}${query ? `?${query}` : ''}`;
}

export async function downloadUserExportApi(params: Record<string, any>) {
  if (USE_MOCK) return systemMock.mockExportUsers();
  const res = await axios.get(buildUserExportUrl(params), {
    responseType: 'blob',
    headers: {
      'X-Access-Token': getToken(),
    },
  });
  return res.data as Blob;
}

export async function importUsersApi(file: File) {
  if (USE_MOCK) return systemMock.mockImportUsers();
  const formData = new FormData();
  formData.append('file', file);
  return defHttp.post({ url: Api.ImportExcel, data: formData });
}
