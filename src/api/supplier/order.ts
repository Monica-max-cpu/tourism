/**
 * 阶段 3 - 供应商集采订单 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商订单 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商订单 API
 */
import { defHttp } from '/@/api/http';
import type { ShipParams } from '/#/b2b-supplier';

enum Api {
  ListOrders = '/b2b/collective/list',
  ShipOrder = '/b2b/collective/delivery/ship',
}

export function listSupplierOrdersApi(params: any) {
  return defHttp.get({ url: Api.ListOrders, params });
}
export function getSupplierOrderApi(id: string) {
  return defHttp.get({ url: `/b2b/collective/detail/${id}` });
}
export function confirmSupplierOrderApi(id: string) {
  return defHttp.put({ url: `/b2b/collective/supplier/confirm/${id}` });
}
export function rejectSupplierOrderApi(id: string, reason: string) {
  void id;
  void reason;
  return Promise.reject(new Error('后端暂无供应商拒绝集采单接口'));
}
/** 发货：CONFIRMED → SHIPPING，写入 carrier/trackingNo */
export function shipSupplierOrderApi(params: ShipParams) {
  return defHttp.post({ url: Api.ShipOrder, data: params });
}
export function getSupplierOrderSummaryApi(supplierId?: string) {
  void supplierId;
  return Promise.resolve({ triggered: 0, confirmed: 0, shipping: 0, completed: 0 });
}
