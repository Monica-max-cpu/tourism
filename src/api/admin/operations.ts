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

function normalizePage(page: any, normalizeRecord: (row: any) => any = (row) => row) {
  if (!page?.records) return page;
  return {
    ...page,
    records: page.records.map(normalizeRecord),
  };
}

function flattenSearchParams(params: any, keywordField = 'keyword') {
  const { searchInfo, ...rest } = params || {};
  const flat = { ...rest, ...(searchInfo || {}) };
  if (flat.keyword) {
    flat[keywordField] = flat.keyword;
    delete flat.keyword;
  }
  Object.keys(flat).forEach((key) => {
    if (flat[key] === '' || flat[key] === undefined || flat[key] === null) delete flat[key];
  });
  return flat;
}

function normalizeStoreOrderItem(item: any) {
  return {
    ...item,
    productSku: item.productSku || item.catalogId || '',
    qty: item.qty ?? item.quantity ?? 0,
    unitPrice: item.unitPrice ?? item.actualPrice ?? item.catalogPrice ?? 0,
  };
}

function normalizeStoreOrder(row: any) {
  const items = (row.items || []).map(normalizeStoreOrderItem);
  return {
    ...row,
    storeName: row.storeName || row.storeId || '-',
    items,
    itemCount: row.itemCount ?? items.length,
    createdAt: row.createdAt || row.createTime,
    paidAt: row.paidAt || row.paymentTime,
  };
}

const PAYMENT_METHOD_MAP: Record<string, string> = {
  OFFLINE: 'OFFLINE_TRANSFER',
  WECHAT: 'ONLINE_WECHAT',
  ALIPAY: 'ONLINE_ALIPAY',
  TONGLIAN: 'OFFLINE_TRANSFER',
};

function normalizePayment(row: any) {
  return {
    ...row,
    id: row.id || row.paymentId,
    paymentNo: row.paymentNo || row.tradeNo || row.paymentId,
    orderId: row.orderId || row.storeOrderId,
    storeName: row.storeName || row.storeId || '-',
    amount: row.amount ?? row.paymentAmount ?? row.actualAmount ?? 0,
    method: PAYMENT_METHOD_MAP[row.method || row.paymentMethod] || row.method || row.paymentMethod || 'OFFLINE_TRANSFER',
    transactionNo: row.transactionNo || row.thirdTradeNo,
    status: row.status || 'PENDING_CONFIRM',
    submittedAt: row.submittedAt || row.createTime,
    confirmedAt: row.confirmedAt || row.paidTime,
    confirmedBy: row.confirmedBy || row.confirmBy,
  };
}

// ===== 库存 =====
export function listStocksApi(params: any) {
  return USE_MOCK ? stockMock.mockListStocks(params) : defHttp.get({ url: Api.ListStocks, params });
}
export function updateStockThresholdApi(id: string, threshold: number) {
  return USE_MOCK ? stockMock.mockUpdateStockThreshold(id, threshold) : defHttp.put({ url: Api.UpdateStockAlertQty, data: { id, alertQty: threshold } });
}

// ===== 门店订单 =====
export async function listStoreOrdersApi(params: any) {
  if (USE_MOCK) return storeOrderMock.mockListStoreOrders(params);
  const res = await defHttp.get({ url: Api.ListStoreOrders, params: flattenSearchParams(params, 'orderNo') });
  return normalizePage(res, normalizeStoreOrder);
}
export async function getStoreOrderApi(id: string) {
  if (USE_MOCK) return storeOrderMock.mockGetStoreOrder(id);
  const res = await defHttp.get({ url: `/b2b/store/order/detail/${id}` });
  return normalizeStoreOrder(res);
}
export function cancelStoreOrderApi(id: string, reason: string) {
  const query = new URLSearchParams({ cancelReason: reason }).toString();
  return USE_MOCK ? storeOrderMock.mockCancelStoreOrder(id, reason) : defHttp.put({ url: `/b2b/store/order/cancel/${id}?${query}` });
}

// ===== 支付 =====
export async function listPaymentsApi(params: any) {
  if (USE_MOCK) return paymentMock.mockListPayments(params);
  const search = params?.searchInfo || {};
  const status = search.status;
  if (status && status !== 'PENDING_CONFIRM') return { records: [], total: 0 };
  const flat = flattenSearchParams(params, 'tradeNo');
  delete flat.status;
  delete flat.method;
  delete flat.tradeNo;
  const res = await defHttp.get({ url: Api.ListPayments, params: flat });
  const page = normalizePage(res, normalizePayment);
  if (!page?.records) return page;

  const keyword = String(search.keyword || '').trim().toLowerCase();
  const method = search.method;
  if (!keyword && !method) return page;

  const records = page.records.filter((row: any) => {
    const matchedKeyword = !keyword || [row.paymentNo, row.orderNo, row.storeName, row.storeId]
      .some((value) => String(value || '').toLowerCase().includes(keyword));
    const matchedMethod = !method || row.method === method;
    return matchedKeyword && matchedMethod;
  });
  return { ...page, records, total: records.length };
}
export function confirmPaymentApi(id: string, actualAmount = 0) {
  return USE_MOCK ? paymentMock.mockConfirmPayment(id) : defHttp.put({ url: Api.ConfirmPayment, data: { paymentId: id, actualAmount } });
}
export function rejectPaymentApi(id: string, reason: string) {
  // 后端无拒付接口，使用 mock
  return paymentMock.mockRejectPayment(id, reason);
}
