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
  businessLicense?: string;
  supplySourceId?: string;
  creditLimit?: number;
}

export interface PublicOnboardingApplyParams {
  merchantType: 'SUPPLIER' | 'STORE';
  supplierName?: string;
  storeName?: string;
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
  businessLicense?: string;
  supplySourceId?: string;
  creditLimit?: number;
}

export interface ClaimOnboardingParams {
  merchantType: 'SUPPLIER' | 'STORE';
  merchantId: string;
  smsCode?: string;
  phone?: string;
}

export interface ClaimOnboardingResult {
  success: boolean;
  message?: string;
  applicationId?: string;
  merchantType?: string;
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
  businessLicense?: string;
  supplySourceId?: string;
  creditLimit?: number;
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

export function mockPublicOnboardingApply(params: PublicOnboardingApplyParams): Promise<ApplyResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const prefix = params.merchantType === 'SUPPLIER' ? 'pub-sup' : 'pub-str';
      const name = params.merchantType === 'SUPPLIER' ? (params.supplierName || '') : (params.storeName || '');
      resolve({
        id: `${prefix}-${Date.now()}`,
        name,
        status: 0,
        statusLabel: '待审核',
      });
    }, 600);
  });
}

export function mockClaimOnboarding(params: ClaimOnboardingParams): Promise<ClaimOnboardingResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 首次不带 smsCode — 模拟手机号校验
      if (!params.smsCode) {
        const users = JSON.parse(localStorage.getItem('b2b:registered_users') || '[]');
        const matched = users.find((u: any) => u.phone === params.phone);
        if (!matched) {
          reject(new Error('当前账号与申请时填写的联系电话不一致，请通过短信验证码认领'));
          return;
        }
        resolve({
          success: true,
          message: '认领成功，请重新登录以获取角色',
          applicationId: `claimed-${Date.now()}`,
          merchantType: params.merchantType,
        });
        return;
      }
      // 带 smsCode 重试 — 校验验证码
      const cached = localStorage.getItem(`b2b:sms:3:${params.phone}`);
      if (cached !== params.smsCode) {
        reject(new Error('短信验证码错误'));
        return;
      }
      resolve({
        success: true,
        message: '认领成功，请重新登录以获取角色',
        applicationId: `claimed-${Date.now()}`,
        merchantType: params.merchantType,
      });
    }, 500);
  });
}
