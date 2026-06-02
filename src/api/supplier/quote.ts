/**
 * 阶段 3 - 供应商报价 + 自营商品 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价 API
 * 供应商/门店用户无需传 supplierId，后端按登录用户自动关联
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价 API
 */
import { defHttp } from '/@/api/http';
import * as quoteMock from '/@/mocks/supplier/quote.mock';
import type { SupplierProduct, SupplierProductStatus, SupplierQuoteRecord, SupplierQuoteCreateParams } from '/#/b2b-supplier';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  // 自营商品
  ListProducts = '/b2b/supplier/product/list',
  AddProduct = '/b2b/supplier/product/add',
  EditProduct = '/b2b/supplier/product/edit',
  // 报价
  ListQuotes = '/b2b/supplier/quote/list',
  SubmitQuote = '/b2b/supplier/quote/submit',
}

// ===== 自营商品 =====
export function listSupplierProductsApi(params: any) {
  return USE_MOCK ? quoteMock.mockListSupplierProducts(params) : defHttp.get({ url: Api.ListProducts, params });
}
export function saveSupplierProductApi(payload: Partial<SupplierProduct>) {
  if (USE_MOCK) return quoteMock.mockSaveSupplierProduct(payload);
  return payload.id
    ? defHttp.put({ url: Api.EditProduct, data: payload })
    : defHttp.post({ url: Api.AddProduct, data: payload });
}
export function toggleSupplierProductShelfApi(id: string, status: SupplierProductStatus) {
  // 后端无上下架独立接口，使用 mock
  return quoteMock.mockToggleProductShelf(id, status);
}
export function deleteSupplierProductApi(id: string) {
  return USE_MOCK ? quoteMock.mockDeleteSupplierProduct(id) : defHttp.delete({ url: `/b2b/supplier/product/${id}` });
}

// ===== 报价 =====
export function listSupplierQuotesApi(params: any) {
  return USE_MOCK ? quoteMock.mockListSupplierQuotes(params) : defHttp.get({ url: Api.ListQuotes, params });
}
export function createSupplierQuoteApi(params: SupplierQuoteCreateParams) {
  return USE_MOCK ? quoteMock.mockCreateSupplierQuote(params) : defHttp.post({ url: Api.SubmitQuote, data: params });
}
export function updateSupplierQuoteApi(id: string, patch: Partial<SupplierQuoteRecord>) {
  // 后端无更新报价接口（需撤回后重新提交），使用 mock
  return quoteMock.mockUpdateSupplierQuote(id, patch);
}
export function offSupplierQuoteApi(id: string) {
  return USE_MOCK ? quoteMock.mockOffSupplierQuote(id) : defHttp.put({ url: `/b2b/supplier/quote/withdraw/${id}` });
}
export function resubmitSupplierQuoteApi(id: string) {
  // 后端无独立重提接口（使用 submit 重新提交），使用 mock
  return quoteMock.mockResubmitSupplierQuote(id);
}
