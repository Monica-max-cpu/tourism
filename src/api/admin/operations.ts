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
  ListStocks = '/b2b/stock/supplier/list',
  UpdateStockAlertQty = '/b2b/stock/alert-qty',
  // 门店订单
  ListStoreOrders = '/b2b/store/order/admin/list',
  // 支付
  ListPayments = '/b2b/payment/pending/list',
  ConfirmPayment = '/b2b/payment/manual/confirm',
}

// ===== 库存 =====
export function listStocksApi(params: any) {
  return USE_MOCK ? stockMock.mockListStocks(params) : defHttp.get({ url: Api.ListStocks, params });
}
export function updateStockThresholdApi(id: string, threshold: number) {
  return USE_MOCK ? stockMock.mockUpdateStockThreshold(id, threshold) : defHttp.put({ url: Api.UpdateStockAlertQty, data: { id, alertQty: threshold } });
}

// ===== 门店订单 =====
export function listStoreOrdersApi(params: any) {
  return USE_MOCK ? storeOrderMock.mockListStoreOrders(params) : defHttp.get({ url: Api.ListStoreOrders, params });
}
export function getStoreOrderApi(id: string) {
  return USE_MOCK ? storeOrderMock.mockGetStoreOrder(id) : defHttp.get({ url: `/b2b/store/order/detail/${id}` });
}
export function cancelStoreOrderApi(id: string, reason: string) {
  return USE_MOCK ? storeOrderMock.mockCancelStoreOrder(id, reason) : defHttp.put({ url: `/b2b/store/order/cancel/${id}`, data: { reason } });
}

// ===== 支付 =====
export function listPaymentsApi(params: any) {
  return USE_MOCK ? paymentMock.mockListPayments(params) : defHttp.get({ url: Api.ListPayments, params });
}
export function confirmPaymentApi(id: string) {
  return USE_MOCK ? paymentMock.mockConfirmPayment(id) : defHttp.put({ url: Api.ConfirmPayment, data: { id } });
}
export function rejectPaymentApi(id: string, reason: string) {
  // 后端无拒付接口，使用 mock
  return paymentMock.mockRejectPayment(id, reason);
}
