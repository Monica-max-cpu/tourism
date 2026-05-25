/**
 * B2B 业务类型
 */
export type ApplyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type QuoteStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type CatalogStatus = 'ON_SHELF' | 'OFF_SHELF';
export type StoreType = 'SCENIC' | 'CHAIN' | 'INDEPENDENT';

export interface SupplierApply {
  id: string;
  applyNo: string;
  supplierName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  status: ApplyStatus;
  remark?: string;
  rejectReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface StoreApply {
  id: string;
  applyNo: string;
  storeName: string;
  storeType: StoreType;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  status: ApplyStatus;
  remark?: string;
  rejectReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface SupplierQuote {
  id: string;
  quoteNo: string;
  supplierId: string;
  supplierName: string;
  productName: string;
  productSku: string;
  unit: string;
  /** 供应商报价（成本价） */
  costPrice: number;
  /** 平台建议销售价 */
  suggestedPrice?: number;
  validFrom: string;
  validTo: string;
  status: QuoteStatus;
  remark?: string;
  createdAt: string;
}

export interface PlatformCatalog {
  id: string;
  productSku: string;
  productName: string;
  category: string;
  unit: string;
  /** 平台对外销售价（门店看到的价格） */
  salePrice: number;
  /** 当前最优成本价（来自审核通过的报价，仅管理员可见） */
  bestCostPrice?: number;
  status: CatalogStatus;
  cover?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
