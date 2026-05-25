/**
 * 阶段 5 - 门店看板聚合 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】store dashboard 聚合接口
 * 输出：
 *  - kpi: 月采购额 / 月销售额 / 在途订单 / 库存周转
 *  - purchaseMonthly: 近 12 月采购金额（柱）
 *  - salesTrend: 近 30 天销售上报金额（折线）
 *  - turnover: 库存周转率（仪表，单位次/月）
 * 价格隔离：仅 salePrice 口径，绝不出现 costPrice / supplierName / profit
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】store dashboard
 */
import { defHttp } from '/@/api/http';
import { delay } from '/@/mocks/_helpers';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface StoreDashboardKpi {
  monthPurchase: number;
  monthSales: number;
  shippingOrders: number;
  turnoverRate: number; // 次/月
}
export interface PurchaseMonth {
  month: string;
  amount: number;
}
export interface SalesDayPoint {
  date: string;
  amount: number;
}
export interface StoreDashboardData {
  kpi: StoreDashboardKpi;
  purchaseMonthly: PurchaseMonth[];
  salesTrend: SalesDayPoint[];
  turnover: { rate: number; max: number }; // max 用于仪表上限
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

function buildDays(n = 30): string[] {
  const list: string[] = [];
  const now = new Date('2026-05-24');
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return list;
}

function mockStoreDashboard(storeId: string): Promise<StoreDashboardData> {
  if (!storeId) {
    return delay({
      kpi: { monthPurchase: 0, monthSales: 0, shippingOrders: 0, turnoverRate: 0 },
      purchaseMonthly: [],
      salesTrend: [],
      turnover: { rate: 0, max: 6 },
    });
  }

  const months = buildMonths();
  const purchaseMonthly: PurchaseMonth[] = months.map((m, i) => ({
    month: m,
    amount: +(96000 + i * 4200 + Math.sin(i / 2) * 18000).toFixed(0),
  }));
  const monthPurchase = purchaseMonthly[purchaseMonthly.length - 1].amount;

  const days = buildDays();
  const salesTrend: SalesDayPoint[] = days.map((d, i) => ({
    date: d,
    amount: +(3200 + Math.sin(i / 3) * 1400 + Math.random() * 800).toFixed(0),
  }));
  const monthSales = +salesTrend.slice(-30).reduce((s, x) => s + x.amount, 0).toFixed(0);

  const turnoverRate = 3.2;

  return delay({
    kpi: {
      monthPurchase,
      monthSales,
      shippingOrders: 6,
      turnoverRate,
    },
    purchaseMonthly,
    salesTrend,
    turnover: { rate: turnoverRate, max: 6 },
  });
}

enum Api {
  Dashboard = '/b2b/dashboard/store',
}

export function getStoreDashboardApi(storeId: string) {
  return USE_MOCK
    ? mockStoreDashboard(storeId)
    : defHttp.get<StoreDashboardData>({ url: Api.Dashboard, params: { storeId } });
}
