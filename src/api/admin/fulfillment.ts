/**
 * 集采 / 履约 / 结算 / 利润 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2C】admin 业务接口
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2C】admin 业务接口
 */
import { defHttp } from '/@/api/http';
import type { CollectiveConfig } from '/#/b2b-2c';

enum Api {
  // 集采
  ListPendingCollective = '/b2b/collective/pending-orders',
  TriggerCollective = '/b2b/collective/trigger',
  ListCollectiveOrders = '/b2b/collective/list',
  GetCollectiveConfig = '/b2b/collective/config',
  UpdateCollectiveConfig = '/b2b/collective/config',
  // 履约
  ListDeliveries = '/b2b/delivery/list',
  // 结算
  ListStoreSettlements = '/b2b/settlement/store/list',
  ListSupplierSettlements = '/b2b/settlement/supplier/list',
  // 利润
  ListProfits = '/b2b/profit/list',
  GetProfitSummary = '/b2b/profit/summary',
}

function normalizePage(page: any, normalizeRecord: (row: any) => any = (row) => row) {
  if (!page?.records) return page;
  return {
    ...page,
    records: page.records.map(normalizeRecord),
  };
}

function flattenSearchParams(params: any, keywordField?: string) {
  const { searchInfo, ...rest } = params || {};
  const flat = { ...rest, ...(searchInfo || {}) };
  if (keywordField && flat.keyword) {
    flat[keywordField] = flat.keyword;
    delete flat.keyword;
  }
  Object.keys(flat).forEach((key) => {
    if (flat[key] === '' || flat[key] === undefined || flat[key] === null || key === 'keyword') delete flat[key];
  });
  return flat;
}

function toSettlementStatus(status: number | string) {
  if (status === 1 || status === '1') return 'PAID';
  if (status === 2 || status === '2') return 'REFUNDED';
  return 'PENDING';
}

function fromSettlementStatus(status?: string) {
  if (status === 'PAID') return 1;
  if (status === 'REFUNDED') return 2;
  if (status === 'PENDING') return 0;
  return undefined;
}

function normalizeStoreSettlement(row: any) {
  return {
    ...row,
    type: 'STORE',
    partyName: row.partyName || row.storeName || row.storeId || '-',
    partyId: row.partyId || row.storeId,
    periodFrom: row.periodFrom || row.createTime,
    periodTo: row.periodTo || row.settleTime || row.createTime,
    orderCount: row.orderCount ?? 1,
    amount: row.amount ?? row.totalPayable ?? row.settlementAmount ?? 0,
    status: toSettlementStatus(row.status),
    generatedAt: row.generatedAt || row.createTime,
    paidAt: row.paidAt || row.settleTime,
  };
}

function normalizeSupplierSettlement(row: any) {
  return {
    ...row,
    type: 'SUPPLIER',
    partyName: row.partyName || row.supplierName || row.supplierId || '-',
    partyId: row.partyId || row.supplierId,
    periodFrom: row.periodFrom || row.createTime,
    periodTo: row.periodTo || row.settleTime || row.createTime,
    orderCount: row.orderCount ?? 1,
    amount: row.amount ?? row.settlementAmount ?? 0,
    status: toSettlementStatus(row.status),
    generatedAt: row.generatedAt || row.createTime,
    paidAt: row.paidAt || row.settleTime,
  };
}

function normalizeProfit(row: any) {
  const rate = Number(row.profitRate ?? 0);
  return {
    ...row,
    collectiveNo: row.collectiveNo || row.collectiveOrderId,
    productSku: row.productSku || '-',
    qty: row.qty ?? 1,
    unit: row.unit || '单',
    salePrice: row.salePrice ?? row.storeSettlementTotal ?? 0,
    costPrice: row.costPrice ?? row.supplierSettlementTotal ?? 0,
    saleAmount: row.saleAmount ?? row.storeSettlementTotal ?? 0,
    costAmount: row.costAmount ?? row.supplierSettlementTotal ?? 0,
    profit: row.profit ?? row.grossProfit ?? 0,
    profitRate: rate <= 1 ? +(rate * 100).toFixed(2) : rate,
    postedAt: row.postedAt || row.calcTime || row.createTime,
  };
}

function normalizeProfitSummary(summary: any) {
  const rate = Number(summary?.avgProfitRate ?? summary?.profitRate ?? 0);
  return {
    totalSale: summary?.totalSale ?? summary?.totalStoreAmount ?? 0,
    totalCost: summary?.totalCost ?? summary?.totalSupplierAmount ?? 0,
    totalProfit: summary?.totalProfit ?? summary?.totalGrossProfit ?? 0,
    profitRate: rate <= 1 ? +(rate * 100).toFixed(2) : rate,
    orderCount: summary?.orderCount ?? summary?.totalOrders ?? 0,
  };
}

// ===== 集采 =====
export function listPendingCollectiveApi() {
  return defHttp.get({ url: Api.ListPendingCollective });
}
export function triggerCollectiveApi(data: { triggerMode: 'BY_CATALOG' | 'BY_ORDERS'; catalogId?: string; orderIds?: string[]; supplierQuoteId?: string; remark?: string }) {
  return defHttp.post({ url: Api.TriggerCollective, data });
}
export function listCollectiveOrdersApi(params: any) {
  return defHttp.get({ url: Api.ListCollectiveOrders, params });
}
export function getCollectiveOrderApi(id: string) {
  return defHttp.get({ url: `/b2b/collective/detail/${id}`, params: { isAdmin: true } });
}
export function getCollectiveConfigApi() {
  return defHttp.get({ url: Api.GetCollectiveConfig }).then((res: any) => {
    const list = Array.isArray(res) ? res : [res];
    const cfg = list.find((item) => item?.isActive === 1) || list[0];
    if (!cfg) return { qtyThreshold: 100, hoursTimeout: 48, autoTrigger: true } as CollectiveConfig;
    return {
      qtyThreshold: cfg.qtyThreshold ?? 100,
      hoursTimeout: cfg.hoursTimeout ?? cfg.timeThresholdHours ?? 48,
      autoTrigger: cfg.autoTrigger ?? (cfg.isActive === 1),
    } as CollectiveConfig;
  });
}
export function updateCollectiveConfigApi(patch: Partial<CollectiveConfig>) {
  const payload: any = {
    ...patch,
    timeThresholdHours: patch.hoursTimeout,
    isActive: patch.autoTrigger ? 1 : 0,
  };
  delete payload.hoursTimeout;
  delete payload.autoTrigger;
  return defHttp.put({ url: Api.UpdateCollectiveConfig, data: payload });
}

// ===== 履约 =====
export function listDeliveriesApi(params: any) {
  return defHttp.get({ url: Api.ListDeliveries, params });
}
export function getDeliveryApi(id: string) {
  return defHttp.get({ url: `/b2b/delivery/detail/${id}` });
}
export function handleDeliveryExceptionApi(id: string, remark: string) {
  return defHttp.put({ url: `/b2b/delivery/exception/${id}`, params: { remark } });
}

// ===== 结算 =====
export async function listStoreSettlementsApi(params: any) {
  const flat = flattenSearchParams(params);
  const status = fromSettlementStatus(flat.status);
  if (status === undefined) delete flat.status;
  else flat.status = status;
  const res = await defHttp.get({ url: Api.ListStoreSettlements, params: flat });
  return normalizePage(res, normalizeStoreSettlement);
}
export async function listSupplierSettlementsApi(params: any) {
  const flat = flattenSearchParams(params);
  const status = fromSettlementStatus(flat.status);
  if (status === undefined) delete flat.status;
  else flat.status = status;
  const res = await defHttp.get({ url: Api.ListSupplierSettlements, params: flat });
  return normalizePage(res, normalizeSupplierSettlement);
}
export function paySettlementApi(id: string, actualPaidAmount: number, remark = '') {
  const query = new URLSearchParams({ actualPaidAmount: String(actualPaidAmount) });
  if (remark) query.set('remark', remark);
  return defHttp.put({ url: `/b2b/settlement/supplier/pay/${id}?${query.toString()}` });
}

// ===== 利润 =====
export async function listProfitsApi(params: any) {
  const res = await defHttp.get({ url: Api.ListProfits, params: flattenSearchParams(params, 'collectiveOrderId') });
  return normalizePage(res, normalizeProfit);
}
export async function getProfitSummaryApi() {
  const res = await defHttp.get({ url: Api.GetProfitSummary });
  return normalizeProfitSummary(res);
}
