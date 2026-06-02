/**
 * 阶段 4 - 门店采购订单 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单 API
 * 强制：调用方传入 storeId（来自 useUserStore.user.storeId）作为 searchInfo 强制过滤条件
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单 API
 */
import { defHttp } from '/@/api/http';
import type { StoreOrderCreateParams } from '/#/b2b-store';

enum Api {
  ListOrders = '/b2b/store/order/list',
  CreateOrder = '/b2b/store/order/create',
  ConfirmReceive = '/b2b/store/order/confirm-receive',
}

export function listStoreOrdersApi(params: any) {
  return defHttp.get({ url: Api.ListOrders, params });
}
export function getStoreOrderApi(id: string) {
  return defHttp.get({ url: `/b2b/store/order/detail/${id}` });
}
export function createStoreOrderApi(params: StoreOrderCreateParams) {
  return defHttp.post({ url: Api.CreateOrder, data: params });
}
export function cancelStoreOrderApi(id: string, cancelReason: string) {
  return defHttp.put({ url: `/b2b/store/order/cancel/${id}`, data: { cancelReason } });
}
export function confirmReceiveApi(id: string) {
  return defHttp.put({ url: Api.ConfirmReceive, data: { id } });
}
export function getStoreWorkbenchSummaryApi(storeId: string) {
  void storeId;
  return Promise.resolve({
    pendingPayment: 0,
    pendingConfirm: 0,
    shipping: 0,
    delivered: 0,
    completed30d: 0,
    purchaseAmount30d: 0,
  });
}
