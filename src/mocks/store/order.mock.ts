/**
 * 阶段 4 - 门店端订单 Mock
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】订单字段对齐 contract 9.2 / 9.3
 * - 状态改为数值 0-8
 * - 字段名对齐: orderStatus / createTime / storeName / paidAmount / paymentMethod
 * - 详情接口返回 deliveryAddress 对象 + deliveries 数组
 * update-end--author:claude---date:2026-05-26---for:【阶段7】订单字段对齐 contract 9.2 / 9.3
 */
import type {
  StoreViewOrder,
  StoreViewOrderItem,
  DeliveryInfo,
  StoreOrderStatus,
  StoreOrderCreateParams,
  StoreWorkbenchSummary,
} from '/#/b2b-store';
import { paginate, delay, randomId, MOCK_DATA } from '../_helpers';

const CURRENT_STORE_ID = 'str-001';
const CURRENT_STORE_NAME = MOCK_DATA.STORE_NAMES[0];

const statuses: StoreOrderStatus[] = [0, 0, 1, 2, 3, 3, 4, 5, 6];

function genItems(seed: number): StoreViewOrderItem[] {
  const count = 1 + (seed % 4);
  const items: StoreViewOrderItem[] = [];
  for (let i = 0; i < count; i++) {
    const catalogPrice = +(28 + ((seed + i) * 13) % 360).toFixed(2);
    const actualPrice = +(catalogPrice * (0.85 + (seed % 3) * 0.05)).toFixed(2);
    const quantity = 5 + ((seed + i) * 3) % 50;
    items.push({
      id: `oi-${6000 + seed}-${i}`,
      catalogId: `cat-${String(60000 + (seed + i) % 60).padStart(6, '0')}`,
      productName: MOCK_DATA.PRODUCT_NAMES[(seed + i) % MOCK_DATA.PRODUCT_NAMES.length] + ` 规格 ${((seed + i) % 30) + 1}`,
      spec: `${((seed + i) % 10) + 1}×${MOCK_DATA.UNITS[(seed + i) % MOCK_DATA.UNITS.length]}`,
      unit: MOCK_DATA.UNITS[(seed + i) % MOCK_DATA.UNITS.length],
      quantity,
      catalogPrice,
      actualPrice,
      subtotal: +(actualPrice * quantity).toFixed(2),
      receivedQty: 0,
    });
  }
  return items;
}

const orders: StoreViewOrder[] = Array.from({ length: 36 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const its = genItems(i);
  const total = +its.reduce((s, x) => s + x.subtotal, 0).toFixed(2);
  const day = String((i % 24) + 1).padStart(2, '0');
  const hasPayment = status !== 0 && status !== 6;
  return {
    id: `s-ord-${6000 + i}`,
    orderNo: `OD${String(20260500 + i).padStart(8, '0')}`,
    storeId: CURRENT_STORE_ID,
    storeName: CURRENT_STORE_NAME,
    orderStatus: status,
    statusLabel: ['待支付', '已支付，待集采', '集采中', '发货中', '部分收货', '已完成', '已取消', '退款中', '已退款'][status],
    items: its,
    totalAmount: total,
    paidAmount: hasPayment ? total : undefined,
    paymentMethod: hasPayment ? 'OFFLINE' : undefined,
    paymentTime: hasPayment ? `2026-05-${day} 10:00:00` : undefined,
    itemCount: its.length,
    deliveryAddress: {
      receiverName: '王经理',
      receiverPhone: '138****5678',
      province: '安徽省',
      city: '黄山市',
      address: '黄山风景区温泉景区温泉路 88 号',
    },
    deliveries: [3, 4, 5].includes(status)
      ? [{
          deliveryNo: `DL${String(20260500 + i).padStart(8, '0')}`,
          status: 1,
          statusLabel: '已发货',
          deliveryQty: its.reduce((s, x) => s + x.quantity, 0),
          logisticsCompany: '顺丰速运',
          trackingNo: `SF${(20260500000 + i).toString()}`,
          shippedTime: `2026-05-${day} 14:00:00`,
        }]
      : undefined,
    remark: i % 5 === 0 ? '请尽快发货' : '',
    createTime: `2026-05-${day} ${String(8 + (i % 12)).padStart(2, '0')}:00:00`,
    expiredTime: status === 0 ? `2026-05-${String((i % 24) + 2).padStart(2, '0')} 08:00:00` : undefined,
    rejectReason: i % 11 === 0 ? '凭证金额与订单金额不一致' : undefined,
  };
});

export function mockListStoreOrders(params: any) {
  const sid = params.storeId;
  if (!sid) return delay({ records: [], total: 0 });
  let list = orders.filter((x) => x.storeId === sid);
  if (params.orderStatus !== undefined && params.orderStatus !== '') {
    list = list.filter((x) => x.orderStatus === Number(params.orderStatus));
  }
  if (params.orderNo) {
    const k = params.orderNo.toLowerCase();
    list = list.filter((x) => x.orderNo.toLowerCase().includes(k));
  }
  list = [...list].sort((a, b) => (a.createTime < b.createTime ? 1 : -1));
  return delay(paginate(list, params.pageNo, params.pageSize));
}

export function mockGetStoreOrder(id: string) {
  return delay(orders.find((x) => x.id === id && x.storeId === CURRENT_STORE_ID) || null);
}

export function mockCreateStoreOrder(params: StoreOrderCreateParams) {
  const catalogPrice = +(28 + Math.random() * 360).toFixed(2);
  const actualPrice = +(catalogPrice * 0.9).toFixed(2);
  const its: StoreViewOrderItem[] = params.items.map((x, i) => ({
    id: `oi-new-${i}`,
    catalogId: x.catalogId,
    productName: MOCK_DATA.PRODUCT_NAMES[i % MOCK_DATA.PRODUCT_NAMES.length],
    spec: '',
    unit: MOCK_DATA.UNITS[i % MOCK_DATA.UNITS.length],
    quantity: x.quantity,
    catalogPrice,
    actualPrice,
    subtotal: +(actualPrice * x.quantity).toFixed(2),
    receivedQty: 0,
  }));
  const total = +its.reduce((s, x) => s + x.subtotal, 0).toFixed(2);
  const id = randomId('s-ord-');
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const expired = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  const order: StoreViewOrder = {
    id,
    orderNo: `OD${Date.now().toString().slice(-10)}`,
    storeId: params.storeId || CURRENT_STORE_ID,
    storeName: CURRENT_STORE_NAME,
    orderStatus: 0,
    statusLabel: '待支付',
    items: its,
    totalAmount: total,
    itemCount: its.length,
    deliveryAddress: params.deliveryAddress,
    remark: params.remark,
    createTime: now,
    expiredTime: expired,
  };
  orders.unshift(order);
  return delay({ success: true, id, orderNo: order.orderNo, totalAmount: total });
}

export function mockCancelStoreOrder(id: string, reason: string) {
  const item = orders.find((x) => x.id === id && x.storeId === CURRENT_STORE_ID);
  if (item && item.orderStatus === 0) {
    item.orderStatus = 6;
    item.statusLabel = '已取消';
    item.remark = `[门店取消] ${reason}`;
  }
  return delay({ success: true });
}

export function mockConfirmReceive(id: string) {
  const item = orders.find((x) => x.id === id && x.storeId === CURRENT_STORE_ID);
  if (item && item.orderStatus === 3) {
    item.orderStatus = 5;
    item.statusLabel = '已完成';
  }
  return delay({ success: true });
}

/** 内部：标记已支付（由 payment.mock 提交凭证后调用） */
export function _markOrderPaid(orderId: string) {
  const item = orders.find((x) => x.id === orderId);
  if (item && item.orderStatus === 0) {
    item.orderStatus = 1;
    item.statusLabel = '已支付，待集采';
    item.paymentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    item.paidAmount = item.totalAmount;
    item.paymentMethod = 'OFFLINE';
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
    pendingPayment: list.filter((x) => x.orderStatus === 0).length,
    pendingConfirm: list.filter((x) => x.orderStatus === 1).length,
    shipping: list.filter((x) => x.orderStatus === 3).length,
    delivered: list.filter((x) => x.orderStatus === 4).length,
    completed30d: list.filter((x) => x.orderStatus === 5).length,
    purchaseAmount30d: +list
      .filter((x) => [2, 3, 4, 5].includes(x.orderStatus))
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
