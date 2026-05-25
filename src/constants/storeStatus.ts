/**
 * 阶段 4 - 门店端状态字典 + Badge variant 映射
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端状态映射
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端状态映射
 */
import type {
  StoreViewOrderStatus,
  StoreViewPaymentStatus,
  StorePaymentMethod,
} from '/#/b2b-store';

// ===== 门店订单状态 =====
export const STORE_ORDER_STATUS_LABEL: Record<StoreViewOrderStatus, string> = {
  PENDING_PAYMENT: '待支付',
  PENDING_CONFIRM: '待确认收款',
  CONFIRMED: '备货中',
  SHIPPING: '配送中',
  DELIVERED: '待签收',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export const STORE_ORDER_STATUS_VARIANT: Record<
  StoreViewOrderStatus,
  'warning' | 'info' | 'success' | 'destructive' | 'muted'
> = {
  PENDING_PAYMENT: 'warning',
  PENDING_CONFIRM: 'warning',
  CONFIRMED: 'info',
  SHIPPING: 'info',
  DELIVERED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'muted',
};

export const STORE_ORDER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING_PAYMENT', label: '待支付' },
  { value: 'PENDING_CONFIRM', label: '待确认收款' },
  { value: 'CONFIRMED', label: '备货中' },
  { value: 'SHIPPING', label: '配送中' },
  { value: 'DELIVERED', label: '待签收' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
];

// ===== 门店付款状态 =====
export const STORE_PAYMENT_STATUS_LABEL: Record<StoreViewPaymentStatus, string> = {
  PENDING_CONFIRM: '待平台确认',
  CONFIRMED: '已确认',
  REJECTED: '已驳回',
};

export const STORE_PAYMENT_STATUS_VARIANT: Record<StoreViewPaymentStatus, 'warning' | 'success' | 'destructive'> = {
  PENDING_CONFIRM: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'destructive',
};

export const STORE_PAYMENT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING_CONFIRM', label: '待平台确认' },
  { value: 'CONFIRMED', label: '已确认' },
  { value: 'REJECTED', label: '已驳回' },
];

// ===== 支付方式 =====
export const STORE_PAYMENT_METHOD_LABEL: Record<StorePaymentMethod, string> = {
  OFFLINE_TRANSFER: '线下转账',
  ONLINE_WECHAT: '微信支付',
  ONLINE_ALIPAY: '支付宝',
};

export const STORE_PAYMENT_METHOD_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'OFFLINE_TRANSFER', label: '线下转账' },
  { value: 'ONLINE_WECHAT', label: '微信支付' },
  { value: 'ONLINE_ALIPAY', label: '支付宝' },
];

/** 收款账户信息（线下转账时展示给门店） */
export const PLATFORM_BANK_INFO = {
  bankName: '中国工商银行 - 上海分行营业部',
  accountName: '上海智采供应链有限公司',
  accountNo: '6222 0212 0010 0286 318',
  swiftCode: 'ICBKCNBJSHI',
  notice: '请使用对公账户转账，转账备注请填写「订单号」，便于平台快速核验。',
};

/** 商品分类（采购目录筛选） */
export const STORE_CATEGORY_OPTIONS = [
  { value: '', label: '全部分类' },
  { value: '生鲜', label: '生鲜' },
  { value: '乳制品', label: '乳制品' },
  { value: '调味品', label: '调味品' },
  { value: '饮品', label: '饮品' },
  { value: '海鲜', label: '海鲜' },
  { value: '菌菇', label: '菌菇' },
  { value: '水果', label: '水果' },
  { value: '冻品', label: '冻品' },
];

// ===== 门店类型 =====
export const STORE_TYPE_LABEL: Record<'SCENIC' | 'CHAIN' | 'INDEPENDENT', string> = {
  SCENIC: '景区门店',
  CHAIN: '连锁门店',
  INDEPENDENT: '独立门店',
};

export const STORE_TYPE_OPTIONS = [
  { value: 'SCENIC', label: '景区门店' },
  { value: 'CHAIN', label: '连锁门店' },
  { value: 'INDEPENDENT', label: '独立门店' },
];
