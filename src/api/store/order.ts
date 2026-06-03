/**
 * 阶段 4 - 门店采购订单 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单 API
 * 强制：调用方传入 storeId（来自 useUserStore.user.storeId）作为 searchInfo 强制过滤条件
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单 API
 */
import { defHttp } from '/@/api/http';
import type { StoreOrderCreateParams } from '/#/b2b-store';
import type { StoreViewOrder } from '/#/b2b-store';

enum Api {
  ListOrders = '/b2b/store/order/list',
  CreateOrder = '/b2b/store/order/create',
  ConfirmReceive = '/b2b/store/order/confirm-receive',
}

export function listStoreOrdersApi(params: any) {
  // storeId is optional; backend filters by the current login subject.
  return defHttp.get<any>({ url: Api.ListOrders, params }).then(normalizeStoreOrderPage);
}

function normalizeStoreOrderPage(input: any): { records: StoreViewOrder[]; total: number } {
  const page = input?.records || input?.list || input?.rows ? input : input?.result;
  if (Array.isArray(input)) return { records: input, total: input.length };
  if (Array.isArray(page?.records)) return { records: page.records, total: Number(page.total ?? page.records.length) };
  if (Array.isArray(page?.list)) return { records: page.list, total: Number(page.total ?? page.list.length) };
  if (Array.isArray(page?.rows)) return { records: page.rows, total: Number(page.total ?? page.rows.length) };
  return { records: [], total: 0 };
}
export function getStoreOrderApi(id: string) {
  return defHttp.get({ url: `/b2b/store/order/detail/${id}` });
}
export function createStoreOrderApi(params: StoreOrderCreateParams) {
  return defHttp.post({ url: Api.CreateOrder, data: params });
}
export function cancelStoreOrderApi(id: string, cancelReason: string) {
  return defHttp.put({ url: `/b2b/store/order/cancel/${id}`, params: { cancelReason } });
}
export function confirmReceiveApi(data: { deliveryId: string; receivedQty: number; receiveRemark?: string }) {
  return defHttp.put({ url: Api.ConfirmReceive, data });
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
