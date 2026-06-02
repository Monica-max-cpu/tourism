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
  ListStocks = '/b2b/stock/supplier/list',
  ReplenishStock = '/b2b/stock/replenish',
  UpdateAlertQty = '/b2b/stock/alert-qty',
  // 结算
  ListSettlements = '/b2b/settlement/supplier/list',
  // 供应商资料
  SupplierUpdate = '/b2b/supplier/update',
}

// ===== 库存 =====
export function listSupplierStocksApi(params: any) {
  return USE_MOCK ? invMock.mockListSupplierStocks(params) : defHttp.get({ url: Api.ListStocks, params });
}
export function replenishStockApi(data: { supplierId?: string; productId: string; warehouseId?: string; qty: number; remark?: string }) {
  return USE_MOCK ? invMock.mockReplenishStock({ ...data, supplierId: data.supplierId || '' }) : defHttp.post({ url: Api.ReplenishStock, data });
}
export function updateSupplierStockThresholdApi(id: string, warnThreshold: number) {
  return USE_MOCK ? invMock.mockUpdateStockThreshold(id, warnThreshold) : defHttp.put({ url: Api.UpdateAlertQty, data: { id, alertQty: warnThreshold } });
}
export function getSupplierStockSummaryApi(supplierId?: string) {
  // 后端无库存汇总接口，使用 mock
  return invMock.mockSupplierStockSummary(supplierId || '');
}

// ===== 结算 =====
export function listSupplierSettlementsApi(params: any) {
  return USE_MOCK ? invMock.mockListSupplierSettlements(params) : defHttp.get({ url: Api.ListSettlements, params });
}
export function confirmSupplierSettlementApi(id: string) {
  // 结算确认为管理员操作，供应商侧无此接口，使用 mock
  return invMock.mockConfirmSettlement(id);
}
export function getSupplierSettlementSummaryApi(supplierId?: string) {
  // 后端无结算汇总接口，使用 mock
  return invMock.mockSupplierSettlementSummary(supplierId || '');
}

// ===== 资料 =====
export function getSupplierProfileApi(supplierId?: string) {
  // 后端无企业资料独立接口，使用 mock
  return invMock.mockGetSupplierProfile(supplierId || '');
}
export function updateSupplierProfileApi(patch: Partial<SupplierProfile>) {
  if (USE_MOCK) return invMock.mockUpdateSupplierProfile(patch);
  return defHttp.put({ url: Api.SupplierUpdate, data: patch });
}
