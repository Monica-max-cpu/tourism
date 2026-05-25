/**
 * 阶段 2B 状态字典
 */
import type { OrderStatus, PaymentStatus, PaymentMethod, StockHealthLevel, StockOwnerType } from '/#/b2b-2b';

// ===== 订单状态 =====
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAY: '待支付',
  PAID: '已支付',
  CONFIRMED: '已确认',
  SHIPPING: '配送中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export const ORDER_STATUS_VARIANT: Record<OrderStatus, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  PENDING_PAY: 'warning',
  PAID: 'info',
  CONFIRMED: 'info',
  SHIPPING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'muted',
};

export const ORDER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING_PAY', label: '待支付' },
  { value: 'PAID', label: '已支付' },
  { value: 'CONFIRMED', label: '已确认' },
  { value: 'SHIPPING', label: '配送中' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

// ===== 支付状态 =====
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING_CONFIRM: '待确认',
  CONFIRMED: '已确认',
  REJECTED: '已驳回',
};

export const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, 'warning' | 'success' | 'destructive'> = {
  PENDING_CONFIRM: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'destructive',
};

export const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING_CONFIRM', label: '待确认' },
  { value: 'CONFIRMED', label: '已确认' },
  { value: 'REJECTED', label: '已驳回' },
];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  OFFLINE_TRANSFER: '线下转账',
  ONLINE_WECHAT: '微信支付',
  ONLINE_ALIPAY: '支付宝',
};

// ===== 库存 =====
export const STOCK_HEALTH_LABEL: Record<StockHealthLevel, string> = {
  NORMAL: '正常',
  LOW: '不足',
  OUT: '缺货',
};

export const STOCK_HEALTH_VARIANT: Record<StockHealthLevel, 'success' | 'warning' | 'destructive'> = {
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
  PLATFORM: '平台仓',
  SUPPLIER: '供应商',
  STORE: '门店',
};

export const STOCK_OWNER_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PLATFORM', label: '平台仓' },
  { value: 'SUPPLIER', label: '供应商' },
  { value: 'STORE', label: '门店' },
];
