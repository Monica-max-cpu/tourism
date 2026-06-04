/**
 * 阶段 4 - 门店端状态字典 + Badge variant 映射
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端状态映射
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端状态映射
 */
import type {
  StorePaymentMethod,
} from '/#/b2b-store';

// ===== 门店订单状态 =====
export const STORE_ORDER_STATUS_LABEL: Record<number, string> = {
  0: '待支付',
  1: '已支付，待集采',
  2: '集采中',
  3: '发货中',
  4: '部分收货',
  5: '已完成',
  6: '已取消',
  7: '退款中',
  8: '已退款',
};

export const STORE_ORDER_STATUS_VARIANT: Record<
  number,
  'warning' | 'info' | 'success' | 'destructive' | 'muted'
> = {
  0: 'warning',
  1: 'warning',
  2: 'info',
  3: 'info',
  4: 'info',
  5: 'success',
  6: 'muted',
  7: 'warning',
  8: 'destructive',
};

export const STORE_ORDER_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待支付' },
  { value: 1, label: '已支付，待集采' },
  { value: 2, label: '集采中' },
  { value: 3, label: '发货中' },
  { value: 4, label: '部分收货' },
  { value: 5, label: '已完成' },
  { value: 6, label: '已取消' },
  { value: 7, label: '退款中' },
  { value: 8, label: '已退款' },
];

// ===== 门店付款状态 =====
export const STORE_PAYMENT_STATUS_LABEL: Record<number, string> = {
  0: '待支付',
  1: '支付成功',
  2: '支付失败',
  3: '已退款',
};

export const STORE_PAYMENT_STATUS_VARIANT: Record<number, 'warning' | 'success' | 'destructive' | 'info'> = {
  0: 'warning',
  1: 'success',
  2: 'destructive',
  3: 'info',
};

export const STORE_PAYMENT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待支付' },
  { value: 1, label: '支付成功' },
  { value: 2, label: '支付失败' },
  { value: 3, label: '已退款' },
];

// ===== 支付方式 =====
export const STORE_PAYMENT_METHOD_LABEL: Record<StorePaymentMethod, string> = {
  OFFLINE: '线下转账',
  ONLINE_WECHAT: '微信支付',
  ONLINE_ALIPAY: '支付宝',
};

export const STORE_PAYMENT_METHOD_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'OFFLINE', label: '线下转账' },
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
  { value: 'cat_001', label: '生鲜' },
  { value: 'cat_002', label: '乳制品' },
  { value: 'cat_003', label: '调味料' },
  { value: 'cat_004', label: '饮品' },
  { value: 'cat_005', label: '海鲜' },
  { value: 'cat_006', label: '菌菇' },
  { value: 'cat_007', label: '水果' },
  { value: 'cat_008', label: '冻品' },
  { value: 'GIFT', label: '文创礼品' },
  { value: 'FOOD', label: '食品' },
  { value: '生鲜', label: '生鲜' },
  { value: '乳制品', label: '乳制品' },
  { value: '调味品', label: '调味品' },
  { value: '饮品', label: '饮品' },
  { value: '海鲜', label: '海鲜' },
  { value: '菌菇', label: '菌菇' },
  { value: '水果', label: '水果' },
  { value: '冻品', label: '冻品' },
];

export function storeCategoryLabel(categoryId?: string) {
  return STORE_CATEGORY_OPTIONS.find((item) => item.value === categoryId)?.label || categoryId || '-';
}

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
