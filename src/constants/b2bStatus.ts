/**
 * B2B 状态字典 + Badge variant 映射
 */
import type { ApplyStatus, QuoteStatus, CatalogStatus, StoreType } from '/#/b2b';

export const APPLY_STATUS_LABEL: Record<ApplyStatus, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
};

export const APPLY_STATUS_VARIANT: Record<ApplyStatus, 'warning' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
};

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
  EXPIRED: '已过期',
};

export const QUOTE_STATUS_VARIANT: Record<QuoteStatus, 'warning' | 'success' | 'destructive' | 'muted'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  EXPIRED: 'muted',
};

export const CATALOG_STATUS_LABEL: Record<CatalogStatus, string> = {
  ON_SHELF: '已上架',
  OFF_SHELF: '已下架',
};

export const CATALOG_STATUS_VARIANT: Record<CatalogStatus, 'success' | 'muted'> = {
  ON_SHELF: 'success',
  OFF_SHELF: 'muted',
};

export const STORE_TYPE_LABEL: Record<StoreType, string> = {
  SCENIC: '景区门店',
  CHAIN: '连锁门店',
  INDEPENDENT: '独立门店',
};

export const APPLY_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
];

export const QUOTE_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'EXPIRED', label: '已过期' },
];

export const CATALOG_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'ON_SHELF', label: '已上架' },
  { value: 'OFF_SHELF', label: '已下架' },
];

export const STORE_TYPE_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'SCENIC', label: '景区门店' },
  { value: 'CHAIN', label: '连锁门店' },
  { value: 'INDEPENDENT', label: '独立门店' },
];
