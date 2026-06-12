/**
 * 阶段 4 - 门店付款 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款 API
 */
import { defHttp } from '/@/api/http';
import type { StorePaymentRecord, SubmitPaymentParams } from '/#/b2b-store';

enum Api {
  Submit = '/b2b/payment/create',
  List = '/b2b/payment/list',
}

export function listStorePaymentsApi(params: any) {
  const query = {
    pageNo: params?.pageNo || 1,
    pageSize: params?.pageSize || 10,
    storeId: params?.storeId,
    tradeNo: params?.keyword || undefined,
    paymentStatus: params?.status === '' || params?.status == null ? undefined : Number(params.status),
    paymentMethod: params?.method || undefined,
  };
  return defHttp.get({ url: Api.List, params: query }).then(normalizePaymentPage);
}
export function getPaymentByOrderApi(orderNo: string) {
  return defHttp.get({ url: `/b2b/payment/query/${orderNo}` }).then(normalizePaymentRecord);
}
export function submitPaymentApi(params: SubmitPaymentParams) {
  return defHttp.post({
    url: Api.Submit,
    data: {
      storeOrderId: params.orderId,
      paymentMethod: params.method,
      creditAccountId: params.creditAccountId,
    },
  }).then(normalizePaymentRecord);
}

function normalizePaymentRecord(input: any): StorePaymentRecord {
  const row = input?.result || input;
  return {
    id: row?.id || row?.paymentId,
    paymentNo: row?.paymentNo || row?.tradeNo || row?.paymentId || row?.id,
    orderId: row?.orderId || row?.storeOrderId,
    orderNo: row?.orderNo || row?.tradeNo,
    storeId: row?.storeId,
    amount: Number(row?.amount ?? row?.paymentAmount ?? row?.actualAmount ?? 0),
    method: (row?.method || row?.paymentMethod || '') as StorePaymentRecord['method'],
    transactionNo: row?.transactionNo || row?.channelTradeNo || row?.thirdTradeNo,
    status: Number(row?.status ?? row?.paymentStatus ?? 0) as StorePaymentRecord['status'],
    remark: row?.remark,
    rejectReason: row?.rejectReason,
    submittedAt: row?.submittedAt || row?.createTime || '',
    confirmedAt: row?.confirmedAt || row?.paidTime,
  };
}

function normalizePaymentPage(input: any): { records: StorePaymentRecord[]; total: number } {
  const page = input?.result || input;
  const records = Array.isArray(page?.records)
    ? page.records.map((item: any) => normalizePaymentRecord(item))
    : [];
  return {
    records,
    total: Number(page?.total ?? records.length),
  };
}
