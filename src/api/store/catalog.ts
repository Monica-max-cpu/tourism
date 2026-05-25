/**
 * 阶段 4 - 门店采购目录 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店采购目录 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店采购目录 API
 */
import { defHttp } from '/@/api/http';
import * as catalogMock from '/@/mocks/store/catalog.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  ListCatalog = '/b2b/store/catalog/list',
  GetCatalog = '/b2b/store/catalog/get',
  ListHot = '/b2b/store/catalog/hot',
  ReduceStock = '/b2b/store/catalog/reduce-stock',
}

export function listStoreCatalogApi(params: any) {
  return USE_MOCK ? catalogMock.mockListStoreCatalog(params) : defHttp.post({ url: Api.ListCatalog, data: params });
}
export function getStoreCatalogItemApi(id: string) {
  return USE_MOCK ? catalogMock.mockGetCatalogItem(id) : defHttp.get({ url: Api.GetCatalog, params: { id } });
}
export function listHotCatalogApi(limit = 8) {
  return USE_MOCK ? catalogMock.mockListHotCatalog(limit) : defHttp.get({ url: Api.ListHot, params: { limit } });
}
export function reduceCatalogStockApi(updates: { catalogId: string; qty: number }[]) {
  return USE_MOCK ? catalogMock.mockReduceCatalogStock(updates) : defHttp.post({ url: Api.ReduceStock, data: { updates } });
}
