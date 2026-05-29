/**
 * 入驻申请 API（登录用户提交，携带当前 Token）
 */
import { defHttp } from '/@/api/http';
import {
  mockSupplierApply,
  mockStoreApply,
  type SupplierApplyParams,
  type StoreApplyParams,
  type ApplyResult,
} from '/@/mocks/apply.mock';

enum Api {
  SupplierApply = '/b2b/supplier/apply',
  StoreApply = '/b2b/store/apply',
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

export type { SupplierApplyParams, StoreApplyParams, ApplyResult };
