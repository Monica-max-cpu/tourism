/**
 * 履约 / 结算 / 利润 Mock
 */
import type { DeliveryRecord, DeliveryStatus, SettlementRecord, SettlementStatus, SettlementType, ProfitRecord } from '/#/b2b-2c';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

// ====== 履约 ======
const deliveryStatuses: DeliveryStatus[] = ['PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'DELIVERED', 'EXCEPTION'];
const carriers = ['顺丰速运', '京东物流', '中通快递', '德邦快运', '安能物流'];

const deliveries: DeliveryRecord[] = Array.from({ length: 64 }, (_, i) => {
  const status = deliveryStatuses[i % deliveryStatuses.length];
  return {
    id: `dlv-${10000 + i}`,
    deliveryNo: `DLV${String(20260500 + i).padStart(8, '0')}`,
    collectiveOrderId: `co-${7000 + (i % 38)}`,
    collectiveNo: `CO${String(20260500 + (i % 38)).padStart(8, '0')}`,
    supplierName: pick(MOCK_DATA.SUPPLIER_NAMES) + '有限公司',
    storeOrderNo: `OD${String(20260500 + i).padStart(8, '0')}`,
    storeName: pick(MOCK_DATA.STORE_NAMES),
    carrier: pick(carriers),
    trackingNo: `SF${Date.now()}${i}`,
    status,
    exceptionReason: status === 'EXCEPTION' ? '收货方拒收' : '',
    shippedAt: status !== 'PENDING' ? `2026-05-${String((i % 24) + 1).padStart(2, '0')} 09:00:00` : undefined,
    deliveredAt: status === 'DELIVERED' ? `2026-05-${String((i % 24) + 2).padStart(2, '0')} 14:00:00` : undefined,
    estimatedAt: `2026-05-${String((i % 24) + 2).padStart(2, '0')} 18:00:00`,
    remark: '',
  };
});

interface DeliveryQuery { pageNo: number; pageSize: number; searchInfo?: { keyword?: string; status?: string } }

export function mockListDeliveries({ pageNo, pageSize, searchInfo }: DeliveryQuery) {
  let list = deliveries;
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.deliveryNo.toLowerCase().includes(k) || x.storeName.includes(k) || x.supplierName.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockHandleDeliveryException(id: string, action: 'retry' | 'cancel', remark: string) {
  const item = deliveries.find((x) => x.id === id);
  if (item) {
    if (action === 'retry') {
      item.status = 'IN_TRANSIT';
      item.exceptionReason = '';
    } else {
      item.exceptionReason = remark;
    }
    item.remark = `[处理] ${action === 'retry' ? '重新派送' : '取消配送'}: ${remark}`;
  }
  return delay({ success: true });
}

// ====== 结算 ======
const settlementStatuses: SettlementStatus[] = ['PENDING', 'PENDING', 'CONFIRMED', 'PAID', 'PAID'];

function genSettlements(type: SettlementType, count: number, idStart: number): SettlementRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const status = settlementStatuses[i % settlementStatuses.length];
    const partyName = type === 'STORE' ? pick(MOCK_DATA.STORE_NAMES) : pick(MOCK_DATA.SUPPLIER_NAMES) + '有限公司';
    const generatedAt = `2026-05-${String((i % 24) + 1).padStart(2, '0')} 00:00:00`;
    return {
      id: `stl-${idStart + i}`,
      settlementNo: `${type === 'STORE' ? 'STS' : 'SPS'}${String(20260500 + i).padStart(8, '0')}`,
      type,
      partyName,
      partyId: `${type.toLowerCase()}-${100 + (i % 10)}`,
      periodFrom: '2026-04-01',
      periodTo: '2026-04-30',
      orderCount: 8 + (i * 3) % 30,
      amount: +(8000 + (i * 137) % 80000).toFixed(2),
      status,
      generatedAt,
      confirmedAt: status !== 'PENDING' ? `2026-05-${String((i % 24) + 2).padStart(2, '0')} 10:00:00` : undefined,
      paidAt: status === 'PAID' ? `2026-05-${String((i % 24) + 3).padStart(2, '0')} 11:00:00` : undefined,
      remark: '',
    };
  });
}

const storeSettlements = genSettlements('STORE', 42, 11000);
const supplierSettlements = genSettlements('SUPPLIER', 38, 12000);

interface SettlementQuery { pageNo: number; pageSize: number; searchInfo?: { keyword?: string; status?: string } }

export function mockListStoreSettlements({ pageNo, pageSize, searchInfo }: SettlementQuery) {
  let list = storeSettlements;
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.settlementNo.toLowerCase().includes(k) || x.partyName.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockListSupplierSettlements({ pageNo, pageSize, searchInfo }: SettlementQuery) {
  let list = supplierSettlements;
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.settlementNo.toLowerCase().includes(k) || x.partyName.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockPaySettlement(id: string) {
  const item = storeSettlements.find((x) => x.id === id) || supplierSettlements.find((x) => x.id === id);
  if (item && item.status === 'CONFIRMED') {
    item.status = 'PAID';
    item.paidAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return delay({ success: true });
}

// ====== 利润 ======
const profits: ProfitRecord[] = Array.from({ length: 80 }, (_, i) => {
  const cost = +(20 + (i * 7) % 180).toFixed(2);
  const sale = +(cost * (1.25 + (i % 5) * 0.05)).toFixed(2);
  const qty = 20 + (i * 11) % 150;
  const profitPerUnit = +(sale - cost).toFixed(2);
  return {
    id: `pft-${13000 + i}`,
    collectiveNo: `CO${String(20260500 + (i % 38)).padStart(8, '0')}`,
    productSku: `SKU${String(60000 + (i % 42)).padStart(6, '0')}`,
    productName: pick(MOCK_DATA.PRODUCT_NAMES) + ` 规格 ${(i % 42) + 1}`,
    qty,
    unit: pick(MOCK_DATA.UNITS),
    salePrice: sale,
    costPrice: cost,
    profitPerUnit,
    saleAmount: +(sale * qty).toFixed(2),
    costAmount: +(cost * qty).toFixed(2),
    profit: +(profitPerUnit * qty).toFixed(2),
    profitRate: +(((sale - cost) / sale) * 100).toFixed(1),
    postedAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(10 + (i % 8)).padStart(2, '0')}:00:00`,
  };
});

interface ProfitQuery { pageNo: number; pageSize: number; searchInfo?: { keyword?: string } }

export function mockListProfits({ pageNo, pageSize, searchInfo }: ProfitQuery) {
  let list = profits;
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.collectiveNo.toLowerCase().includes(k) || x.productSku.toLowerCase().includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetProfitSummary() {
  const totalSale = profits.reduce((s, x) => s + x.saleAmount, 0);
  const totalCost = profits.reduce((s, x) => s + x.costAmount, 0);
  const totalProfit = totalSale - totalCost;
  return delay({
    totalSale: +totalSale.toFixed(2),
    totalCost: +totalCost.toFixed(2),
    totalProfit: +totalProfit.toFixed(2),
    profitRate: +((totalProfit / totalSale) * 100).toFixed(1),
    orderCount: profits.length,
  });
}
