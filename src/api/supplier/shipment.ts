/**
 * 阶段 3 - 供应商发货 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商发货 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商发货 API
 */
import { defHttp } from '/@/api/http';
import type { ShipParams } from '/#/b2b-supplier';

enum Api {
  ListShipments = '/b2b/delivery/list',
  Ship = '/b2b/collective/delivery/ship',
}

export function listShipmentsApi(params: any) {
  return defHttp.get({ url: Api.ListShipments, params });
}
export function shipApi(params: ShipParams) {
  return defHttp.post({ url: Api.Ship, data: params });
}
export function updateTrackingApi(id: string, carrier: string, trackingNo: string) {
  void id;
  void carrier;
  void trackingNo;
  return Promise.reject(new Error('后端暂无单独更新物流信息接口'));
}
export function getShipmentSummaryApi(supplierId?: string) {
  void supplierId;
  return Promise.resolve({ pending: 0, shipped: 0, delivered: 0, exception: 0 });
}
