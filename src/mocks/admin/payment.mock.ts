/**
 * 支付管理 Mock（管理员确认收款）
 */
import type { PaymentRecord, PaymentStatus, PaymentMethod } from '/#/b2b-2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const statuses: PaymentStatus[] = ['PENDING_CONFIRM', 'PENDING_CONFIRM', 'CONFIRMED', 'REJECTED'];
const methods: PaymentMethod[] = ['OFFLINE_TRANSFER', 'ONLINE_WECHAT', 'ONLINE_ALIPAY'];

const payments: PaymentRecord[] = Array.from({ length: 52 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const method = methods[i % methods.length];
  const amount = +(500 + (i * 137) % 8500).toFixed(2);
  return {
    id: `pay-${8000 + i}`,
    paymentNo: `PAY${String(20260500 + i).padStart(8, '0')}`,
    orderNo: `OD${String(20260500 + i).padStart(8, '0')}`,
    orderId: `ord-${6000 + i}`,
    storeName: pick(MOCK_DATA.STORE_NAMES),
    amount,
    method,
    voucherUrl: method === 'OFFLINE_TRANSFER' ? `https://placehold.co/600x400/png?text=Voucher+${i}` : undefined,
    transactionNo: method !== 'OFFLINE_TRANSFER' ? `TXN${Date.now()}${i}` : undefined,
    status,
    rejectReason: status === 'REJECTED' ? '凭证金额与订单金额不符' : '',
    submittedAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(9 + (i % 10)).padStart(2, '0')}:30:00`,
    confirmedAt: status !== 'PENDING_CONFIRM' ? `2026-05-${String((i % 24) + 1).padStart(2, '0')} 15:00:00` : undefined,
    confirmedBy: status !== 'PENDING_CONFIRM' ? '平台管理员' : undefined,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string; method?: string };
}

export function mockListPayments({ pageNo, pageSize, searchInfo }: QueryParams) {
  let list = payments;
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.method) list = list.filter((x) => x.method === searchInfo.method);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.paymentNo.includes(k) || x.orderNo.includes(k) || x.storeName.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockConfirmPayment(id: string) {
  const item = payments.find((x) => x.id === id);
  if (item && item.status === 'PENDING_CONFIRM') {
    item.status = 'CONFIRMED';
    item.confirmedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    item.confirmedBy = '平台管理员';
  }
  return delay({ success: true });
}

export function mockRejectPayment(id: string, reason: string) {
  const item = payments.find((x) => x.id === id);
  if (item && item.status === 'PENDING_CONFIRM') {
    item.status = 'REJECTED';
    item.rejectReason = reason;
    item.confirmedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    item.confirmedBy = '平台管理员';
  }
  return delay({ success: true });
}
