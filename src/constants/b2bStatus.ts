/**
 * B2B 状态字典 + Badge variant 映射 — 对齐 b2b-api-contract.md v1.0
 * status: 0=待审核 1=已通过 2=已拒绝 3=已停用
 */
import type { ApplyStatus, QuoteStatus, StoreType, ReviewStatus, OperationStatus, SupplierStoreType, BindStatus } from '/#/b2b';

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  0: '待审核',
  1: '审核通过',
  2: '审核拒绝',
};

export const REVIEW_STATUS_VARIANT: Record<ReviewStatus, 'warning' | 'success' | 'destructive'> = {
  0: 'warning',
  1: 'success',
  2: 'destructive',
};

export const REVIEW_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '0', label: '待审核' },
  { value: '1', label: '审核通过' },
  { value: '2', label: '审核拒绝' },
];

export const OPERATION_STATUS_LABEL: Record<number, string> = {
  0: '待启用',
  1: '启用',
  2: '停用',
};

export const OPERATION_STATUS_VARIANT: Record<number, 'warning' | 'success' | 'muted'> = {
  0: 'warning',
  1: 'success',
  2: 'muted',
};

export const OPERATION_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '0', label: '待启用' },
  { value: '1', label: '启用' },
  { value: '2', label: '停用' },
];

export const BIND_STATUS_LABEL: Record<BindStatus, string> = {
  0: '待审核',
  1: '已绑定',
  2: '已解绑',
};

export const AUTH_TYPE_LABEL: Record<string, string> = {
  SUPPLIER: '供应商',
  MERCHANT: '商户',
  PERSONAL: '个人',
};

export const SUPPLIER_STORE_TYPE_LABEL: Record<SupplierStoreType, string> = {
  1: '普通',
  2: '自营',
  3: '文旅优选',
};

export const SUPPLIER_STORE_TYPE_OPTIONS = [
  { value: '1', label: '普通' },
  { value: '2', label: '自营' },
  { value: '3', label: '文旅优选' },
];

export function normalizeReviewStatus(row: { reviewStatus?: ReviewStatus; status?: ApplyStatus | number }): ReviewStatus {
  if (row.reviewStatus !== undefined) return row.reviewStatus;
  return row.status === 2 ? 2 : row.status === 1 || row.status === 3 ? 1 : 0;
}

export function normalizeOperationStatus(row: { operationStatus?: OperationStatus; status?: ApplyStatus | number }): OperationStatus {
  if (row.operationStatus !== undefined) return row.operationStatus;
  return row.status === 3 ? 2 : row.status === 1 ? 1 : 0;
}

export function isPendingReview(status: ReviewStatus | number): boolean {
  return status === 0;
}

export function isReviewApproved(status: ReviewStatus | number): boolean {
  return status === 1;
}

export function isOperationEnabled(status: OperationStatus | number): boolean {
  return status === 1;
}

export function isOperationDisabled(status: OperationStatus | number): boolean {
  return status === 0 || status === 2;
}

// ===== 入驻审核状态 =====
export const APPLY_STATUS_LABEL: Record<ApplyStatus, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
  3: '已停用',
};

export const APPLY_STATUS_VARIANT: Record<ApplyStatus, 'warning' | 'success' | 'destructive' | 'muted'> = {
  0: 'warning',
  1: 'success',
  2: 'destructive',
  3: 'muted',
};

export const APPLY_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '0', label: '待审核' },
  { value: '1', label: '已通过' },
  { value: '2', label: '已拒绝' },
  { value: '3', label: '已停用' },
];

/** 判断是否可审核（待审核状态） */
export function isPendingStatus(status: ApplyStatus | number): boolean {
  return status === 0;
}
/** 判断是否已通过（可停用） */
export function isApprovedStatus(status: ApplyStatus | number): boolean {
  return status === 1;
}
/** 判断是否已停用（可启用） */
export function isDisabledStatus(status: ApplyStatus | number): boolean {
  return status === 3;
}

// ===== 报价单状态 =====
export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  0: '待平台审核',
  1: '已生效',
  2: '已过期',
  3: '已撤回',
};

export const QUOTE_STATUS_VARIANT: Record<QuoteStatus, 'warning' | 'success' | 'destructive' | 'muted'> = {
  0: 'warning',
  1: 'success',
  2: 'muted',
  3: 'destructive',
};

export const QUOTE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '0', label: '待平台审核' },
  { value: '1', label: '已生效' },
  { value: '2', label: '已过期' },
  { value: '3', label: '已撤回' },
];

// ===== 目录状态 =====
export const CATALOG_STATUS_LABEL: Record<number, string> = {
  0: '已下架',
  1: '已上架',
  2: '已售罄',
};

export const CATALOG_STATUS_VARIANT: Record<number, 'success' | 'warning' | 'muted'> = {
  0: 'muted',
  1: 'success',
  2: 'warning',
};

export const CATALOG_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '1', label: '已上架' },
  { value: '0', label: '已下架' },
  { value: '2', label: '已售罄' },
];

// ===== 门店类型 =====
export const STORE_TYPE_LABEL: Record<StoreType, string> = {
  1: '普通',
  2: '自营',
  3: '文旅优选',
};

export const STORE_TYPE_OPTIONS = [
  { value: '', label: '全部' },
  { value: '1', label: '普通' },
  { value: '2', label: '自营' },
  { value: '3', label: '文旅优选' },
];
