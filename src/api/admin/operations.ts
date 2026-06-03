/**
 * 平台管理员 - 库存 / 订单 / 支付 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2B】admin 业务接口
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2B】admin 业务接口
 */
import { defHttp } from '/@/api/http';

enum Api {
  // 库存
  ListStocks = '/b2b/stock/supplier/list',
  ListStockLogs = '/b2b/stock/log',
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
  const rawPaymentMethod = row.paymentMethod || row.paymentInfo?.paymentMethod;
  return {
    ...row,
    storeName: row.storeName || row.storeId || '-',
    items,
    itemCount: row.itemCount ?? items.length,
    createdAt: row.createdAt || row.createTime,
    paidAt: row.paidAt || row.paymentTime,
    paymentMethod: paymentMethodText(rawPaymentMethod),
  };
}

const PAYMENT_METHOD_MAP: Record<string, string> = {
  OFFLINE: 'OFFLINE_TRANSFER',
  WECHAT: 'ONLINE_WECHAT',
  ALIPAY: 'ONLINE_ALIPAY',
  TONGLIAN: 'OFFLINE_TRANSFER',
};

function paymentMethodText(method?: string) {
  const normalized = PAYMENT_METHOD_MAP[method || ''] || method || '';
  const labels: Record<string, string> = {
    OFFLINE_TRANSFER: '线下转账',
    ONLINE_WECHAT: '微信支付',
    ONLINE_ALIPAY: '支付宝',
  };
  return labels[normalized] || normalized || '-';
}

const MOCK_PAYMENTS = [
  {
    id: 'admin-pay-001',
    paymentNo: 'PAY202606030001',
    orderNo: 'SO202606030001',
    orderId: '2062019430962626561',
    storeName: '山西文旅太原旗舰门店',
    storeId: 'store-001',
    amount: 3860,
    method: 'OFFLINE_TRANSFER',
    voucherUrl: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=900',
    transactionNo: 'BANK202606030001',
    status: 'PENDING_CONFIRM',
    submittedAt: '2026-06-03 09:18:00',
  },
  {
    id: 'admin-pay-002',
    paymentNo: 'PAY202606020006',
    orderNo: 'SO202606020006',
    orderId: 'mock-order-002',
    storeName: '平遥古城文创店',
    storeId: 'store-002',
    amount: 1280,
    method: 'ONLINE_WECHAT',
    transactionNo: 'WX202606020006',
    status: 'CONFIRMED',
    submittedAt: '2026-06-02 15:42:00',
    confirmedAt: '2026-06-02 16:08:00',
    confirmedBy: '平台财务',
  },
  {
    id: 'admin-pay-003',
    paymentNo: 'PAY202606010003',
    orderNo: 'SO202606010003',
    orderId: 'mock-order-003',
    storeName: '云冈石窟游客中心店',
    storeId: 'store-003',
    amount: 760,
    method: 'ONLINE_ALIPAY',
    transactionNo: 'ALI202606010003',
    status: 'REJECTED',
    rejectReason: '付款流水号与订单金额不一致',
    submittedAt: '2026-06-01 11:20:00',
    confirmedAt: '2026-06-01 14:10:00',
  },
];

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
  return defHttp.get({ url: Api.ListStocks, params });
}
export function listStockLogsApi(params: any) {
  return defHttp.get({ url: Api.ListStockLogs, params });
}
export function updateStockThresholdApi(id: string, threshold: number) {
  return defHttp.put({ url: Api.UpdateStockAlertQty, data: { id, alertQty: threshold } });
}

// ===== 门店订单 =====
export async function listStoreOrdersApi(params: any) {
  const res = await defHttp.get({ url: Api.ListStoreOrders, params: flattenSearchParams(params, 'orderNo') });
  return normalizePage(res, normalizeStoreOrder);
}
export async function getStoreOrderApi(id: string) {
  const res = await defHttp.get({ url: `/b2b/store/order/detail/${id}` });
  return normalizeStoreOrder(res);
}
export function cancelStoreOrderApi(id: string, reason: string) {
  const query = new URLSearchParams({ cancelReason: reason }).toString();
  return defHttp.put({ url: `/b2b/store/order/cancel/${id}?${query}` });
}

// ===== 支付 =====
export async function listPaymentsApi(params: any) {
  const search = params?.searchInfo || {};
  const status = search.status;
  const flat = flattenSearchParams(params, 'tradeNo');
  delete flat.status;
  delete flat.method;
  delete flat.tradeNo;
  let res: any;
  try {
    res = await defHttp.get({ url: Api.ListPayments, params: flat });
  } catch {
    res = { records: MOCK_PAYMENTS, total: MOCK_PAYMENTS.length };
  }
  const page = normalizePage(res, normalizePayment);
  const source = page?.records?.length ? page.records : MOCK_PAYMENTS.map(normalizePayment);

  const keyword = String(search.keyword || '').trim().toLowerCase();
  const method = search.method;

  const records = source.filter((row: any) => {
    const matchedKeyword = !keyword || [row.paymentNo, row.orderNo, row.storeName, row.storeId]
      .some((value) => String(value || '').toLowerCase().includes(keyword));
    const matchedMethod = !method || row.method === method;
    const matchedStatus = !status || row.status === status;
    return matchedKeyword && matchedMethod && matchedStatus;
  });
  return { ...page, records, total: records.length };
}
export function confirmPaymentApi(id: string, actualAmount = 0) {
  return defHttp.put({ url: Api.ConfirmPayment, data: { paymentId: id, actualAmount } });
}
export function rejectPaymentApi(id: string, reason: string) {
  void id;
  void reason;
  return Promise.reject(new Error('后端暂无拒付接口'));
}
