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
  ListPendingCollective = '/b2b/collective/pending-orders',
  TriggerCollective = '/b2b/collective/trigger',
  ListCollectiveOrders = '/b2b/collective/list',
  GetCollectiveConfig = '/b2b/collective/config',
  UpdateCollectiveConfig = '/b2b/collective/config',
  // 履约
  ListDeliveries = '/b2b/delivery/list',
  // 结算
  ListStoreSettlements = '/b2b/settlement/store/list',
  ListSupplierSettlements = '/b2b/settlement/supplier/list',
  // 利润
  ListProfits = '/b2b/profit/list',
  GetProfitSummary = '/b2b/profit/summary',
}

// ===== 集采 =====
export function listPendingCollectiveApi() {
  return USE_MOCK ? collectiveMock.mockListPendingCollective() : defHttp.get({ url: Api.ListPendingCollective });
}
export function triggerCollectiveApi(ids: string[]) {
  return USE_MOCK ? collectiveMock.mockTriggerCollective(ids) : defHttp.post({ url: Api.TriggerCollective, data: { ids } });
}
export function listCollectiveOrdersApi(params: any) {
  return USE_MOCK ? collectiveMock.mockListCollectiveOrders(params) : defHttp.get({ url: Api.ListCollectiveOrders, params });
}
export function getCollectiveOrderApi(id: string) {
  return USE_MOCK ? collectiveMock.mockGetCollectiveOrder(id) : defHttp.get({ url: `/b2b/collective/detail/${id}` });
}
export function getCollectiveConfigApi() {
  return USE_MOCK ? collectiveMock.mockGetCollectiveConfig() : defHttp.get({ url: Api.GetCollectiveConfig });
}
export function updateCollectiveConfigApi(patch: Partial<CollectiveConfig>) {
  return USE_MOCK ? collectiveMock.mockUpdateCollectiveConfig(patch) : defHttp.put({ url: Api.UpdateCollectiveConfig, data: patch });
}

// ===== 履约 =====
export function listDeliveriesApi(params: any) {
  return USE_MOCK ? fulfillmentMock.mockListDeliveries(params) : defHttp.get({ url: Api.ListDeliveries, params });
}
export function handleDeliveryExceptionApi(id: string, action: 'retry' | 'cancel', remark: string) {
  return USE_MOCK
    ? fulfillmentMock.mockHandleDeliveryException(id, action, remark)
    : defHttp.put({ url: `/b2b/delivery/exception/${id}`, data: { action, remark } });
}

// ===== 结算 =====
export function listStoreSettlementsApi(params: any) {
  return USE_MOCK ? fulfillmentMock.mockListStoreSettlements(params) : defHttp.get({ url: Api.ListStoreSettlements, params });
}
export function listSupplierSettlementsApi(params: any) {
  return USE_MOCK ? fulfillmentMock.mockListSupplierSettlements(params) : defHttp.get({ url: Api.ListSupplierSettlements, params });
}
export function paySettlementApi(id: string) {
  return USE_MOCK ? fulfillmentMock.mockPaySettlement(id) : defHttp.put({ url: `/b2b/settlement/supplier/pay/${id}` });
}

// ===== 利润 =====
export function listProfitsApi(params: any) {
  return USE_MOCK ? fulfillmentMock.mockListProfits(params) : defHttp.get({ url: Api.ListProfits, params });
}
export function getProfitSummaryApi() {
  return USE_MOCK ? fulfillmentMock.mockGetProfitSummary() : defHttp.get({ url: Api.GetProfitSummary });
}
