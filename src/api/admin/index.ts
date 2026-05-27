/**
 * 平台管理员 - 入驻审核 / 报价 / 商品目录 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2A】管理员审核与目录接口
 * update-begin--author:phase7---date:2026-05-26---for:【阶段7】对齐 b2b-api-contract.md 字段名与启用/停用
 * update-end--author:phase7---date:2026-05-26---for:【阶段7】对齐 b2b-api-contract.md 字段名与启用/停用
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2A】管理员审核与目录接口
 */
import { defHttp } from '/@/api/http';
import * as supplierApplyMock from '/@/mocks/admin/supplierApply.mock';
import * as storeApplyMock from '/@/mocks/admin/storeApply.mock';
import * as quoteMock from '/@/mocks/admin/quote.mock';
import * as catalogMock from '/@/mocks/admin/catalog.mock';
import type { SupplierApply, StoreApply, SupplierQuote, PlatformCatalog, CatalogStatus, ApplyStatus } from '/#/b2b';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  // 供应商审核
  ListSupplierApply = '/b2b/supplier/list',
  GetSupplierApply = '/b2b/supplier',
  ReviewSupplierApply = '/b2b/supplier/review',
  ToggleSupplierStatus = '/b2b/supplier/status',
  // 门店审核
  ListStoreApply = '/b2b/store/list',
  GetStoreApply = '/b2b/store',
  ReviewStoreApply = '/b2b/store/review',
  ToggleStoreStatus = '/b2b/store/status',
  // 报价审核
  ListQuotes = '/b2b/supplier/quote/list',
  ReviewQuote = '/b2b/supplier/quote/review',
  // 商品目录（管理员侧）
  ListCatalogs = '/b2b/catalog/admin/list',
  UpdateCatalog = '/b2b/catalog/edit',
  AddCatalog = '/b2b/catalog/add',
}

// ===== 供应商审核 =====
export function listSupplierApplyApi(params: any) {
  return USE_MOCK ? supplierApplyMock.mockListSupplierApply(params) : defHttp.get({ url: Api.ListSupplierApply, params });
}
export function getSupplierApplyApi(id: string): Promise<SupplierApply | null> {
  return USE_MOCK ? supplierApplyMock.mockGetSupplierApply(id) : defHttp.get({ url: `${Api.GetSupplierApply}/${id}` });
}
export function approveSupplierApplyApi(id: string) {
  return USE_MOCK ? supplierApplyMock.mockApproveSupplierApply(id) : defHttp.put({ url: Api.ReviewSupplierApply, data: { id, status: 1 } });
}
export function rejectSupplierApplyApi(id: string, reviewRemark: string) {
  return USE_MOCK ? supplierApplyMock.mockRejectSupplierApply(id, reviewRemark) : defHttp.put({ url: Api.ReviewSupplierApply, data: { id, status: 2, reviewRemark } });
}
export function toggleSupplierStatusApi(id: string, targetStatus: ApplyStatus) {
  return USE_MOCK ? supplierApplyMock.mockToggleSupplierStatus(id, targetStatus) : defHttp.put({ url: Api.ToggleSupplierStatus, data: { id, status: targetStatus } });
}

// ===== 门店审核 =====
export function listStoreApplyApi(params: any) {
  return USE_MOCK ? storeApplyMock.mockListStoreApply(params) : defHttp.get({ url: Api.ListStoreApply, params });
}
export function getStoreApplyApi(id: string): Promise<StoreApply | null> {
  return USE_MOCK ? storeApplyMock.mockGetStoreApply(id) : defHttp.get({ url: `${Api.GetStoreApply}/${id}` });
}
export function approveStoreApplyApi(id: string) {
  return USE_MOCK ? storeApplyMock.mockApproveStoreApply(id) : defHttp.put({ url: Api.ReviewStoreApply, data: { id, status: 1 } });
}
export function rejectStoreApplyApi(id: string, reviewRemark: string) {
  return USE_MOCK ? storeApplyMock.mockRejectStoreApply(id, reviewRemark) : defHttp.put({ url: Api.ReviewStoreApply, data: { id, status: 2, reviewRemark } });
}
export function toggleStoreStatusApi(id: string, targetStatus: ApplyStatus) {
  return USE_MOCK ? storeApplyMock.mockToggleStoreStatus(id, targetStatus) : defHttp.put({ url: Api.ToggleStoreStatus, data: { id, status: targetStatus } });
}

// ===== 报价审核 =====
export function listQuotesApi(params: any) {
  return USE_MOCK ? quoteMock.mockListQuotes(params) : defHttp.get({ url: Api.ListQuotes, params });
}
export function approveQuoteApi(id: string) {
  return USE_MOCK ? quoteMock.mockApproveQuote(id) : defHttp.put({ url: Api.ReviewQuote, params: { id, status: 1 } });
}
export function batchApproveQuotesApi(ids: string[]) {
  return USE_MOCK
    ? quoteMock.mockBatchApproveQuotes(ids)
    : defHttp.put({ url: Api.ReviewQuote, params: { ids: ids.join(','), status: 1 } });
}
export function rejectQuoteApi(id: string, reviewRemark: string) {
  return USE_MOCK ? quoteMock.mockRejectQuote(id, reviewRemark) : defHttp.put({ url: Api.ReviewQuote, params: { id, status: 2, reviewRemark } });
}
export function withdrawApprovedQuoteApi(id: string) {
  return USE_MOCK ? quoteMock.mockOffQuote(id) : defHttp.put({ url: `/b2b/supplier/quote/withdraw/${id}` });
}

/** 获取所有已生效报价列表，供目录商品优选报价下拉选择 */
export function listApprovedQuotesForSelectApi() {
  return USE_MOCK ? quoteMock.mockListApprovedQuotesForSelect() : defHttp.get({ url: Api.ListQuotes, params: { status: 1 } });
}

// ===== 商品目录 =====
export function listCatalogsApi(params: any) {
  return USE_MOCK ? catalogMock.mockListCatalogs(params) : defHttp.get({ url: Api.ListCatalogs, params });
}
export function updateCatalogApi(id: string, patch: Partial<PlatformCatalog>) {
  return USE_MOCK ? catalogMock.mockUpdateCatalog(id, patch) : defHttp.put({ url: Api.UpdateCatalog, data: { id, ...patch } });
}
export function addCatalogApi(data: Partial<PlatformCatalog>) {
  return USE_MOCK ? catalogMock.mockAddCatalog(data) : defHttp.post({ url: Api.AddCatalog, data });
}
export function toggleShelfApi(id: string, status: CatalogStatus) {
  return USE_MOCK ? catalogMock.mockToggleShelf(id, status) : defHttp.put({ url: `/b2b/catalog/shelf/${id}`, data: { status } });
}
