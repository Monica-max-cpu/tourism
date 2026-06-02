/**
 * 入驻申请 API
 * - 登录用户入驻：supplierApplyApi / storeApplyApi（需要登录 + 权限）
 * - 公开入驻：publicOnboardingApplyApi（@IgnoreAuth，无需登录）
 * - 公开入驻认领：claimOnboardingApi（@IgnoreAuth，无需登录，手机号 + 短信验证码校验）
 */
import { defHttp } from '/@/api/http';
import {
  mockSupplierApply,
  mockStoreApply,
  mockPublicOnboardingApply,
  mockClaimOnboarding,
  type SupplierApplyParams,
  type StoreApplyParams,
  type PublicOnboardingApplyParams,
  type ClaimOnboardingParams,
  type ClaimOnboardingResult,
  type ApplyResult,
} from '/@/mocks/apply.mock';

enum Api {
  SupplierApply = '/b2b/supplier/apply',
  StoreApply = '/b2b/store/apply',
  PublicOnboardingApply = '/b2b/public/onboarding/apply',
  ClaimOnboarding = '/b2b/onboarding/claim',
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function supplierApplyApi(params: SupplierApplyParams): Promise<ApplyResult> {
  if (USE_MOCK) return mockSupplierApply(params);
  return defHttp.post<ApplyResult>({ url: Api.SupplierApply, data: params });
}

export function storeApplyApi(params: StoreApplyParams): Promise<ApplyResult> {
  if (USE_MOCK) return mockStoreApply(params);
  return defHttp.post<ApplyResult>({ url: Api.StoreApply, data: params });
}

/** 公开入驻申请 -- 无需登录 */
export function publicOnboardingApplyApi(params: PublicOnboardingApplyParams): Promise<ApplyResult> {
  if (USE_MOCK) return mockPublicOnboardingApply(params);
  return defHttp.post<ApplyResult>({ url: Api.PublicOnboardingApply, data: params });
}

/** 认领公开入驻申请 -- 已登录用户走 defHttp（带 token），公开页无 token 也兼容 */
export async function claimOnboardingApi(params: ClaimOnboardingParams): Promise<ClaimOnboardingResult> {
  if (USE_MOCK) return mockClaimOnboarding(params);
  return defHttp.post<ClaimOnboardingResult>({ url: Api.ClaimOnboarding, data: params }, { isTransformResponse: false });
}

export type { SupplierApplyParams, StoreApplyParams, PublicOnboardingApplyParams, ClaimOnboardingParams, ApplyResult, ClaimOnboardingResult };
