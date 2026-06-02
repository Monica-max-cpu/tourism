/**
 * 阶段 2C 状态字典
 */
import type { SettlementStatus } from '/#/b2b-2c';

// 集采
export const COLLECTIVE_STATUS_LABEL: Record<string, string> = {
  PENDING: '待触发',
  TRIGGERED: '已触发',
  CONFIRMED: '已确认',
  SHIPPING: '配送中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};
export const COLLECTIVE_STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  PENDING: 'warning',
  TRIGGERED: 'info',
  CONFIRMED: 'info',
  SHIPPING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'muted',
};
export const COLLECTIVE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'TRIGGERED', label: '已触发' },
  { value: 'CONFIRMED', label: '已确认' },
  { value: 'SHIPPING', label: '配送中' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

// 履约
export const DELIVERY_STATUS_LABEL: Record<string, string> = {
  PENDING: '待发货',
  SHIPPED: '已发货',
  IN_TRANSIT: '运输中',
  DELIVERED: '已送达',
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
  { value: 'DELIVERED', label: '已送达' },
  { value: 'EXCEPTION', label: '异常' },
];

// 结算
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
