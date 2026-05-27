/**
 * 阶段 4 - 门店端付款记录 Mock
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】付款字段对齐
 * - 状态改为数值 0-3
 * - 支付方式 OFFLINE_TRANSFER → OFFLINE
 * update-end--author:claude---date:2026-05-26---for:【阶段7】付款字段对齐
 */
import type {
  StorePaymentRecord,
  StoreViewPaymentStatus,
  StorePaymentMethod,
  SubmitPaymentParams,
} from '/#/b2b-store';
import { paginate, delay, randomId } from '../_helpers';
import { _markOrderPaid, __CURRENT_STORE_ID } from './order.mock';

const statuses: StoreViewPaymentStatus[] = [0, 1, 1, 2];
const methods: StorePaymentMethod[] = ['OFFLINE', 'ONLINE_WECHAT', 'ONLINE_ALIPAY'];

const payments: StorePaymentRecord[] = Array.from({ length: 28 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const method = methods[i % methods.length];
  const amount = +(500 + (i * 137) % 8500).toFixed(2);
  const day = String((i % 24) + 1).padStart(2, '0');
  return {
    id: `s-pay-${8000 + i}`,
    paymentNo: `PAY${String(20260500 + i).padStart(8, '0')}`,
    orderId: `s-ord-${6000 + i}`,
    orderNo: `OD${String(20260500 + i).padStart(8, '0')}`,
    storeId: __CURRENT_STORE_ID,
    amount,
    method,
    voucherUrl: method === 'OFFLINE' ? `https://placehold.co/600x400/eef2ff/4f46e5?text=Voucher+${i}` : undefined,
    transactionNo: method !== 'OFFLINE' ? `TXN${20260500000 + i}` : undefined,
    status,
    rejectReason: status === 2 ? '凭证金额与订单金额不一致，请重新上传' : undefined,
    submittedAt: `2026-05-${day} ${String(9 + (i % 10)).padStart(2, '0')}:30:00`,
    confirmedAt: status !== 0 ? `2026-05-${day} 15:00:00` : undefined,
  };
});

export function mockListStorePayments(params: any) {
  const sid = params.storeId;
  if (!sid) return delay({ records: [], total: 0 });
  let list = payments.filter((x) => x.storeId === sid);
  if (params.status !== undefined && params.status !== '') {
    list = list.filter((x) => x.status === Number(params.status));
  }
  if (params.method) list = list.filter((x) => x.method === params.method);
  if (params.keyword) {
    const k = params.keyword.toLowerCase();
    list = list.filter((x) => x.paymentNo.toLowerCase().includes(k) || x.orderNo.toLowerCase().includes(k));
  }
  list = [...list].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  return delay(paginate(list, params.pageNo, params.pageSize));
}

export function mockGetPaymentByOrder(orderId: string) {
  const list = payments.filter((x) => x.orderId === orderId && x.storeId === __CURRENT_STORE_ID);
  list.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  return delay(list[0] || null);
}

export function mockSubmitPayment(params: SubmitPaymentParams) {
  const id = randomId('s-pay-');
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const record: StorePaymentRecord = {
    id,
    paymentNo: `PAY${Date.now().toString().slice(-10)}`,
    orderId: params.orderId,
    orderNo: params.orderNo,
    storeId: __CURRENT_STORE_ID,
    amount: params.amount,
    method: params.method,
    voucherUrl: params.voucherUrl,
    transactionNo: params.transactionNo,
    status: 0,
    remark: params.remark,
    submittedAt: now,
  };
  payments.unshift(record);
  _markOrderPaid(params.orderId);
  return delay({ success: true, id, paymentNo: record.paymentNo });
}
