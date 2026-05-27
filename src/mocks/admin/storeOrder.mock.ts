/**
 * 门店采购订单 Mock（管理员视角）
 * - items 内 unitPrice 仅为销售价（门店看到的价格）
 */
import type { StoreOrder, OrderStatus, StoreOrderItem } from '/#/b2b-2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const statuses: OrderStatus[] = [0, 1, 2, 3, 5, 6];

function genItems(seed: number): StoreOrderItem[] {
  const count = 1 + (seed % 4);
  const items: StoreOrderItem[] = [];
  for (let i = 0; i < count; i++) {
    const price = +(20 + ((seed + i) * 7) % 200).toFixed(2);
    const qty = 5 + ((seed + i) * 3) % 50;
    items.push({
      productSku: `SKU${String(60000 + (seed + i) % 42).padStart(6, '0')}`,
      productName: MOCK_DATA.PRODUCT_NAMES[(seed + i) % MOCK_DATA.PRODUCT_NAMES.length] + ` 规格 ${(seed + i) % 42 + 1}`,
      unit: MOCK_DATA.UNITS[(seed + i) % MOCK_DATA.UNITS.length],
      qty,
      unitPrice: price,
      subtotal: +(price * qty).toFixed(2),
    });
  }
  return items;
}

const orders: StoreOrder[] = Array.from({ length: 78 }, (_, i) => {
  const items = genItems(i);
  const status = statuses[i % statuses.length];
  const total = +items.reduce((s, x) => s + x.subtotal, 0).toFixed(2);
  const created = `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:00:00`;
  return {
    id: `ord-${6000 + i}`,
    orderNo: `OD${String(20260500 + i).padStart(8, '0')}`,
    storeId: `str-${100 + (i % 8)}`,
    storeName: pick(MOCK_DATA.STORE_NAMES),
    orderStatus: status,
    items,
    totalAmount: total,
    itemCount: items.length,
    createdAt: created,
    paidAt: status > 0 && status !== 6 ? `2026-05-${String((i % 24) + 1).padStart(2, '0')} 10:00:00` : undefined,
    confirmedAt: [2, 3, 4, 5].includes(status) ? `2026-05-${String((i % 24) + 2).padStart(2, '0')} 11:00:00` : undefined,
    shippedAt: [3, 4, 5].includes(status) ? `2026-05-${String((i % 24) + 3).padStart(2, '0')} 14:00:00` : undefined,
    completedAt: status === 5 ? `2026-05-${String((i % 24) + 5).padStart(2, '0')} 16:00:00` : undefined,
    collectiveOrderId: [2, 3, 4, 5].includes(status) ? `co-${7000 + (i % 12)}` : undefined,
    remark: i % 5 === 0 ? '加急' : '',
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string };
}

export function mockListStoreOrders({ pageNo, pageSize, searchInfo }: QueryParams) {
  let list = orders;
  if (searchInfo?.status != null && searchInfo?.status !== '') list = list.filter((x) => x.orderStatus === Number(searchInfo.status));
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.orderNo.includes(k) || x.storeName.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetStoreOrder(id: string) {
  return delay(orders.find((x) => x.id === id) || null);
}

export function mockCancelStoreOrder(id: string, reason: string) {
  const item = orders.find((x) => x.id === id);
  if (item && item.orderStatus === 0) {
    item.orderStatus = 6;
    item.remark = `[管理员取消] ${reason}`;
  }
  return delay({ success: true });
}
