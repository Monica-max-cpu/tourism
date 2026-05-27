/**
 * B2B 业务类型 — 对齐 b2b-api-contract.md v1.0
 * 状态码：0=待审 1=已通过 2=已拒绝 3=已停用
 */
export type ApplyStatus = 0 | 1 | 2 | 3;
export type QuoteStatus = 0 | 1 | 2 | 3;
export type CatalogStatus = 0 | 1 | 2;
/** 1=普通门店 2=连锁门店 */
export type StoreType = 1 | 2;
/** 仓库启用状态 */
export type WarehouseStatus = 0 | 1;

export interface SupplierApply {
  id: string;
  supplierName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  businessLicense?: string;
  categoryIds?: string;
  supplySourceId?: string;
  status: ApplyStatus;
  statusLabel?: string;
  loginAccount?: string;
  reviewRemark?: string;
  reviewer?: string;
  reviewTime?: string;
  createTime: string;
  remark?: string;
}

export interface StoreApply {
  id: string;
  storeName: string;
  storeType: StoreType;
  storeTypeLabel?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  businessLicense?: string;
  status: ApplyStatus;
  statusLabel?: string;
  loginAccount?: string;
  creditLimit?: number;
  reviewRemark?: string;
  reviewer?: string;
  reviewTime?: string;
  createTime: string;
  remark?: string;
}

export interface SupplierQuote {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  minOrderQty: number;
  basePrice: number;
  validFrom: string;
  validTo: string;
  leadTimeDays?: number;
  status: QuoteStatus;
  statusLabel?: string;
  tiers?: QuoteTier[];
}

export interface QuoteTier {
  id?: string;
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
}

export interface PlatformCatalog {
  id: string;
  productName: string;
  productImages?: string;
  categoryId?: string;
  unit: string;
  basePrice: number;
  minOrderQty?: number;
  commissionRate?: number;
  status: CatalogStatus;
  statusLabel?: string;
  sortOrder?: number;
  description?: string;
  /** 管理端额外字段 */
  preferredQuoteId?: string;
  preferredSupplierName?: string;
  supplierBasePrice?: number;
  margin?: number;
  marginRate?: number;
  catalogTiers?: CatalogTier[];
  createTime?: string;
  updateTime?: string;
}

export interface CatalogTier {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
}
