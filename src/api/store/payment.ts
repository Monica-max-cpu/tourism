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
  ListPayments = '/b2b/store/payments/list',
  GetByOrder = '/b2b/store/payments/get-by-order',
  Submit = '/b2b/store/payments/submit',
}

export function listStorePaymentsApi(params: any) {
  return USE_MOCK ? paymentMock.mockListStorePayments(params) : defHttp.post({ url: Api.ListPayments, data: params });
}
export function getPaymentByOrderApi(orderId: string) {
  return USE_MOCK ? paymentMock.mockGetPaymentByOrder(orderId) : defHttp.get({ url: Api.GetByOrder, params: { orderId } });
}
export function submitPaymentApi(params: SubmitPaymentParams) {
  return USE_MOCK ? paymentMock.mockSubmitPayment(params) : defHttp.post({ url: Api.Submit, data: params });
}
