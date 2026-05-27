/**
 * 阶段 3 - 供应商库存 + 结算 + 企业资料 Mock
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存/结算/资料 Mock
 * - 强制按 supplierId 隔离
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商库存/结算/资料 Mock
 */
import type {
  SupplierStock,
  SupplierStockHealth,
  SupplierSettlement,
  SupplierSettlementStatus,
  SupplierProfile,
} from '/#/b2b-supplier';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const CURRENT_SUPPLIER_ID = 'sup-001';

// ===== 库存 =====
const warehouses = ['总仓-华东', '总仓-华南', '冷链-华北'];

function calcHealth(available: number, threshold: number): SupplierStockHealth {
  if (available <= 0) return 'OUT';
  if (available < threshold) return 'LOW';
  return 'NORMAL';
}

const stocks: SupplierStock[] = Array.from({ length: 28 }, (_, i) => {
  const threshold = 50 + (i % 4) * 30;
  const available = i % 7 === 0 ? 0 : i % 5 === 0 ? Math.floor(threshold * 0.6) : threshold + 80 + (i % 6) * 40;
  const locked = (i % 4) * 8;
  const wh = pick(warehouses);
  return {
    id: `sup-stock-${7000 + i}`,
    supplierId: CURRENT_SUPPLIER_ID,
    productId: `prod-${String(8000 + i).padStart(4, '0')}`,
    productName: pick(MOCK_DATA.PRODUCT_NAMES),
    warehouseId: `wh-${String((i % 3) + 1).padStart(4, '0')}`,
    warehouseName: wh,
    unit: pick(MOCK_DATA.UNITS),
    productSku: `SKU${String(60000 + (i % 24)).padStart(6, '0')}`,
    availableQty: available,
    lockedQty: locked,
    warnThreshold: threshold,
    updatedAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(9 + (i % 9)).padStart(2, '0')}:30:00`,
    health: calcHealth(available, threshold),
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  keyword?: string;
  health?: string;
  supplierId?: string;
}

export function mockListSupplierStocks({ pageNo, pageSize, keyword, health, supplierId }: QueryParams) {
  if (!supplierId) return delay({ records: [], total: 0 });
  let list = stocks.filter((x) => x.supplierId === supplierId);
  if (health) list = list.filter((x) => x.health === health);
  if (keyword) {
    const k = keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.productSku.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockReplenishStock(data: { supplierId: string; productId: string; warehouseId?: string; qty: number; remark?: string }) {
  const existing = stocks.find((x) => x.supplierId === data.supplierId && x.productId === data.productId);
  if (existing) {
    existing.availableQty = data.qty;
    existing.health = calcHealth(data.qty, existing.warnThreshold);
    existing.updatedAt = new Date().toISOString();
    return delay({ success: true, stockId: existing.id, availableQty: existing.availableQty });
  }
  const id = `sup-stock-${Date.now()}`;
  const item: SupplierStock = {
    id,
    supplierId: data.supplierId,
    productId: data.productId,
    productName: '',
    productSku: '',
    unit: '',
    warehouseId: data.warehouseId || '',
    warehouseName: '',
    availableQty: data.qty,
    lockedQty: 0,
    warnThreshold: 50,
    health: calcHealth(data.qty, 50),
    updatedAt: new Date().toISOString(),
  };
  stocks.unshift(item);
  return delay({ success: true, stockId: id, availableQty: data.qty });
}

export function mockUpdateStockThreshold(id: string, alertQty: number) {
  const item = stocks.find((x) => x.id === id);
  if (item) {
    item.warnThreshold = alertQty;
    item.health = calcHealth(item.availableQty, alertQty);
    item.updatedAt = new Date().toISOString();
  }
  return delay({ success: true });
}

export function mockSupplierStockSummary(supplierId: string) {
  const mine = stocks.filter((x) => x.supplierId === supplierId);
  return delay({
    total: mine.length,
    low: mine.filter((x) => x.health === 'LOW').length,
    out: mine.filter((x) => x.health === 'OUT').length,
  });
}

// ===== 结算 =====
const settlementStatuses: SupplierSettlementStatus[] = ['PENDING', 'PENDING', 'CONFIRMED', 'PAID', 'PAID'];

const settlements: SupplierSettlement[] = Array.from({ length: 14 }, (_, i) => {
  const status = settlementStatuses[i % settlementStatuses.length];
  const monthFrom = (i % 6) + 1;
  return {
    id: `sup-settle-${8000 + i}`,
    settlementNo: `SS${String(20260400 + i).padStart(8, '0')}`,
    supplierId: CURRENT_SUPPLIER_ID,
    periodFrom: `2026-${String(monthFrom).padStart(2, '0')}-01`,
    periodTo: `2026-${String(monthFrom).padStart(2, '0')}-${monthFrom === 2 ? 28 : 30}`,
    orderCount: 8 + (i % 12),
    amount: +((20000 + i * 3500 + Math.random() * 5000) * 1).toFixed(2),
    status,
    generatedAt: `2026-${String(monthFrom + 1).padStart(2, '0')}-01 09:00:00`,
    confirmedAt: status !== 'PENDING' ? `2026-${String(monthFrom + 1).padStart(2, '0')}-03 14:00:00` : undefined,
    paidAt: status === 'PAID' ? `2026-${String(monthFrom + 1).padStart(2, '0')}-08 10:00:00` : undefined,
    remark: i % 5 === 0 ? '含运费补贴' : '',
  };
});

interface SettlementQuery {
  pageNo: number;
  pageSize: number;
  searchInfo?: { status?: string; supplierId?: string };
}

export function mockListSupplierSettlements({ pageNo, pageSize, searchInfo }: SettlementQuery) {
  const sid = searchInfo?.supplierId;
  if (!sid) return delay({ records: [], total: 0 });
  let list = settlements.filter((x) => x.supplierId === sid);
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  return delay(paginate(list, pageNo, pageSize));
}

export function mockConfirmSettlement(id: string) {
  const item = settlements.find((x) => x.id === id);
  if (item && item.status === 'PENDING') {
    item.status = 'CONFIRMED';
    item.confirmedAt = new Date().toISOString();
  }
  return delay({ success: true });
}

export function mockSupplierSettlementSummary(supplierId: string) {
  const mine = settlements.filter((x) => x.supplierId === supplierId);
  return delay({
    pendingAmount: +mine.filter((x) => x.status === 'PENDING').reduce((s, x) => s + x.amount, 0).toFixed(2),
    confirmedAmount: +mine.filter((x) => x.status === 'CONFIRMED').reduce((s, x) => s + x.amount, 0).toFixed(2),
    paidAmount: +mine.filter((x) => x.status === 'PAID').reduce((s, x) => s + x.amount, 0).toFixed(2),
  });
}

// ===== 企业资料 =====
const profile: SupplierProfile = {
  supplierId: CURRENT_SUPPLIER_ID,
  supplierName: '示例供应商有限公司',
  contactPerson: '张采购',
  contactPhone: '13800138000',
  contactEmail: 'supplier@b2b.example.com',
  province: '上海',
  city: '上海市',
  address: '浦东新区张江高科 88 号',
  bankName: '招商银行上海分行',
  bankAccount: '6225 8800 0000 1234',
  taxNo: '91310115MA1K00000X',
  businessLicenseUrl: '',
  description: '专注景区门店食品供应，年销售额过亿。',
  updatedAt: '2026-05-10 10:00:00',
};

export function mockGetSupplierProfile(supplierId: string) {
  if (supplierId !== profile.supplierId) return delay(null);
  return delay({ ...profile });
}

export function mockUpdateSupplierProfile(patch: Partial<SupplierProfile>) {
  Object.assign(profile, patch, { updatedAt: new Date().toISOString() });
  return delay({ success: true });
}
