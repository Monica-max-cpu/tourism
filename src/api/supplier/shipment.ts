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
  ListShipments = '/b2b/supplier/shipments/list',
  Ship = '/b2b/supplier/shipments/ship',
  UpdateTracking = '/b2b/supplier/shipments/update-tracking',
  ShipmentSummary = '/b2b/supplier/shipments/summary',
}

export function listShipmentsApi(params: any) {
  return USE_MOCK ? shipmentMock.mockListShipments(params) : defHttp.post({ url: Api.ListShipments, data: params });
}
export function shipApi(params: ShipParams) {
  return USE_MOCK ? shipmentMock.mockShipShipment(params) : defHttp.post({ url: Api.Ship, data: params });
}
export function updateTrackingApi(id: string, carrier: string, trackingNo: string) {
  return USE_MOCK ? shipmentMock.mockUpdateTracking(id, carrier, trackingNo) : defHttp.post({ url: Api.UpdateTracking, data: { id, carrier, trackingNo } });
}
export function getShipmentSummaryApi(supplierId: string) {
  return USE_MOCK ? shipmentMock.mockSupplierShipmentSummary(supplierId) : defHttp.get({ url: Api.ShipmentSummary, params: { supplierId } });
}
