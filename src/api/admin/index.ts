/**
 * 平台管理员 - 入驻审核 / 报价 / 商品目录 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2A】管理员审核与目录接口
 * update-begin--author:phase7---date:2026-05-26---for:【阶段7】对齐 b2b-api-contract.md 字段名与启用/停用
 * update-end--author:phase7---date:2026-05-26---for:【阶段7】对齐 b2b-api-contract.md 字段名与启用/停用
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2A】管理员审核与目录接口
 */
import { defHttp } from '/@/api/http';
import type { SupplierApply, StoreApply, PlatformCatalog, CatalogStatus, ApplyStatus } from '/#/b2b';

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
  AdminWithdrawQuote = '/b2b/supplier/quote/admin/withdraw',
  // 商品目录（管理员侧）
  ListCatalogs = '/b2b/catalog/admin/list',
  UpdateCatalog = '/b2b/catalog/edit',
  AddCatalog = '/b2b/catalog/add',
}

// ===== 供应商审核 =====
export function listSupplierApplyApi(params: any) {
  return defHttp.get({ url: Api.ListSupplierApply, params });
}
export function getSupplierApplyApi(id: string): Promise<SupplierApply | null> {
  return defHttp.get({ url: `${Api.GetSupplierApply}/${id}` });
}
export function approveSupplierApplyApi(id: string) {
  return defHttp.put({ url: Api.ReviewSupplierApply, data: { id, status: 1 } });
}
export function rejectSupplierApplyApi(id: string, reviewRemark: string) {
  return defHttp.put({ url: Api.ReviewSupplierApply, data: { id, status: 2, reviewRemark } });
}
export function toggleSupplierStatusApi(id: string, status: ApplyStatus) {
  return defHttp.put({ url: `${Api.ToggleSupplierStatus}?id=${id}&status=${status}` });
}

// ===== 门店审核 =====
export function listStoreApplyApi(params: any) {
  return defHttp.get({ url: Api.ListStoreApply, params });
}
export function getStoreApplyApi(id: string): Promise<StoreApply | null> {
  return defHttp.get({ url: `${Api.GetStoreApply}/${id}` });
}
export function approveStoreApplyApi(id: string) {
  return defHttp.put({ url: Api.ReviewStoreApply, data: { id, status: 1 } });
}
export function rejectStoreApplyApi(id: string, reviewRemark: string) {
  return defHttp.put({ url: Api.ReviewStoreApply, data: { id, status: 2, reviewRemark } });
}
export function toggleStoreStatusApi(id: string, status: ApplyStatus) {
  return defHttp.put({ url: `${Api.ToggleStoreStatus}?id=${id}&status=${status}` });
}

// ===== 报价审核 =====
function buildQuoteReviewUrl(params: Record<string, string | number>) {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
  return `${Api.ReviewQuote}?${query}`;
}

export function listQuotesApi(params: any) {
  return defHttp.get({ url: Api.ListQuotes, params });
}
export function approveQuoteApi(id: string) {
  return defHttp.put({ url: buildQuoteReviewUrl({ id, status: 1 }) });
}
export async function batchApproveQuotesApi(ids: string[]) {
  await Promise.all(ids.map((id) => approveQuoteApi(id)));
  return { success: true, count: ids.length };
}
export function rejectQuoteApi(id: string, reviewRemark: string) {
  return defHttp.put({ url: buildQuoteReviewUrl({ id, status: 2, reviewRemark }) });
}
export function withdrawApprovedQuoteApi(id: string) {
  return defHttp.put({ url: `${Api.AdminWithdrawQuote}/${id}` });
}

/** 获取所有已生效报价列表，供目录商品优选报价下拉选择 */
export function listApprovedQuotesForSelectApi() {
  return defHttp.get({ url: Api.ListQuotes, params: { status: 1 } });
}

// ===== 商品目录 =====
export function listCatalogsApi(params: any) {
  return defHttp.get({ url: Api.ListCatalogs, params });
}
export function updateCatalogApi(id: string, patch: Partial<PlatformCatalog>) {
  return defHttp.put({ url: Api.UpdateCatalog, data: { id, ...patch } });
}
export function addCatalogApi(data: Partial<PlatformCatalog>) {
  return defHttp.post({ url: Api.AddCatalog, data });
}
export function toggleShelfApi(id: string, status: CatalogStatus) {
  return defHttp.put({ url: `/b2b/catalog/shelf/${id}`, data: { status } });
}
