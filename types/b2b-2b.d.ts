/**
 * 阶段 2B 业务类型
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2B】库存/订单/支付类型
 * - 价格字段严格区分：salePrice 给门店端、costPrice 仅管理员/供应商
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2B】库存/订单/支付类型
 */

// ===== 库存 =====
export type StockOwnerType = 'PLATFORM' | 'SUPPLIER' | 'STORE';
export type StockHealthLevel = 'NORMAL' | 'LOW' | 'OUT';

export interface StockRecord {
  id: string;
  supplierId: string;
  supplierName?: string;
  productId: string;
  productName: string;
  /** 预警阈值 */
  alertQty: number;
  /** 可用库存 */
  availableQty: number;
  /** 锁定库存 */
  lockedQty: number;
  /** 总库存 */
  totalQty: number;
  warehouseId?: string;
  /** 健康状态（前端根据 availableQty/alertQty 计算） */
  health?: StockHealthLevel;
  lastReplenishTime?: string;
  createTime?: string;
  updateTime?: string;
}

export interface StockLogRecord {
  id: string;
  stockId?: string;
  supplierId?: string;
  supplierName?: string;
  productId?: string;
  productName?: string;
  warehouseId?: string;
  warehouseName?: string;
  changeType?: string;
  changeQty?: number;
  beforeAvailableQty?: number;
  afterAvailableQty?: number;
  relatedNo?: string;
  relatedType?: string;
  remark?: string;
  createTime?: string;
  time?: string;
}

// ===== 门店采购订单 =====
export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface StoreOrderItem {
  id?: string;
  catalogId?: string;
  productSku?: string;
  productName: string;
  spec?: string;
  unit: string;
  qty?: number;
  quantity?: number;
  /** 销售价（门店看到的价格） */
  unitPrice?: number;
  catalogPrice?: number;
  actualPrice?: number;
  /** 行小计 */
  subtotal: number;
  receivedQty?: number;
}

export interface StoreOrder {
  id: string;
  orderNo: string;
  storeId: string;
  storeName?: string;
  orderStatus: OrderStatus;
  statusLabel?: string;
  items: StoreOrderItem[];
  /** 订单总金额（按销售价） */
  totalAmount: number;
  paidAmount?: number;
  paymentMethod?: string;
  paymentTime?: string;
  deliveryAddress?: string;
  itemCount?: number;
  createdAt: string;
  paidAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  completedAt?: string;
  /** 关联的集采单 ID */
  collectiveOrderId?: string;
  collectiveNo?: string;
  supplierName?: string;
  remark?: string;
  expiredTime?: string;
  paymentInfo?: {
    paymentId: string;
    paymentAmount: number;
    paymentStatus: number;
    paymentMethod?: string;
  };
}

// ===== 支付管理 =====
export type PaymentMethod = 'UNIONPAY' | 'BANK_CREDIT';
export type PaymentStatus = 'WAIT_PAY' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface PaymentRecord {
  id: string;
  paymentNo: string;
  orderNo: string;
  orderId: string;
  storeName: string;
  /** 应付金额 */
  amount: number;
  /** 支付方式 */
  method: PaymentMethod;
  /** 渠道流水号 */
  transactionNo?: string;
  status: PaymentStatus;
  remark?: string;
  rejectReason?: string;
  submittedAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}
