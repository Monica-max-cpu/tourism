import { defHttp } from '/@/api/http';
import type { SystemMenu } from '/#/system';

enum Api {
  List = '/sys/permission/list',
  Save = '/sys/permission/add',
  Edit = '/sys/permission/edit',
  Delete = '/sys/permission/delete',
  CheckPermDuplication = '/sys/permission/checkPermDuplication',
}

export function listMenusApi(params?: Recordable): Promise<SystemMenu[]> {
  return defHttp.get({ url: Api.List, params });
}

export function saveMenuApi(data: Partial<SystemMenu> & Recordable, isUpdate: boolean) {
  return defHttp.post({ url: isUpdate ? Api.Edit : Api.Save, data });
}

export function deleteMenuApi(id: string) {
  return defHttp.delete({ url: Api.Delete, params: { id } });
}

export function checkPermDuplicationApi(params: { id?: string; url?: string; alwaysShow?: boolean }) {
  return defHttp.get({ url: Api.CheckPermDuplication, params }, { unwrap: false });
}
