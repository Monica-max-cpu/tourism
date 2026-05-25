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
  productSku: string;
  productName: string;
  category: string;
  unit: string;
  /** 库存归属 */
  ownerType: StockOwnerType;
  /** 归属方名称（供应商名/门店名/平台仓） */
  ownerName: string;
  ownerId?: string;
  /** 仓库名称 */
  warehouseName?: string;
  /** 可用库存 */
  availableQty: number;
  /** 锁定库存（已下单未发货） */
  lockedQty: number;
  /** 预警阈值 */
  warnThreshold: number;
  /** 健康状态 */
  health: StockHealthLevel;
  updatedAt: string;
}

// ===== 门店采购订单 =====
export type OrderStatus =
  | 'PENDING_PAY' // 待支付
  | 'PAID' // 已支付，待平台确认收款
  | 'CONFIRMED' // 已确认收款，待集采/发货
  | 'SHIPPING' // 配送中
  | 'COMPLETED' // 已完成
  | 'CANCELLED'; // 已取消

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
  status: OrderStatus;
  items: StoreOrderItem[];
  /** 订单总金额（按销售价） */
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  paidAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  completedAt?: string;
  /** 关联的集采单 ID（如已触发） */
  collectiveOrderId?: string;
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
