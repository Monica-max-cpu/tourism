export const SUPPLIER_PRODUCT_STATUS_LABEL: Record<number, string> = {
  0: '停用',
  1: '启用',
};

export const SUPPLIER_PRODUCT_STATUS_VARIANT: Record<number, 'muted' | 'success'> = {
  0: 'muted',
  1: 'success',
};

export const SUPPLIER_PRODUCT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '1', label: '启用' },
  { value: '0', label: '停用' },
];

export const SUPPLIER_QUOTE_STATUS_LABEL: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已驳回',
  3: '已下架',
};

export const SUPPLIER_QUOTE_STATUS_VARIANT: Record<number, 'warning' | 'success' | 'destructive' | 'info'> = {
  0: 'warning',
  1: 'success',
  2: 'destructive',
  3: 'info',
};

export const SUPPLIER_QUOTE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待审核' },
  { value: 1, label: '已通过' },
  { value: 2, label: '已驳回' },
  { value: 3, label: '已下架' },
];

export const SUPPLIER_ORDER_STATUS_LABEL: Record<number | string, string> = {
  0: '待接单',
  1: '已接单',
  2: '发货中',
  3: '已完成',
  4: '已取消',
  5: '异常',
  6: '超时',
  TRIGGERED: '待接单',
  CONFIRMED: '已接单',
  SHIPPING: '发货中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export const SUPPLIER_ORDER_STATUS_VARIANT: Record<number | string, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  0: 'warning',
  1: 'info',
  2: 'info',
  3: 'success',
  4: 'muted',
  5: 'destructive',
  6: 'destructive',
  TRIGGERED: 'warning',
  CONFIRMED: 'info',
  SHIPPING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'muted',
};

export const SUPPLIER_ORDER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待接单' },
  { value: 1, label: '已接单' },
  { value: 2, label: '发货中' },
  { value: 3, label: '已完成' },
  { value: 4, label: '已取消' },
  { value: 5, label: '异常' },
  { value: 6, label: '超时' },
];

export const SHIPMENT_STATUS_LABEL: Record<number | string, string> = {
  0: '待发货',
  1: '已发货',
  2: '已收货',
  3: '异常',
  PENDING: '待发货',
  SHIPPED: '已发货',
  IN_TRANSIT: '运输中',
  DELIVERED: '已收货',
  EXCEPTION: '异常',
};

export const SHIPMENT_STATUS_VARIANT: Record<number | string, 'warning' | 'info' | 'success' | 'destructive'> = {
  0: 'warning',
  1: 'info',
  2: 'success',
  3: 'destructive',
  PENDING: 'warning',
  SHIPPED: 'info',
  IN_TRANSIT: 'info',
  DELIVERED: 'success',
  EXCEPTION: 'destructive',
};

export const SHIPMENT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待发货' },
  { value: 1, label: '已发货' },
  { value: 2, label: '已收货' },
  { value: 3, label: '异常' },
];

export const SUPPLIER_STOCK_HEALTH_LABEL: Record<string, string> = {
  NORMAL: '正常',
  LOW: '不足',
  OUT: '缺货',
};

export const SUPPLIER_STOCK_HEALTH_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  NORMAL: 'success',
  LOW: 'warning',
  OUT: 'destructive',
};

export const SUPPLIER_STOCK_HEALTH_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'NORMAL', label: '正常' },
  { value: 'LOW', label: '不足' },
  { value: 'OUT', label: '缺货' },
];

export const SUPPLIER_SETTLEMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  PAID: '已收款',
};

export const SUPPLIER_SETTLEMENT_STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PAID: 'success',
};

export const SUPPLIER_SETTLEMENT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待确认' },
  { value: 'CONFIRMED', label: '已确认' },
  { value: 'PAID', label: '已收款' },
];

export const CARRIER_OPTIONS = [
  { value: '顺丰速运', label: '顺丰速运' },
  { value: '京东物流', label: '京东物流' },
  { value: '德邦快递', label: '德邦快递' },
  { value: '中通快递', label: '中通快递' },
  { value: '圆通速递', label: '圆通速递' },
  { value: '韵达快递', label: '韵达快递' },
  { value: '邮政EMS', label: '邮政EMS' },
];
