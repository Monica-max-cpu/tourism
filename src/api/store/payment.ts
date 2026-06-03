/**
 * 阶段 4 - 门店付款 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款 API
 */
import { defHttp } from '/@/api/http';
import type { StorePaymentRecord, SubmitPaymentParams } from '/#/b2b-store';

enum Api {
  Submit = '/b2b/payment/create',
}

export function listStorePaymentsApi(params: any) {
  const records: StorePaymentRecord[] = [
    {
      id: 'mock-pay-001',
      paymentNo: 'PAY202606030001',
      orderId: '2062019430962626561',
      orderNo: 'SO202606030001',
      storeId: params?.storeId || 'mock-store',
      amount: 3860,
      method: 'OFFLINE',
      voucherUrl: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=900',
      transactionNo: 'BANK202606030001',
      status: 1,
      remark: '线下转账，平台已确认',
      submittedAt: '2026-06-03 09:18:00',
      confirmedAt: '2026-06-03 10:05:00',
    },
    {
      id: 'mock-pay-002',
      paymentNo: 'PAY202606020006',
      orderId: 'mock-order-002',
      orderNo: 'SO202606020006',
      storeId: params?.storeId || 'mock-store',
      amount: 1280,
      method: 'ONLINE_WECHAT',
      transactionNo: 'WX202606020006',
      status: 0,
      remark: '等待平台确认',
      submittedAt: '2026-06-02 15:42:00',
    },
    {
      id: 'mock-pay-003',
      paymentNo: 'PAY202606010003',
      orderId: 'mock-order-003',
      orderNo: 'SO202606010003',
      storeId: params?.storeId || 'mock-store',
      amount: 760,
      method: 'ONLINE_ALIPAY',
      transactionNo: 'ALI202606010003',
      status: 2,
      rejectReason: '付款流水号与订单金额不一致',
      submittedAt: '2026-06-01 11:20:00',
      confirmedAt: '2026-06-01 14:10:00',
    },
  ];
  const keyword = String(params?.keyword || '').trim().toLowerCase();
  const status = params?.status === '' || params?.status == null ? '' : Number(params.status);
  const method = params?.method || '';
  const filtered = records.filter((row) => {
    const matchedKeyword = !keyword || [row.paymentNo, row.orderNo].some((value) => value.toLowerCase().includes(keyword));
    const matchedStatus = status === '' || row.status === status;
    const matchedMethod = !method || row.method === method;
    return matchedKeyword && matchedStatus && matchedMethod;
  });
  return Promise.resolve({ records: filtered, total: filtered.length });
}
export function getPaymentByOrderApi(orderNo: string) {
  return defHttp.get({ url: `/b2b/payment/query/${orderNo}` });
}
export function submitPaymentApi(params: SubmitPaymentParams) {
  return defHttp.post({ url: Api.Submit, data: params });
}
