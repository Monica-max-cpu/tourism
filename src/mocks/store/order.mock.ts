/**
 * 阶段 4 - 门店端订单 Mock
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单 Mock
 * - 强制按 storeId 隔离：所有列表查询必须传 storeId，否则返回空
 * - 创建订单 = 状态 PENDING_PAYMENT，等待门店上传支付凭证
 * - 不暴露 supplierId / supplierName / costPrice / profit
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单 Mock
 */
import type {
  StoreViewOrder,
  StoreViewOrderItem,
  StoreViewOrderStatus,
  StoreOrderCreateParams,
  StoreWorkbenchSummary,
} from '/#/b2b-store';
import { paginate, delay, randomId, MOCK_DATA } from '../_helpers';

const CURRENT_STORE_ID = 'str-001';
const CURRENT_STORE_NAME = MOCK_DATA.STORE_NAMES[0];

const statuses: StoreViewOrderStatus[] = [
  'PENDING_PAYMENT',
  'PENDING_CONFIRM',
  'CONFIRMED',
  'SHIPPING',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
];

function genItems(seed: number): StoreViewOrderItem[] {
  const count = 1 + (seed % 4);
  const items: StoreViewOrderItem[] = [];
  for (let i = 0; i < count; i++) {
    const price = +(28 + ((seed + i) * 13) % 360).toFixed(2);
    const qty = 5 + ((seed + i) * 3) % 50;
    items.push({
      productSku: `SKU${String(60000 + (seed + i) % 60).padStart(6, '0')}`,
      productName: MOCK_DATA.PRODUCT_NAMES[(seed + i) % MOCK_DATA.PRODUCT_NAMES.length] + ` 规格 ${((seed + i) % 30) + 1}`,
      unit: MOCK_DATA.UNITS[(seed + i) % MOCK_DATA.UNITS.length],
      qty,
      unitPrice: price,
      subtotal: +(price * qty).toFixed(2),
      cover: `https://placehold.co/120x120/eef2ff/4f46e5?text=SKU${(seed + i) % 60}`,
    });
  }
  return items;
}

const orders: StoreViewOrder[] = Array.from({ length: 36 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const its = genItems(i);
  const total = +its.reduce((s, x) => s + x.subtotal, 0).toFixed(2);
  const day = String((i % 24) + 1).padStart(2, '0');
  return {
    id: `s-ord-${6000 + i}`,
    orderNo: `OD${String(20260500 + i).padStart(8, '0')}`,
    storeId: CURRENT_STORE_ID,
    status,
    items: its,
    totalAmount: total,
    itemCount: its.length,
    receiveAddress: '黄山风景区温泉景区温泉路 88 号',
    receiver: '王经理',
    receiverPhone: '138****5678',
    carrier: ['SHIPPING', 'DELIVERED', 'COMPLETED'].includes(status) ? '顺丰速运' : undefined,
    trackingNo: ['SHIPPING', 'DELIVERED', 'COMPLETED'].includes(status) ? `SF${(20260500000 + i).toString()}` : undefined,
    createdAt: `2026-05-${day} ${String(8 + (i % 12)).padStart(2, '0')}:00:00`,
    paidAt: status !== 'PENDING_PAYMENT' && status !== 'CANCELLED' ? `2026-05-${day} 10:00:00` : undefined,
    confirmedAt: ['CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(status) ? `2026-05-${day} 11:00:00` : undefined,
    shippedAt: ['SHIPPING', 'DELIVERED', 'COMPLETED'].includes(status) ? `2026-05-${day} 14:00:00` : undefined,
    deliveredAt: ['DELIVERED', 'COMPLETED'].includes(status) ? `2026-05-${day} 18:00:00` : undefined,
    completedAt: status === 'COMPLETED' ? `2026-05-${day} 20:00:00` : undefined,
    remark: i % 5 === 0 ? '请尽快发货' : '',
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string; storeId?: string };
}

export function mockListStoreOrders({ pageNo, pageSize, searchInfo }: QueryParams) {
  const sid = searchInfo?.storeId;
  if (!sid) return delay({ records: [], total: 0 });
  let list = orders.filter((x) => x.storeId === sid);
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.orderNo.toLowerCase().includes(k));
  }
  list = [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetStoreOrder(id: string) {
  return delay(orders.find((x) => x.id === id && x.storeId === CURRENT_STORE_ID) || null);
}

export function mockCreateStoreOrder(params: StoreOrderCreateParams) {
  const its: StoreViewOrderItem[] = params.items.map((x) => ({
    productSku: x.productSku,
    productName: x.productName,
    unit: x.unit,
    qty: x.qty,
    unitPrice: x.unitPrice,
    subtotal: +(x.unitPrice * x.qty).toFixed(2),
    cover: x.cover,
  }));
  const total = +its.reduce((s, x) => s + x.subtotal, 0).toFixed(2);
  const id = randomId('s-ord-');
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const order: StoreViewOrder = {
    id,
    orderNo: `OD${Date.now().toString().slice(-10)}`,
    storeId: CURRENT_STORE_ID,
    status: 'PENDING_PAYMENT',
    items: its,
    totalAmount: total,
    itemCount: its.length,
    receiveAddress: params.receiveAddress,
    receiver: params.receiver,
    receiverPhone: params.receiverPhone,
    remark: params.remark,
    createdAt: now,
  };
  orders.unshift(order);
  return delay({ success: true, id, orderNo: order.orderNo, totalAmount: total });
}

export function mockCancelStoreOrder(id: string, reason: string) {
  const item = orders.find((x) => x.id === id && x.storeId === CURRENT_STORE_ID);
  if (item && item.status === 'PENDING_PAYMENT') {
    item.status = 'CANCELLED';
    item.remark = `[门店取消] ${reason}`;
  }
  return delay({ success: true });
}

export function mockConfirmReceive(id: string) {
  const item = orders.find((x) => x.id === id && x.storeId === CURRENT_STORE_ID);
  if (item && item.status === 'DELIVERED') {
    item.status = 'COMPLETED';
    item.completedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return delay({ success: true });
}

/** 内部：标记已支付（由 payment.mock 提交凭证后调用） */
export function _markOrderPaid(orderId: string) {
  const item = orders.find((x) => x.id === orderId);
  if (item && item.status === 'PENDING_PAYMENT') {
    item.status = 'PENDING_CONFIRM';
    item.paidAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
}

export function mockGetStoreWorkbenchSummary(storeId: string) {
  if (!storeId) {
    return delay<StoreWorkbenchSummary>({
      pendingPayment: 0, pendingConfirm: 0, shipping: 0, delivered: 0,
      completed30d: 0, purchaseAmount30d: 0, salesAmount30d: 0,
    });
  }
  const list = orders.filter((x) => x.storeId === storeId);
  const sum: StoreWorkbenchSummary = {
    pendingPayment: list.filter((x) => x.status === 'PENDING_PAYMENT').length,
    pendingConfirm: list.filter((x) => x.status === 'PENDING_CONFIRM').length,
    shipping: list.filter((x) => x.status === 'SHIPPING').length,
    delivered: list.filter((x) => x.status === 'DELIVERED').length,
    completed30d: list.filter((x) => x.status === 'COMPLETED').length,
    purchaseAmount30d: +list
      .filter((x) => ['CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(x.status))
      .reduce((s, x) => s + x.totalAmount, 0)
      .toFixed(2),
    salesAmount30d: 0,
  };
  return delay(sum);
}

export function _getStoreOrdersInternal() {
  return orders;
}

export const __CURRENT_STORE_ID = CURRENT_STORE_ID;
export const __CURRENT_STORE_NAME = CURRENT_STORE_NAME;
