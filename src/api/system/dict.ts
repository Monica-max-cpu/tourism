import { defHttp } from '/@/api/http';
import axios from 'axios';
import { getToken } from '/@/utils/auth';
import type { PageResult, SystemDict, SystemDictItem } from '/#/system';
import { buildQueryString, normalizePageResult } from './_helpers';

const runtimeEnv = (globalThis as any).process?.env || {};

enum Api {
  List = '/sys/dict/list',
  Save = '/sys/dict/add',
  Edit = '/sys/dict/edit',
  Delete = '/sys/dict/delete',
  DeleteBatch = '/sys/dict/deleteBatch',
  ImportExcel = '/sys/dict/importExcel',
  ExportXls = '/sys/dict/exportXls',
  RecycleBinList = '/sys/dict/deleteList',
  PutRecycleBin = '/sys/dict/back',
  DeleteRecycleBin = '/sys/dict/deletePhysic',
  ItemList = '/sys/dictItem/list',
  ItemDelete = '/sys/dictItem/delete',
  ItemSave = '/sys/dictItem/add',
  ItemEdit = '/sys/dictItem/edit',
  RefreshCache = '/sys/dict/refleshCache',
  QueryAllDictItems = '/sys/dict/queryAllDictItems',
}

export function normalizeDictItemPayload(data: Partial<SystemDictItem> & Recordable, dictId: string) {
  return { ...data, dictId };
}

export async function listDictsApi(params: Recordable): Promise<PageResult<SystemDict>> {
  const res = await defHttp.get<any>({ url: Api.List, params });
  return normalizePageResult<SystemDict>(res);
}

export function saveDictApi(data: Partial<SystemDict> & Recordable, isUpdate: boolean) {
  return defHttp.post({ url: isUpdate ? Api.Edit : Api.Save, data });
}

export function deleteDictApi(id: string) {
  return defHttp.delete({ url: Api.Delete, params: { id } });
}

export function batchDeleteDictApi(ids: string[]) {
  return defHttp.delete({ url: Api.DeleteBatch, data: { ids: ids.join(',') } });
}

export async function listDictItemsApi(params: Recordable): Promise<PageResult<SystemDictItem>> {
  const res = await defHttp.get<any>({ url: Api.ItemList, params });
  return normalizePageResult<SystemDictItem>(res);
}

export function saveDictItemApi(data: Partial<SystemDictItem> & Recordable, dictId: string, isUpdate: boolean) {
  const payload = normalizeDictItemPayload(data, dictId);
  return defHttp.post({ url: isUpdate ? Api.ItemEdit : Api.ItemSave, data: payload });
}

export function deleteDictItemApi(id: string) {
  return defHttp.delete({ url: Api.ItemDelete, params: { id } });
}

export async function listDictRecycleBinApi(params: Recordable): Promise<PageResult<SystemDict>> {
  const res = await defHttp.get<any>({ url: Api.RecycleBinList, params });
  return normalizePageResult<SystemDict>(res);
}

export function restoreDictApi(id: string) {
  return defHttp.put({ url: `${Api.PutRecycleBin}/${id}` });
}

export function deleteDictPhysicallyApi(id: string) {
  return defHttp.delete({ url: `${Api.DeleteRecycleBin}/${id}` });
}

export function refreshDictCacheApi() {
  return defHttp.get({ url: Api.RefreshCache }, { unwrap: false });
}

export function queryAllDictItemsApi() {
  return defHttp.get({ url: Api.QueryAllDictItems }, { unwrap: false });
}

export function buildDictExportUrl(params: Record<string, any>) {
  const base = runtimeEnv.VITE_API_BASE ?? '/jeecgboot';
  const query = buildQueryString(params);
  return `${base}${Api.ExportXls}${query ? `?${query}` : ''}`;
}

export async function downloadDictExportApi(params: Record<string, any>) {
  const res = await axios.get(buildDictExportUrl(params), {
    responseType: 'blob',
    headers: {
      'X-Access-Token': getToken(),
    },
  });
  return res.data as Blob;
}

export async function importDictsApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return defHttp.post({ url: Api.ImportExcel, data: formData });
}
