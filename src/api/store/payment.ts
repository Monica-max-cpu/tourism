/**
 * 阶段 4 - 门店付款 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款 API
 */
import { defHttp } from '/@/api/http';
import * as paymentMock from '/@/mocks/store/payment.mock';
import type { SubmitPaymentParams } from '/#/b2b-store';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  Submit = '/b2b/payment/create',
}

export function listStorePaymentsApi(params: any) {
  // 后端无门店维度支付列表接口，使用 mock
  return paymentMock.mockListStorePayments(params);
}
export function getPaymentByOrderApi(orderNo: string) {
  return USE_MOCK ? paymentMock.mockGetPaymentByOrder(orderNo) : defHttp.get({ url: `/b2b/payment/query/${orderNo}` });
}
export function submitPaymentApi(params: SubmitPaymentParams) {
  return USE_MOCK ? paymentMock.mockSubmitPayment(params) : defHttp.post({ url: Api.Submit, data: params });
}
