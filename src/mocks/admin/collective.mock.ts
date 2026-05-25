/**
 * 集采 Mock
 */
import type { PendingCollectiveItem, CollectiveOrder, CollectiveStatus, CollectiveConfig, CollectiveOrderItem } from '/#/b2b-2c';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const config: CollectiveConfig = {
  qtyThreshold: 100,
  hoursTimeout: 48,
  autoTrigger: true,
};

const pendings: PendingCollectiveItem[] = Array.from({ length: 23 }, (_, i) => {
  const cost = +(20 + (i * 7) % 180).toFixed(2);
  const sale = +(cost * 1.35).toFixed(2);
  const totalQty = 30 + (i * 13) % 200;
  const orderCount = 2 + (i % 6);
  return {
    id: `pc-${9000 + i}`,
    productSku: `SKU${String(60000 + i).padStart(6, '0')}`,
    productName: pick(MOCK_DATA.PRODUCT_NAMES) + ` 规格 ${i + 1}`,
    unit: pick(MOCK_DATA.UNITS),
    orderCount,
    totalQty,
    saleAmount: +(sale * totalQty).toFixed(2),
    bestCostPrice: cost,
    estimatedProfit: +((sale - cost) * totalQty).toFixed(2),
    hoursSinceLast: i % 8 === 0 ? 52 : 8 + (i * 3) % 40,
    reachedThreshold: totalQty >= config.qtyThreshold,
  };
});

const collectiveStatuses: CollectiveStatus[] = ['TRIGGERED', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'COMPLETED', 'CANCELLED'];

function genCollectiveItems(seed: number): CollectiveOrderItem[] {
  const count = 1 + (seed % 3);
  const items: CollectiveOrderItem[] = [];
  for (let i = 0; i < count; i++) {
    const cost = +(20 + ((seed + i) * 11) % 180).toFixed(2);
    const qty = 30 + ((seed + i) * 13) % 200;
    items.push({
      productSku: `SKU${String(60000 + (seed + i) % 42).padStart(6, '0')}`,
      productName: MOCK_DATA.PRODUCT_NAMES[(seed + i) % MOCK_DATA.PRODUCT_NAMES.length] + ` 规格 ${(seed + i) % 42 + 1}`,
      unit: MOCK_DATA.UNITS[(seed + i) % MOCK_DATA.UNITS.length],
      qty,
      costPrice: cost,
      subtotal: +(cost * qty).toFixed(2),
    });
  }
  return items;
}

const collectives: CollectiveOrder[] = Array.from({ length: 38 }, (_, i) => {
  const items = genCollectiveItems(i);
  const status = collectiveStatuses[i % collectiveStatuses.length];
  const purchaseAmount = +items.reduce((s, x) => s + x.subtotal, 0).toFixed(2);
  const saleAmount = +(purchaseAmount * (1.3 + (i % 4) * 0.05)).toFixed(2);
  const triggeredAt = `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:00:00`;
  return {
    id: `co-${7000 + i}`,
    collectiveNo: `CO${String(20260500 + i).padStart(8, '0')}`,
    storeOrderIds: Array.from({ length: 2 + (i % 4) }, (_, k) => `ord-${6000 + i * 4 + k}`),
    storeOrderCount: 2 + (i % 4),
    supplierId: `sup-${100 + (i % 8)}`,
    supplierName: pick(MOCK_DATA.SUPPLIER_NAMES) + '有限公司',
    status,
    items,
    purchaseAmount,
    saleAmount,
    profit: +(saleAmount - purchaseAmount).toFixed(2),
    triggeredAt,
    confirmedAt: ['CONFIRMED', 'SHIPPING', 'COMPLETED'].includes(status) ? `2026-05-${String((i % 24) + 1).padStart(2, '0')} 12:00:00` : undefined,
    shippedAt: ['SHIPPING', 'COMPLETED'].includes(status) ? `2026-05-${String((i % 24) + 2).padStart(2, '0')} 14:00:00` : undefined,
    completedAt: status === 'COMPLETED' ? `2026-05-${String((i % 24) + 4).padStart(2, '0')} 16:00:00` : undefined,
    remark: i % 5 === 0 ? '加急集采' : '',
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string };
}

export function mockListPendingCollective() {
  return delay({ records: pendings, total: pendings.length });
}

export function mockTriggerCollective(ids: string[]) {
  return delay({ success: true, count: ids.length, message: `已为 ${ids.length} 个商品触发集采` });
}

export function mockListCollectiveOrders({ pageNo, pageSize, searchInfo }: QueryParams) {
  let list = collectives;
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.collectiveNo.toLowerCase().includes(k) || x.supplierName.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetCollectiveOrder(id: string) {
  return delay(collectives.find((x) => x.id === id) || null);
}

export function mockGetCollectiveConfig() {
  return delay({ ...config });
}

export function mockUpdateCollectiveConfig(patch: Partial<CollectiveConfig>) {
  Object.assign(config, patch);
  return delay({ success: true });
}
