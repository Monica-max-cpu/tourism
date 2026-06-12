import { defHttp } from '/@/api/http';
import type {
  CreditBillDetail,
  CreditBillRecord,
  CreditBillRepayApplyParams,
  CreditBillRepayApplyResult,
  StoreCreditAccount,
  StoreCreditApplyParams,
} from '/#/b2b-store';

enum Api {
  Account = '/b2b/credit/account',
  Apply = '/b2b/credit/apply',
  StatusSync = '/b2b/credit/status-sync',
  BillList = '/b2b/credit/bill/list',
  BillDetail = '/b2b/credit/bill/detail',
  RepayApply = '/b2b/credit/bill/repay/apply',
}

export function getStoreCreditAccountApi(storeId?: string) {
  const url = storeId ? `${Api.Account}/${storeId}` : Api.Account;
  return defHttp.get<any>({ url }).then(normalizeCreditAccount);
}

export function applyStoreCreditApi(data: StoreCreditApplyParams) {
  return defHttp.post<any>({ url: Api.Apply, data }).then((result) => ({
    ...result,
    creditStatus: Number(result?.creditStatus ?? result?.account?.creditStatus ?? 0),
    account: result?.account ? normalizeCreditAccount(result.account) : undefined,
  }));
}

export function syncStoreCreditStatusApi(storeId?: string) {
  return defHttp.put<any>({ url: Api.StatusSync, params: { storeId: storeId || '' } }).then(normalizeCreditAccount);
}

export function listStoreCreditBillsApi(params: { storeId?: string; billStatus?: number | string; pageNo?: number; pageSize?: number }) {
  return defHttp.get<any>({ url: Api.BillList, params }).then(normalizeCreditBillPage);
}

export function getStoreCreditBillDetailApi(id: string) {
  return defHttp.get<any>({ url: `${Api.BillDetail}/${id}` }).then(normalizeCreditBillDetail);
}

export function applyCreditBillRepayApi(data: CreditBillRepayApplyParams) {
  return defHttp.post<CreditBillRepayApplyResult>({ url: Api.RepayApply, data });
}

function normalizeCreditBillPage(input: any): { records: CreditBillRecord[]; total: number } {
  const page = input?.records || input?.list || input?.rows ? input : input?.result;
  if (Array.isArray(input)) return { records: input.map(normalizeCreditBillRecord), total: input.length };
  if (Array.isArray(page?.records)) return { records: page.records.map(normalizeCreditBillRecord), total: Number(page.total ?? page.records.length) };
  if (Array.isArray(page?.list)) return { records: page.list.map(normalizeCreditBillRecord), total: Number(page.total ?? page.list.length) };
  if (Array.isArray(page?.rows)) return { records: page.rows.map(normalizeCreditBillRecord), total: Number(page.total ?? page.rows.length) };
  return { records: [], total: 0 };
}

function normalizeCreditAccount(input: any): StoreCreditAccount {
  const raw = input?.result || input?.data || input || {};
  return {
    ...raw,
    creditAccountId: raw?.creditAccountId ?? raw?.id ?? '',
    storeId: raw?.storeId ?? '',
    totalCreditAmount: Number(raw?.totalCreditAmount ?? 0),
    usedCreditAmount: Number(raw?.usedCreditAmount ?? 0),
    frozenCreditAmount: Number(raw?.frozenCreditAmount ?? 0),
    availableCreditAmount: Number(raw?.availableCreditAmount ?? 0),
    creditDays: raw?.creditDays == null ? undefined : Number(raw.creditDays),
    creditStatus: Number(raw?.creditStatus ?? 0) as StoreCreditAccount['creditStatus'],
  };
}

function normalizeCreditBillDetail(input: any): CreditBillDetail {
  const raw = input?.result || input?.data || input || {};
  const items = raw?.items || raw?.details || raw?.detailList || raw?.records || raw?.list || raw?.rows || [];
  return {
    ...normalizeCreditBillRecord(raw),
    items: Array.isArray(items) ? items.map(normalizeCreditBillDetailItem) : [],
  };
}

function normalizeCreditBillRecord(raw: any): CreditBillRecord {
  return {
    id: String(raw?.id ?? raw?.billId ?? ''),
    creditAccountId: String(raw?.creditAccountId ?? raw?.accountId ?? ''),
    storeId: String(raw?.storeId ?? ''),
    billNo: String(raw?.billNo ?? raw?.billNumber ?? ''),
    billCycle: String(raw?.billCycle ?? raw?.cycle ?? raw?.billMonth ?? ''),
    billAmount: Number(raw?.billAmount ?? raw?.amount ?? 0),
    paidAmount: Number(raw?.paidAmount ?? 0),
    unpaidAmount: Number(raw?.unpaidAmount ?? raw?.remainAmount ?? 0),
    dueDate: raw?.dueDate ?? raw?.repayDate ?? '',
    overdueDays: raw?.overdueDays == null ? undefined : Number(raw.overdueDays),
    billStatus: Number(raw?.billStatus ?? raw?.status ?? 0) as CreditBillRecord['billStatus'],
    billStatusLabel: raw?.billStatusLabel ?? raw?.billStatusName ?? raw?.statusLabel ?? '',
    createTime: raw?.createTime ?? raw?.createDate ?? '',
  };
}

function normalizeCreditBillDetailItem(raw: any) {
  return {
    id: String(raw?.id ?? ''),
    billId: String(raw?.billId ?? raw?.parentId ?? ''),
    orderId: raw?.orderId ? String(raw.orderId) : '',
    orderNo: raw?.orderNo ? String(raw.orderNo) : '',
    productName: raw?.productName ?? raw?.goodsName ?? raw?.summary ?? '',
    detailTime: raw?.detailTime ?? raw?.occurTime ?? raw?.createTime ?? '',
    creditAmount: Number(raw?.creditAmount ?? raw?.amount ?? 0),
  };
}
