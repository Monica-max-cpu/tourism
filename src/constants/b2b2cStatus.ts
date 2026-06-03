import type { SettlementStatus } from '/#/b2b-2c';

export const COLLECTIVE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待触发',
  TRIGGERED: '待接单',
  CONFIRMED: '已接单',
  SHIPPING: '发货中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export const COLLECTIVE_STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  PENDING: 'warning',
  TRIGGERED: 'warning',
  CONFIRMED: 'info',
  SHIPPING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'muted',
};

export const COLLECTIVE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'TRIGGERED', label: '待接单' },
  { value: 'CONFIRMED', label: '已接单' },
  { value: 'SHIPPING', label: '发货中' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

export const COLLECTIVE_ORDER_STATUS_LABEL: Record<number, string> = {
  0: '待接单',
  1: '已接单',
  2: '发货中',
  3: '已完成',
  4: '已取消',
  5: '异常',
  6: '超时',
};

export const COLLECTIVE_ORDER_STATUS_VARIANT: Record<number, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  0: 'warning',
  1: 'info',
  2: 'info',
  3: 'success',
  4: 'muted',
  5: 'destructive',
  6: 'destructive',
};

export const COLLECTIVE_ORDER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待接单' },
  { value: 1, label: '已接单' },
  { value: 2, label: '发货中' },
  { value: 3, label: '已完成' },
  { value: 4, label: '已取消' },
  { value: 5, label: '异常' },
  { value: 6, label: '超时' },
];

export const DELIVERY_RECORD_STATUS_LABEL: Record<number, string> = {
  0: '待发货',
  1: '已发货',
  2: '已收货',
  3: '异常',
};

export const DELIVERY_RECORD_STATUS_VARIANT: Record<number, 'warning' | 'info' | 'success' | 'destructive'> = {
  0: 'warning',
  1: 'info',
  2: 'success',
  3: 'destructive',
};

export const DELIVERY_RECORD_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待发货' },
  { value: 1, label: '已发货' },
  { value: 2, label: '已收货' },
  { value: 3, label: '异常' },
];

export const DELIVERY_STATUS_LABEL: Record<string, string> = {
  PENDING: '待发货',
  SHIPPED: '已发货',
  IN_TRANSIT: '运输中',
  DELIVERED: '已收货',
  EXCEPTION: '异常',
};

export const DELIVERY_STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  SHIPPED: 'info',
  IN_TRANSIT: 'info',
  DELIVERED: 'success',
  EXCEPTION: 'destructive',
};

export const DELIVERY_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待发货' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'IN_TRANSIT', label: '运输中' },
  { value: 'DELIVERED', label: '已收货' },
  { value: 'EXCEPTION', label: '异常' },
];

export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  PENDING: '待付款',
  CONFIRMED: '已确认',
  PAID: '已付款',
  REFUNDED: '已退款',
};

export const SETTLEMENT_STATUS_VARIANT: Record<SettlementStatus, 'warning' | 'info' | 'success' | 'muted'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PAID: 'success',
  REFUNDED: 'muted',
};

export const SETTLEMENT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待付款' },
  { value: 'CONFIRMED', label: '已确认' },
  { value: 'PAID', label: '已付款' },
  { value: 'REFUNDED', label: '已退款' },
];

export const COLLECTIVE_TRIGGER_TYPE_LABEL: Record<string, string> = {
  AUTO: '自动触发',
  MANUAL: '手动触发',
  BY_CATALOG: '按商品触发',
  BY_ORDERS: '按订单触发',
  THRESHOLD: '阈值触发',
  TIMEOUT: '超时触发',
};

export function collectiveTriggerTypeLabel(type?: string) {
  return COLLECTIVE_TRIGGER_TYPE_LABEL[type || ''] || type || '-';
}

export function deliveryModeLabel(mode?: number) {
  return mode === 2 ? '平台云仓' : '供应商直发门店';
}
