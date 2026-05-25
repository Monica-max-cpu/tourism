/**
 * 入驻申请 Mock
 */
export interface SupplierApplyParams {
  supplierName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  remark?: string;
}

export interface StoreApplyParams {
  storeName: string;
  storeType: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  remark?: string;
}

export interface ApplyResult {
  applyNo: string;
  name: string;
  status: 'PENDING';
  createdAt: number;
}

function genApplyNo(prefix: string) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function mockSupplierApply(params: SupplierApplyParams): Promise<ApplyResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        applyNo: genApplyNo('SUP'),
        name: params.supplierName,
        status: 'PENDING',
        createdAt: Date.now(),
      });
    }, 600);
  });
}

export function mockStoreApply(params: StoreApplyParams): Promise<ApplyResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        applyNo: genApplyNo('STR'),
        name: params.storeName,
        status: 'PENDING',
        createdAt: Date.now(),
      });
    }, 600);
  });
}
