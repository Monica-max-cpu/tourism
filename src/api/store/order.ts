/**
 * 阶段 4 - 门店采购订单 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单 API
 * 强制：调用方传入 storeId（来自 useUserStore.user.storeId）作为 searchInfo 强制过滤条件
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单 API
 */
import { defHttp } from '/@/api/http';
import * as orderMock from '/@/mocks/store/order.mock';
import type { StoreOrderCreateParams } from '/#/b2b-store';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  ListOrders = '/b2b/store/orders/list',
  GetOrder = '/b2b/store/orders/get',
  CreateOrder = '/b2b/store/orders/create',
  CancelOrder = '/b2b/store/orders/cancel',
  ConfirmReceive = '/b2b/store/orders/confirm-receive',
  WorkbenchSummary = '/b2b/store/workbench/summary',
}

export function listStoreOrdersApi(params: any) {
  return USE_MOCK ? orderMock.mockListStoreOrders(params) : defHttp.post({ url: Api.ListOrders, data: params });
}
export function getStoreOrderApi(id: string) {
  return USE_MOCK ? orderMock.mockGetStoreOrder(id) : defHttp.get({ url: Api.GetOrder, params: { id } });
}
export function createStoreOrderApi(params: StoreOrderCreateParams) {
  return USE_MOCK ? orderMock.mockCreateStoreOrder(params) : defHttp.post({ url: Api.CreateOrder, data: params });
}
export function cancelStoreOrderApi(id: string, reason: string) {
  return USE_MOCK ? orderMock.mockCancelStoreOrder(id, reason) : defHttp.post({ url: Api.CancelOrder, data: { id, reason } });
}
export function confirmReceiveApi(id: string) {
  return USE_MOCK ? orderMock.mockConfirmReceive(id) : defHttp.post({ url: Api.ConfirmReceive, data: { id } });
}
export function getStoreWorkbenchSummaryApi(storeId: string) {
  return USE_MOCK ? orderMock.mockGetStoreWorkbenchSummary(storeId) : defHttp.get({ url: Api.WorkbenchSummary, params: { storeId } });
}
