/**
 * 阶段 3 - 供应商端状态字典 + Badge variant 映射
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商端状态映射
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商端状态映射
 */
import type {
  SupplierProductStatus,
  SupplierQuoteStatus,
  SupplierOrderStatus,
  ShipmentStatus,
  SupplierStockHealth,
  SupplierSettlementStatus,
} from '/#/b2b-supplier';

// ===== 自营商品 =====
export const SUPPLIER_PRODUCT_STATUS_LABEL: Record<SupplierProductStatus, string> = {
  DRAFT: '草稿',
  ON_SHELF: '已上架',
  OFF_SHELF: '已下架',
};

export const SUPPLIER_PRODUCT_STATUS_VARIANT: Record<SupplierProductStatus, 'muted' | 'success' | 'warning'> = {
  DRAFT: 'muted',
  ON_SHELF: 'success',
  OFF_SHELF: 'warning',
};

export const SUPPLIER_PRODUCT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'DRAFT', label: '草稿' },
  { value: 'ON_SHELF', label: '已上架' },
  { value: 'OFF_SHELF', label: '已下架' },
];

// ===== 报价状态 =====
export const SUPPLIER_QUOTE_STATUS_LABEL: Record<SupplierQuoteStatus, string> = {
  DRAFT: '草稿',
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  EXPIRED: '已过期',
  OFF: '已下架',
};

export const SUPPLIER_QUOTE_STATUS_VARIANT: Record<SupplierQuoteStatus, 'muted' | 'warning' | 'success' | 'destructive' | 'info'> = {
  DRAFT: 'muted',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  EXPIRED: 'muted',
  OFF: 'info',
};

export const SUPPLIER_QUOTE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'DRAFT', label: '草稿' },
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'EXPIRED', label: '已过期' },
  { value: 'OFF', label: '已下架' },
];

// ===== 供应商集采单 =====
export const SUPPLIER_ORDER_STATUS_LABEL: Record<SupplierOrderStatus, string> = {
  TRIGGERED: '待确认',
  CONFIRMED: '待发货',
  SHIPPING: '配送中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export const SUPPLIER_ORDER_STATUS_VARIANT: Record<SupplierOrderStatus, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  TRIGGERED: 'warning',
  CONFIRMED: 'info',
  SHIPPING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'muted',
};

export const SUPPLIER_ORDER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'TRIGGERED', label: '待确认' },
  { value: 'CONFIRMED', label: '待发货' },
  { value: 'SHIPPING', label: '配送中' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

// ===== 发货状态 =====
export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  PENDING: '待发货',
  SHIPPED: '已发货',
  IN_TRANSIT: '运输中',
  DELIVERED: '已送达',
  EXCEPTION: '异常',
};

export const SHIPMENT_STATUS_VARIANT: Record<ShipmentStatus, 'warning' | 'info' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  SHIPPED: 'info',
  IN_TRANSIT: 'info',
  DELIVERED: 'success',
  EXCEPTION: 'destructive',
};

export const SHIPMENT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待发货' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'IN_TRANSIT', label: '运输中' },
  { value: 'DELIVERED', label: '已送达' },
  { value: 'EXCEPTION', label: '异常' },
];

// ===== 库存健康度 =====
export const SUPPLIER_STOCK_HEALTH_LABEL: Record<SupplierStockHealth, string> = {
  NORMAL: '正常',
  LOW: '不足',
  OUT: '缺货',
};

export const SUPPLIER_STOCK_HEALTH_VARIANT: Record<SupplierStockHealth, 'success' | 'warning' | 'destructive'> = {
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

// ===== 供应商结算 =====
export const SUPPLIER_SETTLEMENT_STATUS_LABEL: Record<SupplierSettlementStatus, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  PAID: '已收款',
};

export const SUPPLIER_SETTLEMENT_STATUS_VARIANT: Record<SupplierSettlementStatus, 'warning' | 'info' | 'success'> = {
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

// ===== 常用承运商（发货下拉）=====
export const CARRIER_OPTIONS = [
  { value: '顺丰速运', label: '顺丰速运' },
  { value: '京东物流', label: '京东物流' },
  { value: '德邦快递', label: '德邦快递' },
  { value: '中通快递', label: '中通快递' },
  { value: '圆通速递', label: '圆通速递' },
  { value: '韵达快递', label: '韵达快递' },
  { value: '邮政EMS', label: '邮政EMS' },
];
