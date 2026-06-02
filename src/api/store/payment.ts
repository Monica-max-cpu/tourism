/**
 * 阶段 4 - 门店付款 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款 API
 */
import { defHttp } from '/@/api/http';
import type { SubmitPaymentParams } from '/#/b2b-store';

enum Api {
  Submit = '/b2b/payment/create',
}

export function listStorePaymentsApi(params: any) {
  void params;
  return Promise.resolve({ records: [], total: 0 });
}
export function getPaymentByOrderApi(orderNo: string) {
  return defHttp.get({ url: `/b2b/payment/query/${orderNo}` });
}
export function submitPaymentApi(params: SubmitPaymentParams) {
  return defHttp.post({ url: Api.Submit, data: params });
}
