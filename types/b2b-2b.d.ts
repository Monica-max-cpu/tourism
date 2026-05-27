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

// ===== 门店采购订单 =====
export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface StoreOrderItem {
  productSku: string;
  productName: string;
  unit: string;
  qty: number;
  /** 销售价（门店看到的价格） */
  unitPrice: number;
  /** 行小计 */
  subtotal: number;
}

export interface StoreOrder {
  id: string;
  orderNo: string;
  storeId: string;
  storeName: string;
  orderStatus: OrderStatus;
  statusLabel?: string;
  items: StoreOrderItem[];
  /** 订单总金额（按销售价） */
  totalAmount: number;
  itemCount: number;
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
}

// ===== 支付管理 =====
export type PaymentMethod = 'OFFLINE_TRANSFER' | 'ONLINE_WECHAT' | 'ONLINE_ALIPAY';
export type PaymentStatus = 'PENDING_CONFIRM' | 'CONFIRMED' | 'REJECTED';

export interface PaymentRecord {
  id: string;
  paymentNo: string;
  orderNo: string;
  orderId: string;
  storeName: string;
  /** 申报金额（应收） */
  amount: number;
  /** 支付方式 */
  method: PaymentMethod;
  /** 凭证图片 URL（线下转账） */
  voucherUrl?: string;
  /** 第三方流水号 */
  transactionNo?: string;
  status: PaymentStatus;
  remark?: string;
  rejectReason?: string;
  submittedAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}
