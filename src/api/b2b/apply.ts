/**
 * 入驻申请 API
 * - 登录用户入驻：supplierApplyApi / storeApplyApi（需要登录 + 权限）
 * - 公开入驻：publicOnboardingApplyApi（@IgnoreAuth，无需登录）
 * - 公开入驻认领：claimOnboardingApi（@IgnoreAuth，无需登录，手机号 + 短信验证码校验）
 */
import { defHttp } from '/@/api/http';

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

export interface PublicOnboardingApplyParams extends Omit<SupplierApplyParams, 'supplierName'> {
  merchantType: 'SUPPLIER' | 'STORE';
  name: string;
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

export interface StoreApplyParams extends Omit<SupplierApplyParams, 'supplierName'> {
  storeName: string;
  storeType: number;
}

export interface ApplyResult {
  id?: string;
  name?: string;
  status?: 0;
  statusLabel?: string;
  merchantType?: 'SUPPLIER' | 'STORE';
  merchantId?: string;
  reviewStatus?: number;
}

enum Api {
  SupplierApply = '/b2b/supplier/apply',
  StoreApply = '/b2b/store/apply',
  PublicOnboardingApply = '/b2b/public/onboarding/apply',
  ClaimOnboarding = '/b2b/onboarding/claim',
}

export function supplierApplyApi(params: SupplierApplyParams): Promise<ApplyResult> {
  return defHttp.post<ApplyResult>({ url: Api.SupplierApply, data: params });
}

export function storeApplyApi(params: StoreApplyParams): Promise<ApplyResult> {
  return defHttp.post<ApplyResult>({ url: Api.StoreApply, data: params });
}

/** 公开入驻申请 -- 无需登录 */
export function publicOnboardingApplyApi(params: PublicOnboardingApplyParams): Promise<ApplyResult> {
  return defHttp.post<ApplyResult>({ url: Api.PublicOnboardingApply, data: params });
}

/** 认领公开入驻申请 -- 已登录用户走 defHttp（带 token），公开页无 token 也兼容 */
export async function claimOnboardingApi(params: ClaimOnboardingParams): Promise<ClaimOnboardingResult> {
  return defHttp.post<ClaimOnboardingResult>({ url: Api.ClaimOnboarding, data: params }, { isTransformResponse: false });
}
