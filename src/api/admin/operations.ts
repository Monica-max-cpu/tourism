/**
 * 平台管理员 - 库存 / 订单 / 支付 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2B】admin 业务接口
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2B】admin 业务接口
 */
import { defHttp } from '/@/api/http';
import * as stockMock from '/@/mocks/admin/stock.mock';
import * as storeOrderMock from '/@/mocks/admin/storeOrder.mock';
import * as paymentMock from '/@/mocks/admin/payment.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  // 库存
  ListStocks = '/b2b/admin/stocks/list',
  UpdateStockThreshold = '/b2b/admin/stocks/update-threshold',
  // 门店订单
  ListStoreOrders = '/b2b/admin/store-orders/list',
  GetStoreOrder = '/b2b/admin/store-orders/detail',
  CancelStoreOrder = '/b2b/admin/store-orders/cancel',
  // 支付
  ListPayments = '/b2b/admin/payments/list',
  ConfirmPayment = '/b2b/admin/payments/confirm',
  RejectPayment = '/b2b/admin/payments/reject',
}

// ===== 库存 =====
export function listStocksApi(params: any) {
  return USE_MOCK ? stockMock.mockListStocks(params) : defHttp.post({ url: Api.ListStocks, data: params });
}
export function updateStockThresholdApi(id: string, threshold: number) {
  return USE_MOCK ? stockMock.mockUpdateStockThreshold(id, threshold) : defHttp.post({ url: Api.UpdateStockThreshold, data: { id, threshold } });
}

// ===== 门店订单 =====
export function listStoreOrdersApi(params: any) {
  return USE_MOCK ? storeOrderMock.mockListStoreOrders(params) : defHttp.post({ url: Api.ListStoreOrders, data: params });
}
export function getStoreOrderApi(id: string) {
  return USE_MOCK ? storeOrderMock.mockGetStoreOrder(id) : defHttp.get({ url: Api.GetStoreOrder, params: { id } });
}
export function cancelStoreOrderApi(id: string, reason: string) {
  return USE_MOCK ? storeOrderMock.mockCancelStoreOrder(id, reason) : defHttp.post({ url: Api.CancelStoreOrder, data: { id, reason } });
}

// ===== 支付 =====
export function listPaymentsApi(params: any) {
  return USE_MOCK ? paymentMock.mockListPayments(params) : defHttp.post({ url: Api.ListPayments, data: params });
}
export function confirmPaymentApi(id: string) {
  return USE_MOCK ? paymentMock.mockConfirmPayment(id) : defHttp.post({ url: Api.ConfirmPayment, data: { id } });
}
export function rejectPaymentApi(id: string, reason: string) {
  return USE_MOCK ? paymentMock.mockRejectPayment(id, reason) : defHttp.post({ url: Api.RejectPayment, data: { id, reason } });
}
