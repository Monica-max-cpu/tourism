/**
 * 阶段 3 - 供应商库存 + 结算 + 企业资料 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存/结算/资料 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存/结算/资料 API
 */
import { defHttp } from '/@/api/http';
import type { SupplierProfile } from '/#/b2b-supplier';

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
  return defHttp.get({ url: Api.ListStocks, params });
}
export function replenishStockApi(data: { productId: string; warehouseId?: string; qty: number; remark?: string }) {
  return defHttp.post({ url: Api.ReplenishStock, data });
}
export function updateSupplierStockThresholdApi(id: string, warnThreshold: number) {
  return defHttp.put({ url: Api.UpdateAlertQty, data: { id, alertQty: warnThreshold } });
}
export function getSupplierStockSummaryApi(supplierId?: string) {
  void supplierId;
  return Promise.resolve({ total: 0, low: 0, out: 0 });
}

// ===== 结算 =====
export function listSupplierSettlementsApi(params: any) {
  return defHttp.get({ url: Api.ListSettlements, params });
}
export function confirmSupplierSettlementApi(id: string) {
  void id;
  return Promise.reject(new Error('后端暂无供应商确认对账接口'));
}
export function getSupplierSettlementSummaryApi(supplierId?: string) {
  void supplierId;
  return Promise.resolve({ pendingAmount: 0, confirmedAmount: 0, paidAmount: 0 });
}

// ===== 资料 =====
export function getSupplierProfileApi(supplierId?: string): Promise<SupplierProfile | null> {
  void supplierId;
  return Promise.resolve(null);
}
export function updateSupplierProfileApi(patch: Partial<SupplierProfile>) {
  return defHttp.put({ url: Api.SupplierUpdate, data: patch });
}
