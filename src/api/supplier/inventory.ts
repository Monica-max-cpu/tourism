/**
 * 阶段 3 - 供应商库存 + 结算 + 企业资料 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存/结算/资料 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存/结算/资料 API
 */
import { defHttp } from '/@/api/http';
import * as invMock from '/@/mocks/supplier/inventory.mock';
import type { SupplierProfile } from '/#/b2b-supplier';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  // 库存
  ListStocks = '/b2b/supplier/stocks/list',
  UpdateStockQty = '/b2b/supplier/stocks/update-qty',
  UpdateStockThreshold = '/b2b/supplier/stocks/update-threshold',
  StockSummary = '/b2b/supplier/stocks/summary',
  // 结算
  ListSettlements = '/b2b/supplier/settlements/list',
  ConfirmSettlement = '/b2b/supplier/settlements/confirm',
  SettlementSummary = '/b2b/supplier/settlements/summary',
  // 资料
  GetProfile = '/b2b/supplier/profile/get',
  UpdateProfile = '/b2b/supplier/profile/update',
}

// ===== 库存 =====
export function listSupplierStocksApi(params: any) {
  return USE_MOCK ? invMock.mockListSupplierStocks(params) : defHttp.post({ url: Api.ListStocks, data: params });
}
export function updateSupplierStockQtyApi(id: string, availableQty: number) {
  return USE_MOCK ? invMock.mockUpdateStockQty(id, availableQty) : defHttp.post({ url: Api.UpdateStockQty, data: { id, availableQty } });
}
export function updateSupplierStockThresholdApi(id: string, warnThreshold: number) {
  return USE_MOCK ? invMock.mockUpdateStockThreshold(id, warnThreshold) : defHttp.post({ url: Api.UpdateStockThreshold, data: { id, warnThreshold } });
}
export function getSupplierStockSummaryApi(supplierId: string) {
  return USE_MOCK ? invMock.mockSupplierStockSummary(supplierId) : defHttp.get({ url: Api.StockSummary, params: { supplierId } });
}

// ===== 结算 =====
export function listSupplierSettlementsApi(params: any) {
  return USE_MOCK ? invMock.mockListSupplierSettlements(params) : defHttp.post({ url: Api.ListSettlements, data: params });
}
export function confirmSupplierSettlementApi(id: string) {
  return USE_MOCK ? invMock.mockConfirmSettlement(id) : defHttp.post({ url: Api.ConfirmSettlement, data: { id } });
}
export function getSupplierSettlementSummaryApi(supplierId: string) {
  return USE_MOCK ? invMock.mockSupplierSettlementSummary(supplierId) : defHttp.get({ url: Api.SettlementSummary, params: { supplierId } });
}

// ===== 资料 =====
export function getSupplierProfileApi(supplierId: string) {
  return USE_MOCK ? invMock.mockGetSupplierProfile(supplierId) : defHttp.get({ url: Api.GetProfile, params: { supplierId } });
}
export function updateSupplierProfileApi(patch: Partial<SupplierProfile>) {
  return USE_MOCK ? invMock.mockUpdateSupplierProfile(patch) : defHttp.post({ url: Api.UpdateProfile, data: patch });
}
