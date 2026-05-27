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
  ListOrders = '/b2b/collective/list',
  ShipOrder = '/b2b/collective/delivery/ship',
}

export function listSupplierOrdersApi(params: any) {
  return USE_MOCK ? orderMock.mockListSupplierOrders(params) : defHttp.get({ url: Api.ListOrders, params });
}
export function getSupplierOrderApi(id: string) {
  return USE_MOCK ? orderMock.mockGetSupplierOrder(id) : defHttp.get({ url: `/b2b/collective/detail/${id}` });
}
export function confirmSupplierOrderApi(id: string) {
  return USE_MOCK ? orderMock.mockConfirmSupplierOrder(id) : defHttp.put({ url: `/b2b/collective/supplier/confirm/${id}` });
}
export function rejectSupplierOrderApi(id: string, reason: string) {
  // 后端无拒绝集采单接口，使用 mock
  return orderMock.mockRejectSupplierOrder(id, reason);
}
/** 发货：CONFIRMED → SHIPPING，写入 carrier/trackingNo */
export function shipSupplierOrderApi(params: ShipParams) {
  return USE_MOCK ? orderMock.mockShipSupplierOrder(params) : defHttp.post({ url: Api.ShipOrder, data: params });
}
export function getSupplierOrderSummaryApi(supplierId: string) {
  // 后端无汇总接口，使用 mock
  return orderMock.mockSupplierOrderSummary(supplierId);
}
