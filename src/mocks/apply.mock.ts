/**
 * 入驻申请 Mock — 对齐 b2b-api-contract.md v1.0
 */
export interface SupplierApplyParams {
  supplierName: string;
  authType?: string;
  logoId?: string;
  storeType?: number;
  mainCategory?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  bankAccount?: string;
  bankName?: string;
  bankNo?: string;
  description?: string;
  storePhotos?: string;
  mapAddress?: string;
  coordinate?: string;
  categoryIds?: string;
  supplySourceId?: string;
  creditLimit?: number;
  remark?: string;
}

export interface StoreApplyParams {
  storeName: string;
  storeType: number;
  authType?: string;
  logoId?: string;
  mainCategory?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  bankAccount?: string;
  bankName?: string;
  bankNo?: string;
  description?: string;
  storePhotos?: string;
  mapAddress?: string;
  coordinate?: string;
  categoryIds?: string;
  supplySourceId?: string;
  remark?: string;
}

export interface ApplyResult {
  id: string;
  name: string;
  status: 0;
  statusLabel: string;
}

export function mockSupplierApply(params: SupplierApplyParams): Promise<ApplyResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `sup-${Date.now()}`,
        name: params.supplierName,
        status: 0,
        statusLabel: '待审核',
      });
    }, 600);
  });
}

export function mockStoreApply(params: StoreApplyParams): Promise<ApplyResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `str-${Date.now()}`,
        name: params.storeName,
        status: 0,
        statusLabel: '待审核',
      });
    }, 600);
  });
}
