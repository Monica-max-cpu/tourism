/**
 * 阶段 5 - 平台管理员看板聚合 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】admin dashboard 聚合接口 + 内联 mock
 * 输出：
 *  - kpi: 总销售额 / 总采购额 / 总毛利 / 毛利率
 *  - trend: 近 12 月 sales / cost / profit 三条折线
 *  - supplierShare: 供应商交易额分布（饼，TOP6 + 其他）
 *  - topSkus: 销量 Top10 SKU（柱）
 * 注：admin 看板含 costPrice/profit，前端用 v-auth='b2b:settlement:profitList' 控制可见性
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】admin dashboard
 */
import { defHttp } from '/@/api/http';
import { delay, MOCK_DATA } from '/@/mocks/_helpers';

const USE_MOCK = true;

export interface AdminDashboardKpi {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  profitRate: number; // %
}
export interface AdminTrendPoint {
  month: string; // YYYY-MM
  sales: number;
  cost: number;
  profit: number;
}
export interface SupplierShareItem {
  name: string;
  value: number;
}
export interface TopSkuItem {
  sku: string;
  name: string;
  qty: number;
  amount: number;
}
export interface AdminDashboardData {
  kpi: AdminDashboardKpi;
  trend: AdminTrendPoint[];
  supplierShare: SupplierShareItem[];
  topSkus: TopSkuItem[];
}

// ===== Mock =====
function buildMonths(): string[] {
  const list: string[] = [];
  const now = new Date('2026-05-24');
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return list;
}

function mockAdminDashboard(): Promise<AdminDashboardData> {
  const months = buildMonths();
  const trend: AdminTrendPoint[] = months.map((m, i) => {
    const sales = +(620000 + i * 38000 + Math.sin(i / 1.7) * 90000).toFixed(0);
    const cost = +(sales * (0.7 + Math.cos(i / 2.3) * 0.04)).toFixed(0);
    const profit = +(sales - cost).toFixed(0);
    return { month: m, sales, cost, profit };
  });
  const totalSales = trend.reduce((s, x) => s + x.sales, 0);
  const totalCost = trend.reduce((s, x) => s + x.cost, 0);
  const totalProfit = totalSales - totalCost;
  const profitRate = +((totalProfit / totalSales) * 100).toFixed(1);

  const supplierShare: SupplierShareItem[] = MOCK_DATA.SUPPLIER_NAMES.slice(0, 6).map((name, i) => ({
    name,
    value: +(180000 + i * 62000 + Math.cos(i) * 35000).toFixed(0),
  }));
  supplierShare.push({ name: '其他', value: 142000 });

  const topSkus: TopSkuItem[] = Array.from({ length: 10 }, (_, i) => {
    const name = MOCK_DATA.PRODUCT_NAMES[i % MOCK_DATA.PRODUCT_NAMES.length];
    const qty = 6800 - i * 380 - Math.floor(Math.random() * 60);
    const unitPrice = 28 + (i * 13) % 240;
    return {
      sku: `SKU${String(60000 + i).padStart(6, '0')}`,
      name,
      qty,
      amount: +(qty * unitPrice).toFixed(0),
    };
  });

  return delay({
    kpi: { totalSales, totalCost, totalProfit, profitRate },
    trend,
    supplierShare,
    topSkus,
  });
}

enum Api {
  Dashboard = '/b2b/dashboard/admin',
}

export function getAdminDashboardApi() {
  return USE_MOCK ? mockAdminDashboard() : defHttp.get<AdminDashboardData>({ url: Api.Dashboard });
}
