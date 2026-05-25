/**
 * 阶段 3 - 供应商集采订单 Mock
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商订单 Mock
 * - 强制按 supplierId 隔离
 * - 发货 = status 从 CONFIRMED → SHIPPING，写入 carrier/trackingNo
 * - 供应商不可见 saleAmount/profit 等字段
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商订单 Mock
 */
import type { SupplierOrder, SupplierOrderItem, SupplierOrderStatus, ShipParams } from '/#/b2b-supplier';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const CURRENT_SUPPLIER_ID = 'sup-001';

const statuses: SupplierOrderStatus[] = ['TRIGGERED', 'TRIGGERED', 'CONFIRMED', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'COMPLETED', 'CANCELLED'];

function makeItems(seed: number): SupplierOrderItem[] {
  const count = 1 + (seed % 3);
  return Array.from({ length: count }, (_, j) => {
    const qty = 20 + ((seed + j) % 8) * 10;
    const cost = +(30 + ((seed + j) % 6) * 12).toFixed(2);
    return {
      productSku: `SKU${String(60000 + ((seed + j) % 24)).padStart(6, '0')}`,
      productName: pick(MOCK_DATA.PRODUCT_NAMES),
      unit: pick(MOCK_DATA.UNITS),
      qty,
      costPrice: cost,
      subtotal: +(qty * cost).toFixed(2),
    };
  });
}

const orders: SupplierOrder[] = Array.from({ length: 38 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const items = makeItems(i);
  const purchaseAmount = +items.reduce((s, x) => s + x.subtotal, 0).toFixed(2);
  const triggered = `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(9 + (i % 8)).padStart(2, '0')}:00:00`;
  return {
    id: `sup-co-${5000 + i}`,
    collectiveNo: `CO${String(20260500 + i).padStart(8, '0')}`,
    supplierId: CURRENT_SUPPLIER_ID,
    storeOrderCount: 2 + (i % 6),
    status,
    items,
    purchaseAmount,
    carrier: status === 'SHIPPING' || status === 'COMPLETED' ? pick(['顺丰速运', '京东物流', '德邦快递']) : undefined,
    trackingNo: status === 'SHIPPING' || status === 'COMPLETED' ? `SF${Date.now().toString().slice(-10)}${i}` : undefined,
    triggeredAt: triggered,
    confirmedAt: status !== 'TRIGGERED' && status !== 'CANCELLED' ? triggered.replace('09:', '11:') : undefined,
    shippedAt: status === 'SHIPPING' || status === 'COMPLETED' ? triggered.replace('09:', '15:') : undefined,
    completedAt: status === 'COMPLETED' ? `2026-05-${String((i % 24) + 3).padStart(2, '0')} 18:00:00` : undefined,
    remark: i % 7 === 0 ? '需冷链运输' : '',
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string; supplierId?: string; bucket?: 'pending' | 'active' };
}

export function mockListSupplierOrders({ pageNo, pageSize, searchInfo }: QueryParams) {
  const sid = searchInfo?.supplierId;
  if (!sid) return delay({ records: [], total: 0 });
  let list = orders.filter((x) => x.supplierId === sid);

  // 待确认池 / 进行中池
  if (searchInfo?.bucket === 'pending') {
    list = list.filter((x) => x.status === 'TRIGGERED');
  } else if (searchInfo?.bucket === 'active') {
    list = list.filter((x) => x.status === 'CONFIRMED' || x.status === 'SHIPPING' || x.status === 'COMPLETED' || x.status === 'CANCELLED');
  }

  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.collectiveNo.toLowerCase().includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetSupplierOrder(id: string) {
  return delay(orders.find((x) => x.id === id) || null);
}

export function mockConfirmSupplierOrder(id: string) {
  const item = orders.find((x) => x.id === id);
  if (item && item.status === 'TRIGGERED') {
    item.status = 'CONFIRMED';
    item.confirmedAt = new Date().toISOString();
  }
  return delay({ success: true });
}

export function mockRejectSupplierOrder(id: string, reason: string) {
  const item = orders.find((x) => x.id === id);
  if (item && item.status === 'TRIGGERED') {
    item.status = 'CANCELLED';
    item.remark = reason;
  }
  return delay({ success: true });
}

/** 发货：CONFIRMED → SHIPPING，写入承运商与运单号 */
export function mockShipSupplierOrder(params: ShipParams) {
  const item = orders.find((x) => x.id === params.collectiveOrderId);
  if (item && item.status === 'CONFIRMED') {
    item.status = 'SHIPPING';
    item.carrier = params.carrier;
    item.trackingNo = params.trackingNo;
    item.shippedAt = new Date().toISOString();
    if (params.remark) item.remark = params.remark;
  }
  return delay({ success: true });
}

// 供 dashboard 实时统计使用
export function mockSupplierOrderSummary(supplierId: string) {
  const mine = orders.filter((x) => x.supplierId === supplierId);
  return delay({
    triggered: mine.filter((x) => x.status === 'TRIGGERED').length,
    confirmed: mine.filter((x) => x.status === 'CONFIRMED').length,
    shipping: mine.filter((x) => x.status === 'SHIPPING').length,
    completed: mine.filter((x) => x.status === 'COMPLETED').length,
  });
}
