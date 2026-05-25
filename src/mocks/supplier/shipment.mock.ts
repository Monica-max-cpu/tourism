/**
 * 阶段 3 - 供应商发货任务 Mock
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商发货 Mock
 * 数据来源：从 order.mock 派生（status >= CONFIRMED 的订单生成发货任务）
 * 但为简化 Mock，本文件维护独立列表，发货操作走 order.mock 的 mockShipSupplierOrder
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商发货 Mock
 */
import type { ShipmentRecord, ShipmentStatus, ShipParams } from '/#/b2b-supplier';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const CURRENT_SUPPLIER_ID = 'sup-001';

const statuses: ShipmentStatus[] = ['PENDING', 'PENDING', 'PENDING', 'SHIPPED', 'IN_TRANSIT', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION'];

const shipments: ShipmentRecord[] = Array.from({ length: 32 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const carrier = status === 'PENDING' ? undefined : pick(['顺丰速运', '京东物流', '德邦快递', '中通快递']);
  const trackingNo = status === 'PENDING' ? undefined : `SF${Date.now().toString().slice(-10)}${i}`;
  const productCount = 1 + (i % 3);
  const totalQty = 20 + ((i % 8) * 15);
  return {
    id: `sup-ship-${9000 + i}`,
    shipmentNo: `SH${String(20260500 + i).padStart(8, '0')}`,
    supplierId: CURRENT_SUPPLIER_ID,
    collectiveOrderId: `sup-co-${5000 + (i % 38)}`,
    collectiveNo: `CO${String(20260500 + (i % 38)).padStart(8, '0')}`,
    productSummary: productCount === 1 ? pick(MOCK_DATA.PRODUCT_NAMES) : `${pick(MOCK_DATA.PRODUCT_NAMES)} 等 ${productCount} 项`,
    totalQty,
    carrier,
    trackingNo,
    status,
    shippedAt: status !== 'PENDING' ? `2026-05-${String((i % 24) + 1).padStart(2, '0')} 14:00:00` : undefined,
    deliveredAt: status === 'DELIVERED' ? `2026-05-${String((i % 24) + 3).padStart(2, '0')} 16:30:00` : undefined,
    exceptionReason: status === 'EXCEPTION' ? '门店暂时无法签收，已联系协调' : undefined,
    remark: i % 6 === 0 ? '需冷链' : '',
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string; supplierId?: string };
}

export function mockListShipments({ pageNo, pageSize, searchInfo }: QueryParams) {
  const sid = searchInfo?.supplierId;
  if (!sid) return delay({ records: [], total: 0 });
  let list = shipments.filter((x) => x.supplierId === sid);
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.collectiveNo.toLowerCase().includes(k) || x.shipmentNo.toLowerCase().includes(k) || (x.trackingNo || '').includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

/** 发货登记：PENDING → SHIPPED，写入承运商/运单号 */
export function mockShipShipment(params: ShipParams) {
  const item = shipments.find((x) => x.collectiveOrderId === params.collectiveOrderId && item_isPending(x.status));
  if (item) {
    item.status = 'SHIPPED';
    item.carrier = params.carrier;
    item.trackingNo = params.trackingNo;
    item.shippedAt = new Date().toISOString();
    if (params.remark) item.remark = params.remark;
  }
  return delay({ success: true });
}

function item_isPending(s: ShipmentStatus) {
  return s === 'PENDING';
}

export function mockUpdateTracking(id: string, carrier: string, trackingNo: string) {
  const item = shipments.find((x) => x.id === id);
  if (item) {
    item.carrier = carrier;
    item.trackingNo = trackingNo;
  }
  return delay({ success: true });
}

export function mockSupplierShipmentSummary(supplierId: string) {
  const mine = shipments.filter((x) => x.supplierId === supplierId);
  return delay({
    pending: mine.filter((x) => x.status === 'PENDING').length,
    shipped: mine.filter((x) => x.status === 'SHIPPED' || x.status === 'IN_TRANSIT').length,
    delivered: mine.filter((x) => x.status === 'DELIVERED').length,
    exception: mine.filter((x) => x.status === 'EXCEPTION').length,
  });
}
