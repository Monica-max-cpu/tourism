/**
 * 阶段 3 - 供应商集采订单 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商订单 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商订单 API
 */
import { defHttp } from '/@/api/http';
import * as orderMock from '/@/mocks/supplier/order.mock';
import type { ShipParams } from '/#/b2b-supplier';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  ListOrders = '/b2b/supplier/orders/list',
  GetOrder = '/b2b/supplier/orders/detail',
  ConfirmOrder = '/b2b/supplier/orders/confirm',
  RejectOrder = '/b2b/supplier/orders/reject',
  ShipOrder = '/b2b/supplier/orders/ship',
  OrderSummary = '/b2b/supplier/orders/summary',
}

export function listSupplierOrdersApi(params: any) {
  return USE_MOCK ? orderMock.mockListSupplierOrders(params) : defHttp.post({ url: Api.ListOrders, data: params });
}
export function getSupplierOrderApi(id: string) {
  return USE_MOCK ? orderMock.mockGetSupplierOrder(id) : defHttp.get({ url: Api.GetOrder, params: { id } });
}
export function confirmSupplierOrderApi(id: string) {
  return USE_MOCK ? orderMock.mockConfirmSupplierOrder(id) : defHttp.post({ url: Api.ConfirmOrder, data: { id } });
}
export function rejectSupplierOrderApi(id: string, reason: string) {
  return USE_MOCK ? orderMock.mockRejectSupplierOrder(id, reason) : defHttp.post({ url: Api.RejectOrder, data: { id, reason } });
}
/** 发货：CONFIRMED → SHIPPING，写入 carrier/trackingNo */
export function shipSupplierOrderApi(params: ShipParams) {
  return USE_MOCK ? orderMock.mockShipSupplierOrder(params) : defHttp.post({ url: Api.ShipOrder, data: params });
}
export function getSupplierOrderSummaryApi(supplierId: string) {
  return USE_MOCK ? orderMock.mockSupplierOrderSummary(supplierId) : defHttp.get({ url: Api.OrderSummary, params: { supplierId } });
}
