import { defHttp } from '/@/api/http';
import type { SystemMenu } from '/#/system';
import * as systemMock from '/@/mocks/system.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  List = '/sys/permission/list',
  Save = '/sys/permission/add',
  Edit = '/sys/permission/edit',
  Delete = '/sys/permission/delete',
  CheckPermDuplication = '/sys/permission/checkPermDuplication',
}

export function listMenusApi(params?: Recordable): Promise<SystemMenu[]> {
  if (USE_MOCK) return systemMock.mockListMenus(params);
  return defHttp.get({ url: Api.List, params });
}

export function saveMenuApi(data: Partial<SystemMenu> & Recordable, isUpdate: boolean) {
  if (USE_MOCK) return systemMock.mockSaveMenu(data, isUpdate);
  return defHttp.post({ url: isUpdate ? Api.Edit : Api.Save, data });
}

export function deleteMenuApi(id: string) {
  if (USE_MOCK) return systemMock.mockDeleteMenu();
  return defHttp.delete({ url: Api.Delete, params: { id } });
}

export function checkPermDuplicationApi(params: { id?: string; url?: string; alwaysShow?: boolean }) {
  return defHttp.get({ url: Api.CheckPermDuplication, params }, { unwrap: false });
}
