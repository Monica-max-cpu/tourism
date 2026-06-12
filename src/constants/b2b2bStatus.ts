import type { OrderStatus, PaymentMethod, PaymentStatus, StockOwnerType } from '/#/b2b-2b';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  0: '待支付',
  1: '已支付待集采',
  2: '集采中',
  3: '发货中',
  4: '部分收货',
  5: '已完成',
  6: '已取消',
  7: '退款中',
  8: '已退款',
};

export const ORDER_STATUS_VARIANT: Record<OrderStatus, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  0: 'warning',
  1: 'warning',
  2: 'info',
  3: 'info',
  4: 'info',
  5: 'success',
  6: 'muted',
  7: 'warning',
  8: 'destructive',
};

export const ORDER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待支付' },
  { value: 1, label: '已支付待集采' },
  { value: 2, label: '集采中' },
  { value: 3, label: '发货中' },
  { value: 4, label: '部分收货' },
  { value: 5, label: '已完成' },
  { value: 6, label: '已取消' },
  { value: 7, label: '退款中' },
  { value: 8, label: '已退款' },
];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  WAIT_PAY: '待支付',
  PAID: '支付成功',
  FAILED: '支付失败',
  REFUNDED: '已退款',
};

export const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, 'warning' | 'success' | 'destructive' | 'info'> = {
  WAIT_PAY: 'warning',
  PAID: 'success',
  FAILED: 'destructive',
  REFUNDED: 'info',
};

export const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'WAIT_PAY', label: '待支付' },
  { value: 'PAID', label: '支付成功' },
  { value: 'FAILED', label: '支付失败' },
  { value: 'REFUNDED', label: '已退款' },
];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  UNIONPAY: '银联在线支付',
  BANK_CREDIT: '授信支付',
};

export const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'UNIONPAY', label: '银联在线支付' },
  { value: 'BANK_CREDIT', label: '授信支付' },
];

export function paymentMethodLabel(method?: string) {
  return PAYMENT_METHOD_LABEL[method as PaymentMethod] || method || '-';
}

export const STOCK_HEALTH_LABEL: Record<string, string> = {
  NORMAL: '正常',
  LOW: '不足',
  OUT: '缺货',
};

export const STOCK_HEALTH_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  NORMAL: 'success',
  LOW: 'warning',
  OUT: 'destructive',
};

export const STOCK_HEALTH_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'NORMAL', label: '正常' },
  { value: 'LOW', label: '不足' },
  { value: 'OUT', label: '缺货' },
];

export const STOCK_OWNER_LABEL: Record<StockOwnerType, string> = {
  PLATFORM: '平台库存',
  SUPPLIER: '供应商',
  STORE: '门店',
};

export const STOCK_OWNER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PLATFORM', label: '平台库存' },
  { value: 'SUPPLIER', label: '供应商' },
  { value: 'STORE', label: '门店' },
];
