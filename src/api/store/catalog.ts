/**
 * 阶段 4 - 门店采购目录 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店采购目录 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店采购目录 API
 */
import { defHttp } from '/@/api/http';
import * as catalogMock from '/@/mocks/store/catalog.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  ListCatalog = '/b2b/catalog/list',
}

export function listStoreCatalogApi(params: any) {
  return USE_MOCK ? catalogMock.mockListStoreCatalog(params) : defHttp.get({ url: Api.ListCatalog, params });
}
export function getStoreCatalogItemApi(id: string) {
  return USE_MOCK ? catalogMock.mockGetCatalogItem(id) : defHttp.get({ url: `/b2b/catalog/detail/${id}` });
}
export function listHotCatalogApi(limit = 8) {
  // 后端无热门目录接口，使用 mock
  return catalogMock.mockListHotCatalog(limit);
}
export function reduceCatalogStockApi(updates: { catalogId: string; qty: number }[]) {
  // 后端无直接扣库存接口（库存由集采单触发），使用 mock
  return catalogMock.mockReduceCatalogStock(updates);
}
