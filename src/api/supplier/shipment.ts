/**
 * 阶段 3 - 供应商发货 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商发货 API
 * 注意：发货登记同时会更新对应集采单（order.mock.mockShipSupplierOrder），调用方需联动 reload
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商发货 API
 */
import { defHttp } from '/@/api/http';
import * as shipmentMock from '/@/mocks/supplier/shipment.mock';
import type { ShipParams } from '/#/b2b-supplier';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  ListShipments = '/b2b/delivery/list',
  Ship = '/b2b/collective/delivery/ship',
}

export function listShipmentsApi(params: any) {
  return USE_MOCK ? shipmentMock.mockListShipments(params) : defHttp.get({ url: Api.ListShipments, params });
}
export function shipApi(params: ShipParams) {
  return USE_MOCK ? shipmentMock.mockShipShipment(params) : defHttp.post({ url: Api.Ship, data: params });
}
export function updateTrackingApi(id: string, carrier: string, trackingNo: string) {
  // 后端无单独更新物流信息接口，使用 mock
  return shipmentMock.mockUpdateTracking(id, carrier, trackingNo);
}
export function getShipmentSummaryApi(supplierId?: string) {
  // 后端无发货汇总接口，使用 mock
  return shipmentMock.mockSupplierShipmentSummary(supplierId || '');
}
