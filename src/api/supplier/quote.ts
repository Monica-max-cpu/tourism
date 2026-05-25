/**
 * 阶段 3 - 供应商报价 + 自营商品 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价 API
 * 强制：调用方传入 supplierId（来自 useUserStore.user.supplierId）作为 searchInfo 强制过滤条件
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价 API
 */
import { defHttp } from '/@/api/http';
import * as quoteMock from '/@/mocks/supplier/quote.mock';
import type { SupplierProduct, SupplierProductStatus, SupplierQuoteRecord, SupplierQuoteCreateParams } from '/#/b2b-supplier';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  // 自营商品
  ListProducts = '/b2b/supplier/products/list',
  SaveProduct = '/b2b/supplier/products/save',
  ToggleProductShelf = '/b2b/supplier/products/toggle-shelf',
  // 报价
  ListQuotes = '/b2b/supplier/quotes/list',
  CreateQuote = '/b2b/supplier/quotes/create',
  UpdateQuote = '/b2b/supplier/quotes/update',
  OffQuote = '/b2b/supplier/quotes/off',
  ResubmitQuote = '/b2b/supplier/quotes/resubmit',
}

// ===== 自营商品 =====
export function listSupplierProductsApi(params: any) {
  return USE_MOCK ? quoteMock.mockListSupplierProducts(params) : defHttp.post({ url: Api.ListProducts, data: params });
}
export function saveSupplierProductApi(payload: Partial<SupplierProduct>) {
  return USE_MOCK ? quoteMock.mockSaveSupplierProduct(payload) : defHttp.post({ url: Api.SaveProduct, data: payload });
}
export function toggleSupplierProductShelfApi(id: string, status: SupplierProductStatus) {
  return USE_MOCK ? quoteMock.mockToggleProductShelf(id, status) : defHttp.post({ url: Api.ToggleProductShelf, data: { id, status } });
}

// ===== 报价 =====
export function listSupplierQuotesApi(params: any) {
  return USE_MOCK ? quoteMock.mockListSupplierQuotes(params) : defHttp.post({ url: Api.ListQuotes, data: params });
}
export function createSupplierQuoteApi(params: SupplierQuoteCreateParams) {
  return USE_MOCK ? quoteMock.mockCreateSupplierQuote(params) : defHttp.post({ url: Api.CreateQuote, data: params });
}
export function updateSupplierQuoteApi(id: string, patch: Partial<SupplierQuoteRecord>) {
  return USE_MOCK ? quoteMock.mockUpdateSupplierQuote(id, patch) : defHttp.post({ url: Api.UpdateQuote, data: { id, ...patch } });
}
export function offSupplierQuoteApi(id: string) {
  return USE_MOCK ? quoteMock.mockOffSupplierQuote(id) : defHttp.post({ url: Api.OffQuote, data: { id } });
}
export function resubmitSupplierQuoteApi(id: string) {
  return USE_MOCK ? quoteMock.mockResubmitSupplierQuote(id) : defHttp.post({ url: Api.ResubmitQuote, data: { id } });
}
