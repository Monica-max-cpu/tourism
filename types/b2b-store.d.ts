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

// ===== 平台采购目录（门店视角） =====
export interface StoreCatalogItem {
  id: string;
  productName: string;
  productImages?: string;
  categoryId?: string;
  unit: string;
  basePrice: number;
  minOrderQty?: number;
  status: 0 | 1 | 2;
  sortOrder?: number;
  description?: string;
  catalogTiers?: CatalogTier[];
}

export interface CatalogTier {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
}

// ===== 购物车 =====
export interface CartItem {
  catalogId: string;
  productName: string;
  unit: string;
  basePrice: number;
  qty: number;
  productImages?: string;
  minOrderQty?: number;
  catalogTiers?: CatalogTier[];
  addedAt: string;
}

// ===== 门店采购订单（门店视角） =====
/**
 * 门店订单状态（cm_b2b_store_order.order_status）
 *  0 待支付, 1 已支付待集采, 2 集采中, 3 发货中, 4 部分收货, 5 已完成, 6 已取消, 7 退款中, 8 已退款
 */
export type StoreOrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface StoreViewOrderItem {
  id?: string;
  catalogId?: string;
  productName: string;
  spec?: string;
  unit: string;
  quantity: number;
  /** 平台目录价 */
  catalogPrice: number;
  /** 实际成交价（阶梯价） */
  actualPrice: number;
  subtotal: number;
  receivedQty?: number;
  collectiveItemId?: string;
  imageUrl?: string;
}

export interface DeliveryInfo {
  deliveryNo: string;
  status: number;
  statusLabel: string;
  deliveryQty: number;
  logisticsCompany?: string;
  trackingNo?: string;
  shippedTime?: string;
}

export interface StoreViewOrder {
  id: string;
  orderNo: string;
  storeId: string;
  storeName?: string;
  /** 订单状态（0-8） */
  orderStatus: StoreOrderStatus;
  statusLabel?: string;
  items?: StoreViewOrderItem[];
  /** 订单总金额 */
  totalAmount: number;
  paidAmount?: number;
  paymentMethod?: string;
  paymentTime?: string;
  itemCount: number;
  /** 收货地址快照 */
  deliveryAddress?: {
    receiverName: string;
    receiverPhone: string;
    province?: string;
    city?: string;
    address: string;
  };
  /** 发货记录（详情接口返回） */
  deliveries?: DeliveryInfo[];
  remark?: string;
  createTime: string;
  expiredTime?: string;
  /** 驳回原因（支付被拒） */
  rejectReason?: string;
}

export interface StoreOrderCreateParams {
  storeId: string;
  deliveryAddress: {
    receiverName: string;
    receiverPhone: string;
    province?: string;
    city?: string;
    address: string;
  };
  remark?: string;
  items: { catalogId: string; quantity: number }[];
}

// ===== 门店付款记录（门店视角） =====
export type StorePaymentMethod = 'OFFLINE' | 'ONLINE_WECHAT' | 'ONLINE_ALIPAY';
/** 支付状态: 0=待支付, 1=支付成功, 2=支付失败, 3=已退款 */
export type StoreViewPaymentStatus = 0 | 1 | 2 | 3;

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
