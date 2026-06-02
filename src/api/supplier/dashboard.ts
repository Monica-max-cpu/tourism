/**
 * 阶段 5 - 供应商看板聚合 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】supplier dashboard 聚合接口
 * 输出：
 *  - kpi: 总接单 / 总发货 / 报价数 / 通过率
 *  - acceptTrend: 近 12 周接单数（折线）
 *  - quoteFunnel: 提交 / 通过 / 未通过 / 转化率（仪表 + 三柱）
 *  - settleMonthly: 近 12 月结算金额（柱）
 * 价格隔离：仅 costPrice / 自报价金额，绝不出现 salePrice / profit
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】supplier dashboard
 */
import { defHttp } from '/@/api/http';
import { delay } from '/@/mocks/_helpers';

const USE_MOCK = true;

export interface SupplierDashboardKpi {
  totalOrders: number;
  totalShipped: number;
  totalQuotes: number;
  approveRate: number; // %
}
export interface SupplierAcceptPoint {
  week: string; // 第N周
  orders: number;
}
export interface QuoteFunnel {
  submitted: number;
  approved: number;
  rejected: number;
  conversion: number; // %
}
export interface SettleMonth {
  month: string;
  amount: number;
}
export interface SupplierDashboardData {
  kpi: SupplierDashboardKpi;
  acceptTrend: SupplierAcceptPoint[];
  quoteFunnel: QuoteFunnel;
  settleMonthly: SettleMonth[];
}

function buildMonths(n = 12): string[] {
  const list: string[] = [];
  const now = new Date('2026-05-24');
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return list;
}

function mockSupplierDashboard(supplierId: string): Promise<SupplierDashboardData> {
  void supplierId;
  // 12 周接单趋势
  const acceptTrend: SupplierAcceptPoint[] = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    orders: Math.max(0, Math.round(8 + i * 1.3 + Math.sin(i / 1.5) * 6)),
  }));
  const totalOrders = acceptTrend.reduce((s, x) => s + x.orders, 0);

  const submitted = 86;
  const approved = 71;
  const rejected = 9;
  const conversion = +((approved / submitted) * 100).toFixed(1);
  const totalQuotes = submitted;
  const approveRate = conversion;

  const months = buildMonths();
  const settleMonthly: SettleMonth[] = months.map((m, i) => ({
    month: m,
    amount: +(48000 + i * 3200 + Math.cos(i / 2) * 12000).toFixed(0),
  }));

  return delay({
    kpi: { totalOrders, totalShipped: Math.round(totalOrders * 0.84), totalQuotes, approveRate },
    acceptTrend,
    quoteFunnel: { submitted, approved, rejected, conversion },
    settleMonthly,
  });
}

enum Api {
  Dashboard = '/b2b/dashboard/supplier',
}

export function getSupplierDashboardApi(supplierId?: string) {
  return USE_MOCK
    ? mockSupplierDashboard(supplierId || 'mock-supplier')
    : defHttp.get<SupplierDashboardData>({ url: Api.Dashboard, params: { supplierId } });
}
