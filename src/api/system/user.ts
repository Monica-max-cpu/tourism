import { defHttp } from '/@/api/http';
import axios from 'axios';
import { getToken } from '/@/utils/auth';
import type { PageResult, SystemRole, SystemUser } from '/#/system';
import { buildQueryString, buildUserSavePayload, normalizePageResult } from './_helpers';

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
  const res = await defHttp.get<any>({ url: Api.List, params });
  return normalizePageResult<SystemUser>(res);
}

export function saveUserApi(data: Partial<SystemUser> & Recordable, isUpdate: boolean) {
  return defHttp.post({ url: isUpdate ? Api.Edit : Api.Save, data: buildUserSavePayload(data) });
}

export function deleteUserApi(id: string) {
  return defHttp.delete({ url: Api.Delete, params: { id } });
}

export function queryUserRoleApi(userId: string): Promise<string[]> {
  return defHttp.get({ url: Api.QueryUserRole, params: { userid: userId } });
}

export async function queryAllRolesApi(): Promise<SystemRole[]> {
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
  const res = await axios.get(buildUserExportUrl(params), {
    responseType: 'blob',
    headers: {
      'X-Access-Token': getToken(),
    },
  });
  return res.data as Blob;
}

export async function importUsersApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return defHttp.post({ url: Api.ImportExcel, data: formData });
}
