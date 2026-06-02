/**
 * 阶段 3 - 供应商报价 + 自营商品 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价 API
 * 供应商/门店用户无需传 supplierId，后端按登录用户自动关联
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价 API
 */
import { defHttp } from '/@/api/http';
import type { SupplierProduct, SupplierProductStatus, SupplierQuoteRecord, SupplierQuoteCreateParams } from '/#/b2b-supplier';

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
  return defHttp.get({ url: Api.ListProducts, params });
}
export function saveSupplierProductApi(payload: Partial<SupplierProduct>) {
  return payload.id
    ? defHttp.put({ url: Api.EditProduct, data: payload })
    : defHttp.post({ url: Api.AddProduct, data: payload });
}
export function toggleSupplierProductShelfApi(id: string, status: SupplierProductStatus) {
  return defHttp.put({ url: Api.EditProduct, data: { id, status } });
}
export function deleteSupplierProductApi(id: string) {
  return defHttp.delete({ url: `/b2b/supplier/product/${id}` });
}

// ===== 报价 =====
export function listSupplierQuotesApi(params: any) {
  return defHttp.get({ url: Api.ListQuotes, params });
}
export function createSupplierQuoteApi(params: SupplierQuoteCreateParams) {
  return defHttp.post({ url: Api.SubmitQuote, data: params });
}
export function updateSupplierQuoteApi(id: string, patch: Partial<SupplierQuoteRecord>) {
  void id;
  void patch;
  return Promise.reject(new Error('后端暂无报价更新接口，请撤回后重新提交'));
}
export function offSupplierQuoteApi(id: string) {
  return defHttp.put({ url: `/b2b/supplier/quote/withdraw/${id}` });
}
export function resubmitSupplierQuoteApi(id: string) {
  void id;
  return Promise.reject(new Error('后端暂无独立重新提交接口，请新建报价提交'));
}
