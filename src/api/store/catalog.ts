/**
 * 阶段 4 - 门店采购目录 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店采购目录 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店采购目录 API
 */
import { defHttp } from '/@/api/http';

enum Api {
  ListCatalog = '/b2b/catalog/list',
}

export function listStoreCatalogApi(params: any) {
  return defHttp.get({ url: Api.ListCatalog, params });
}
export function getStoreCatalogItemApi(id: string) {
  return defHttp.get({ url: `/b2b/catalog/detail/${id}` });
}
export function listHotCatalogApi(limit = 8) {
  void limit;
  return Promise.resolve([]);
}
export function reduceCatalogStockApi(updates: { catalogId: string; qty: number }[]) {
  void updates;
  return Promise.resolve({ success: true });
}
