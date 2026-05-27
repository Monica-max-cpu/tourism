/**
 * B2B 状态字典 + Badge variant 映射 — 对齐 b2b-api-contract.md v1.0
 * status: 0=待审核 1=已通过 2=已拒绝 3=已停用
 */
import type { ApplyStatus, QuoteStatus, CatalogStatus, StoreType } from '/#/b2b';

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
export const CATALOG_STATUS_LABEL: Record<CatalogStatus, string> = {
  0: '已下架',
  1: '已上架',
  2: '已售罄',
};

export const CATALOG_STATUS_VARIANT: Record<CatalogStatus, 'success' | 'warning' | 'muted'> = {
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
  1: '普通门店',
  2: '连锁门店',
};

export const STORE_TYPE_OPTIONS = [
  { value: '', label: '全部' },
  { value: '1', label: '普通门店' },
  { value: '2', label: '连锁门店' },
];
