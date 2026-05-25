/**
 * 平台管理员 - 入驻审核 / 报价 / 商品目录 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2A】管理员审核与目录接口
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2A】管理员审核与目录接口
 */
import { defHttp } from '/@/api/http';
import * as supplierApplyMock from '/@/mocks/admin/supplierApply.mock';
import * as storeApplyMock from '/@/mocks/admin/storeApply.mock';
import * as quoteMock from '/@/mocks/admin/quote.mock';
import * as catalogMock from '/@/mocks/admin/catalog.mock';
import type { SupplierApply, StoreApply, SupplierQuote, PlatformCatalog, CatalogStatus } from '/#/b2b';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  // 供应商审核
  ListSupplierApply = '/b2b/admin/supplier-apply/list',
  GetSupplierApply = '/b2b/admin/supplier-apply/detail',
  ApproveSupplierApply = '/b2b/admin/supplier-apply/approve',
  RejectSupplierApply = '/b2b/admin/supplier-apply/reject',
  // 门店审核
  ListStoreApply = '/b2b/admin/store-apply/list',
  GetStoreApply = '/b2b/admin/store-apply/detail',
  ApproveStoreApply = '/b2b/admin/store-apply/approve',
  RejectStoreApply = '/b2b/admin/store-apply/reject',
  // 报价
  ListQuotes = '/b2b/admin/quotes/list',
  ApproveQuote = '/b2b/admin/quotes/approve',
  BatchApproveQuotes = '/b2b/admin/quotes/batch-approve',
  RejectQuote = '/b2b/admin/quotes/reject',
  // 商品目录
  ListCatalogs = '/b2b/admin/catalogs/list',
  UpdateCatalog = '/b2b/admin/catalogs/update',
  ToggleShelf = '/b2b/admin/catalogs/toggle-shelf',
}

// ===== 供应商审核 =====
export function listSupplierApplyApi(params: any) {
  return USE_MOCK ? supplierApplyMock.mockListSupplierApply(params) : defHttp.post({ url: Api.ListSupplierApply, data: params });
}
export function getSupplierApplyApi(id: string): Promise<SupplierApply | null> {
  return USE_MOCK ? supplierApplyMock.mockGetSupplierApply(id) : defHttp.get({ url: Api.GetSupplierApply, params: { id } });
}
export function approveSupplierApplyApi(id: string) {
  return USE_MOCK ? supplierApplyMock.mockApproveSupplierApply(id) : defHttp.post({ url: Api.ApproveSupplierApply, data: { id } });
}
export function rejectSupplierApplyApi(id: string, reason: string) {
  return USE_MOCK ? supplierApplyMock.mockRejectSupplierApply(id, reason) : defHttp.post({ url: Api.RejectSupplierApply, data: { id, reason } });
}

// ===== 门店审核 =====
export function listStoreApplyApi(params: any) {
  return USE_MOCK ? storeApplyMock.mockListStoreApply(params) : defHttp.post({ url: Api.ListStoreApply, data: params });
}
export function getStoreApplyApi(id: string): Promise<StoreApply | null> {
  return USE_MOCK ? storeApplyMock.mockGetStoreApply(id) : defHttp.get({ url: Api.GetStoreApply, params: { id } });
}
export function approveStoreApplyApi(id: string) {
  return USE_MOCK ? storeApplyMock.mockApproveStoreApply(id) : defHttp.post({ url: Api.ApproveStoreApply, data: { id } });
}
export function rejectStoreApplyApi(id: string, reason: string) {
  return USE_MOCK ? storeApplyMock.mockRejectStoreApply(id, reason) : defHttp.post({ url: Api.RejectStoreApply, data: { id, reason } });
}

// ===== 报价审核 =====
export function listQuotesApi(params: any) {
  return USE_MOCK ? quoteMock.mockListQuotes(params) : defHttp.post({ url: Api.ListQuotes, data: params });
}
export function approveQuoteApi(id: string) {
  return USE_MOCK ? quoteMock.mockApproveQuote(id) : defHttp.post({ url: Api.ApproveQuote, data: { id } });
}
export function batchApproveQuotesApi(ids: string[]) {
  return USE_MOCK ? quoteMock.mockBatchApproveQuotes(ids) : defHttp.post({ url: Api.BatchApproveQuotes, data: { ids } });
}
export function rejectQuoteApi(id: string, reason: string) {
  return USE_MOCK ? quoteMock.mockRejectQuote(id, reason) : defHttp.post({ url: Api.RejectQuote, data: { id, reason } });
}

// ===== 商品目录 =====
export function listCatalogsApi(params: any) {
  return USE_MOCK ? catalogMock.mockListCatalogs(params) : defHttp.post({ url: Api.ListCatalogs, data: params });
}
export function updateCatalogApi(id: string, patch: Partial<PlatformCatalog>) {
  return USE_MOCK ? catalogMock.mockUpdateCatalog(id, patch) : defHttp.post({ url: Api.UpdateCatalog, data: { id, ...patch } });
}
export function toggleShelfApi(id: string, status: CatalogStatus) {
  return USE_MOCK ? catalogMock.mockToggleShelf(id, status) : defHttp.post({ url: Api.ToggleShelf, data: { id, status } });
}
