/**
 * 阶段 4 - 门店端业务类型
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端类型
 * 价格隔离原则：
 *  - 门店仅可见 salePrice（销售价）
 *  - 不出现 costPrice / supplierName / supplierId / profit / 任何成本与毛利字段
 *  - 商品目录是抽象 SKU 聚合视图，背后供应商对门店不可见
 *  - 列表查询统一带 storeId = currentUser.storeId 强制过滤（自有订单/支付）
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端类型
 */

// ===== 平台采购目录（门店视角，抽象 SKU + salePrice） =====
export interface StoreCatalogItem {
  /** 商品目录 ID */
  id: string;
  productSku: string;
  productName: string;
  category: string;
  unit: string;
  /** 销售价（门店唯一可见价格） */
  salePrice: number;
  /** 平台库存可售数量（不暴露具体仓） */
  availableQty: number;
  /** 起订量 */
  minQty: number;
  cover?: string;
  description?: string;
  /** 是否为热销 / 推荐 */
  hot?: boolean;
  createdAt: string;
}

// ===== 购物车 =====
export interface CartItem {
  catalogId: string;
  productSku: string;
  productName: string;
  unit: string;
  salePrice: number;
  qty: number;
  cover?: string;
  /** 加入购物车时刻的可售数量（用于校验） */
  availableQty?: number;
  /** 起订量 */
  minQty?: number;
  /** 加入时间 */
  addedAt: string;
}

// ===== 门店采购订单（门店视角） =====
/**
 * 门店视角订单状态
 *  - PENDING_PAYMENT  待支付
 *  - PENDING_CONFIRM  已支付，待平台确认收款
 *  - CONFIRMED        平台已确认，备货/集采中
 *  - SHIPPING         配送中
 *  - DELIVERED        已送达，待门店签收
 *  - COMPLETED        已完成
 *  - CANCELLED        已取消
 */
export type StoreViewOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_CONFIRM'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface StoreViewOrderItem {
  productSku: string;
  productName: string;
  unit: string;
  qty: number;
  /** 销售价（门店看到的价格） */
  unitPrice: number;
  subtotal: number;
  cover?: string;
}

export interface StoreViewOrder {
  id: string;
  orderNo: string;
  storeId: string;
  status: StoreViewOrderStatus;
  items: StoreViewOrderItem[];
  /** 订单总金额（按销售价） */
  totalAmount: number;
  itemCount: number;
  /** 收货地址（默认从门店资料带出） */
  receiveAddress?: string;
  receiver?: string;
  receiverPhone?: string;
  /** 物流信息（CONFIRMED → SHIPPING 时由平台/供应商写入） */
  carrier?: string;
  trackingNo?: string;
  remark?: string;
  createdAt: string;
  paidAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  /** 驳回原因（支付被拒） */
  rejectReason?: string;
}

export interface StoreOrderCreateParams {
  items: { catalogId: string; productSku: string; productName: string; unit: string; unitPrice: number; qty: number; cover?: string }[];
  receiveAddress?: string;
  receiver?: string;
  receiverPhone?: string;
  remark?: string;
}

// ===== 门店付款记录（门店视角） =====
export type StorePaymentMethod = 'OFFLINE_TRANSFER' | 'ONLINE_WECHAT' | 'ONLINE_ALIPAY';
export type StoreViewPaymentStatus = 'PENDING_CONFIRM' | 'CONFIRMED' | 'REJECTED';

export interface StorePaymentRecord {
  id: string;
  paymentNo: string;
  orderId: string;
  orderNo: string;
  storeId: string;
  amount: number;
  method: StorePaymentMethod;
  /** 凭证图片（线下转账） */
  voucherUrl?: string;
  /** 第三方流水号（线上支付） */
  transactionNo?: string;
  status: StoreViewPaymentStatus;
  remark?: string;
  rejectReason?: string;
  submittedAt: string;
  confirmedAt?: string;
}

export interface SubmitPaymentParams {
  orderId: string;
  orderNo: string;
  amount: number;
  method: StorePaymentMethod;
  voucherUrl?: string;
  transactionNo?: string;
  remark?: string;
}

// ===== 销售上报 =====
export interface SalesReportRecord {
  id: string;
  reportNo: string;
  storeId: string;
  productSku: string;
  productName: string;
  unit: string;
  /** 上报销量 */
  qty: number;
  /** 上报销售额（门店实际成交） */
  amount: number;
  /** 上报日期（YYYY-MM-DD） */
  reportDate: string;
  remark?: string;
  createdAt: string;
}

export interface SalesReportCreateParams {
  productSku: string;
  productName: string;
  unit: string;
  qty: number;
  amount: number;
  reportDate: string;
  remark?: string;
}

// ===== 门店资料 =====
export interface StoreProfile {
  storeId: string;
  storeName: string;
  /** 门店类型：景区 / 连锁 / 独立 */
  storeType: 'SCENIC' | 'CHAIN' | 'INDEPENDENT';
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  /** 默认收货地址（下单时带出） */
  receiveAddress?: string;
  receiver?: string;
  receiverPhone?: string;
  description?: string;
  updatedAt: string;
}

// ===== 工作台聚合 =====
export interface StoreWorkbenchSummary {
  pendingPayment: number;
  pendingConfirm: number;
  shipping: number;
  delivered: number;
  completed30d: number;
  /** 30 天采购金额 */
  purchaseAmount30d: number;
  /** 30 天销售上报金额 */
  salesAmount30d: number;
}
