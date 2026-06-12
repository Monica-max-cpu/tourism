import { defHttp } from '/@/api/http';
import type { CreditBillRecord, CreditPaymentSplitRecord, StoreCreditAccount } from '/#/b2b-store';

enum Api {
  AccountList = '/b2b/credit/account/list',
  BillList = '/b2b/credit/bill/list',
  SplitList = '/b2b/credit/split/list',
  SplitSubmit = '/b2b/credit/split/submit',
}

export function listCreditAccountsApi(params: { storeId?: string; creditStatus?: number | string; pageNo?: number; pageSize?: number }) {
  return defHttp.get<any>({ url: Api.AccountList, params }).then(normalizePage<StoreCreditAccount>);
}

export function listCreditBillsApi(params: { storeId?: string; billStatus?: number | string; pageNo?: number; pageSize?: number }) {
  return defHttp.get<any>({ url: Api.BillList, params }).then(normalizePage<CreditBillRecord>);
}

export function listCreditSplitsApi(params: { orderNo?: string; paymentMethod?: string; splitStatus?: number | string; pageNo?: number; pageSize?: number }) {
  return defHttp.get<any>({ url: Api.SplitList, params }).then(normalizePage<CreditPaymentSplitRecord>);
}

export function submitCreditSplitApi(id: string) {
  return defHttp.post<CreditPaymentSplitRecord>({ url: `${Api.SplitSubmit}/${id}` });
}

function normalizePage<T>(input: any): { records: T[]; total: number } {
  const page = input?.records || input?.list || input?.rows ? input : input?.result;
  if (Array.isArray(input)) return { records: input, total: input.length };
  if (Array.isArray(page?.records)) return { records: page.records, total: Number(page.total ?? page.records.length) };
  if (Array.isArray(page?.list)) return { records: page.list, total: Number(page.total ?? page.list.length) };
  if (Array.isArray(page?.rows)) return { records: page.rows, total: Number(page.total ?? page.rows.length) };
  return { records: [], total: 0 };
}
