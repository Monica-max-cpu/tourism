/**
 * 阶段 4 - 门店销售上报 + 门店资料 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】销售上报/门店资料 API
 * 销售上报 + 门店资料 Mock 同文件内联，减少 mocks 目录碎片
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】销售上报/门店资料 API
 */
import { defHttp } from '/@/api/http';
import { delay, paginate, randomId, MOCK_DATA } from '/@/mocks/_helpers';
import type {
  SalesReportRecord,
  SalesReportCreateParams,
  StoreProfile,
} from '/#/b2b-store';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ===== 内联 Mock：销售上报 =====
const CURRENT_STORE_ID = 'str-001';
const salesReports: SalesReportRecord[] = Array.from({ length: 32 }, (_, i) => {
  const day = String((i % 24) + 1).padStart(2, '0');
  const qty = 5 + ((i * 3) % 60);
  const price = +(28 + ((i * 13) % 360)).toFixed(2);
  return {
    id: `s-rep-${9000 + i}`,
    reportNo: `SR${String(20260500 + i).padStart(8, '0')}`,
    storeId: CURRENT_STORE_ID,
    productSku: `SKU${String(60000 + (i % 60)).padStart(6, '0')}`,
    productName: MOCK_DATA.PRODUCT_NAMES[i % MOCK_DATA.PRODUCT_NAMES.length] + ` 规格 ${(i % 30) + 1}`,
    unit: MOCK_DATA.UNITS[i % MOCK_DATA.UNITS.length],
    qty,
    amount: +(price * qty).toFixed(2),
    reportDate: `2026-05-${day}`,
    remark: i % 5 === 0 ? '高峰期' : '',
    createdAt: `2026-05-${day} 19:30:00`,
  };
});

// ===== 内联 Mock：门店资料 =====
const storeProfile: StoreProfile = {
  storeId: CURRENT_STORE_ID,
  storeName: MOCK_DATA.STORE_NAMES[0],
  storeType: 'SCENIC',
  contactPerson: '王经理',
  contactPhone: '13888885678',
  contactEmail: 'store@b2b.example.com',
  province: '安徽',
  city: '黄山市',
  address: '黄山风景区温泉景区温泉路 88 号',
  receiveAddress: '黄山风景区温泉景区温泉路 88 号 1 号库',
  receiver: '王经理',
  receiverPhone: '13888885678',
  description: '景区主入口黄金商圈，年客流量约 200 万。',
  updatedAt: '2026-05-20 10:30:00',
};

// ===== Mock 函数 =====
interface ReportQuery {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; storeId?: string; reportDateFrom?: string; reportDateTo?: string };
}
function mockListSalesReports({ pageNo, pageSize, searchInfo }: ReportQuery) {
  const sid = searchInfo?.storeId;
  if (!sid) return delay({ records: [], total: 0 });
  let list = salesReports.filter((x) => x.storeId === sid);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.productSku.includes(k) || x.reportNo.includes(k));
  }
  if (searchInfo?.reportDateFrom) list = list.filter((x) => x.reportDate >= (searchInfo.reportDateFrom as string));
  if (searchInfo?.reportDateTo) list = list.filter((x) => x.reportDate <= (searchInfo.reportDateTo as string));
  list = [...list].sort((a, b) => (a.reportDate < b.reportDate ? 1 : -1));
  return delay(paginate(list, pageNo, pageSize));
}
function mockCreateSalesReport(params: SalesReportCreateParams) {
  const id = randomId('s-rep-');
  const record: SalesReportRecord = {
    id,
    reportNo: `SR${Date.now().toString().slice(-10)}`,
    storeId: CURRENT_STORE_ID,
    productSku: params.productSku,
    productName: params.productName,
    unit: params.unit,
    qty: params.qty,
    amount: +params.amount.toFixed(2),
    reportDate: params.reportDate,
    remark: params.remark,
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
  salesReports.unshift(record);
  return delay({ success: true, id });
}
function mockGetSalesSummary(storeId: string) {
  if (!storeId) return delay({ totalQty: 0, totalAmount: 0, days: 0, last7d: [] as { date: string; amount: number }[] });
  const list = salesReports.filter((x) => x.storeId === storeId);
  const totalQty = list.reduce((s, x) => s + x.qty, 0);
  const totalAmount = +list.reduce((s, x) => s + x.amount, 0).toFixed(2);
  const days = new Set(list.map((x) => x.reportDate)).size;
  // 最近 7 天聚合
  const map = new Map<string, number>();
  list.forEach((x) => map.set(x.reportDate, (map.get(x.reportDate) || 0) + x.amount));
  const last7d = Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 7)
    .map(([date, amount]) => ({ date, amount: +amount.toFixed(2) }));
  return delay({ totalQty, totalAmount, days, last7d });
}
function mockGetStoreProfile(storeId: string) {
  if (storeId !== CURRENT_STORE_ID) return delay<StoreProfile | null>(null);
  return delay({ ...storeProfile });
}
function mockUpdateStoreProfile(patch: Partial<StoreProfile>) {
  Object.assign(storeProfile, patch, { updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') });
  return delay({ success: true });
}

// ===== Api enum =====
enum Api {
  ListReports = '/b2b/store/sales/list',
  CreateReport = '/b2b/store/sales/create',
  Summary = '/b2b/store/sales/summary',
  GetProfile = '/b2b/store/profile/get',
  UpdateProfile = '/b2b/store/profile/update',
}

// ===== 销售上报 =====
export function listSalesReportsApi(params: any) {
  return USE_MOCK ? mockListSalesReports(params) : defHttp.post({ url: Api.ListReports, data: params });
}
export function createSalesReportApi(params: SalesReportCreateParams) {
  return USE_MOCK ? mockCreateSalesReport(params) : defHttp.post({ url: Api.CreateReport, data: params });
}
export function getSalesSummaryApi(storeId: string) {
  return USE_MOCK ? mockGetSalesSummary(storeId) : defHttp.get({ url: Api.Summary, params: { storeId } });
}

// ===== 门店资料 =====
export function getStoreProfileApi(storeId: string) {
  return USE_MOCK ? mockGetStoreProfile(storeId) : defHttp.get({ url: Api.GetProfile, params: { storeId } });
}
export function updateStoreProfileApi(patch: Partial<StoreProfile>) {
  return USE_MOCK ? mockUpdateStoreProfile(patch) : defHttp.post({ url: Api.UpdateProfile, data: patch });
}
