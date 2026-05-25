/**
 * 集采 / 履约 / 结算 / 利润 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2C】admin 业务接口
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2C】admin 业务接口
 */
import { defHttp } from '/@/api/http';
import * as collectiveMock from '/@/mocks/admin/collective.mock';
import * as fulfillmentMock from '/@/mocks/admin/fulfillment.mock';
import type { CollectiveConfig } from '/#/b2b-2c';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  // 集采
  ListPendingCollective = '/b2b/admin/collective/pending',
  TriggerCollective = '/b2b/admin/collective/trigger',
  ListCollectiveOrders = '/b2b/admin/collective/orders',
  GetCollectiveOrder = '/b2b/admin/collective/orders/detail',
  GetCollectiveConfig = '/b2b/admin/collective/config',
  UpdateCollectiveConfig = '/b2b/admin/collective/config/update',
  // 履约
  ListDeliveries = '/b2b/admin/deliveries/list',
  HandleDeliveryException = '/b2b/admin/deliveries/handle-exception',
  // 结算
  ListStoreSettlements = '/b2b/admin/settlements/stores',
  ListSupplierSettlements = '/b2b/admin/settlements/suppliers',
  PaySettlement = '/b2b/admin/settlements/pay',
  // 利润
  ListProfits = '/b2b/admin/profits/list',
  GetProfitSummary = '/b2b/admin/profits/summary',
}

// ===== 集采 =====
export function listPendingCollectiveApi() {
  return USE_MOCK ? collectiveMock.mockListPendingCollective() : defHttp.get({ url: Api.ListPendingCollective });
}
export function triggerCollectiveApi(ids: string[]) {
  return USE_MOCK ? collectiveMock.mockTriggerCollective(ids) : defHttp.post({ url: Api.TriggerCollective, data: { ids } });
}
export function listCollectiveOrdersApi(params: any) {
  return USE_MOCK ? collectiveMock.mockListCollectiveOrders(params) : defHttp.post({ url: Api.ListCollectiveOrders, data: params });
}
export function getCollectiveOrderApi(id: string) {
  return USE_MOCK ? collectiveMock.mockGetCollectiveOrder(id) : defHttp.get({ url: Api.GetCollectiveOrder, params: { id } });
}
export function getCollectiveConfigApi() {
  return USE_MOCK ? collectiveMock.mockGetCollectiveConfig() : defHttp.get({ url: Api.GetCollectiveConfig });
}
export function updateCollectiveConfigApi(patch: Partial<CollectiveConfig>) {
  return USE_MOCK ? collectiveMock.mockUpdateCollectiveConfig(patch) : defHttp.post({ url: Api.UpdateCollectiveConfig, data: patch });
}

// ===== 履约 =====
export function listDeliveriesApi(params: any) {
  return USE_MOCK ? fulfillmentMock.mockListDeliveries(params) : defHttp.post({ url: Api.ListDeliveries, data: params });
}
export function handleDeliveryExceptionApi(id: string, action: 'retry' | 'cancel', remark: string) {
  return USE_MOCK
    ? fulfillmentMock.mockHandleDeliveryException(id, action, remark)
    : defHttp.post({ url: Api.HandleDeliveryException, data: { id, action, remark } });
}

// ===== 结算 =====
export function listStoreSettlementsApi(params: any) {
  return USE_MOCK ? fulfillmentMock.mockListStoreSettlements(params) : defHttp.post({ url: Api.ListStoreSettlements, data: params });
}
export function listSupplierSettlementsApi(params: any) {
  return USE_MOCK ? fulfillmentMock.mockListSupplierSettlements(params) : defHttp.post({ url: Api.ListSupplierSettlements, data: params });
}
export function paySettlementApi(id: string) {
  return USE_MOCK ? fulfillmentMock.mockPaySettlement(id) : defHttp.post({ url: Api.PaySettlement, data: { id } });
}

// ===== 利润 =====
export function listProfitsApi(params: any) {
  return USE_MOCK ? fulfillmentMock.mockListProfits(params) : defHttp.post({ url: Api.ListProfits, data: params });
}
export function getProfitSummaryApi() {
  return USE_MOCK ? fulfillmentMock.mockGetProfitSummary() : defHttp.get({ url: Api.GetProfitSummary });
}
