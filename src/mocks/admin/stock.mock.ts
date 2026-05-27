/**
 * 库存 Mock（管理员视角，对齐后端 /b2b/stock/supplier/list 响应字段）
 */
import type { StockRecord, StockHealthLevel } from '/#/b2b-2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

function calcHealth(available: number, threshold: number): StockHealthLevel {
  if (available <= 0) return 'OUT';
  if (available < threshold) return 'LOW';
  return 'NORMAL';
}

const stocks: StockRecord[] = Array.from({ length: 65 }, (_, i) => {
  const threshold = 50 + (i % 5) * 20;
  const available = i % 7 === 0 ? 0 : i % 5 === 0 ? Math.floor(threshold * 0.6) : 100 + (i % 9) * 80;
  const locked = i % 4 === 0 ? Math.floor(available * 0.1) : 0;

  return {
    id: `stk-${5000 + i}`,
    supplierId: `sup-${String((i % 6) + 1).padStart(3, '0')}`,
    supplierName: pick(MOCK_DATA.SUPPLIER_NAMES) + '有限公司',
    productId: `prod-${String(8000 + i).padStart(4, '0')}`,
    productName: pick(MOCK_DATA.PRODUCT_NAMES),
    alertQty: threshold,
    availableQty: available,
    lockedQty: locked,
    totalQty: available + locked,
    warehouseId: `wh-${String((i % 3) + 1).padStart(4, '0')}`,
    health: calcHealth(available, threshold),
    lastReplenishTime: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:30:00`,
    createTime: `2026-04-${String((i % 28) + 1).padStart(2, '0')} 10:00:00`,
    updateTime: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:30:00`,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  keyword?: string;
  health?: string;
}

export function mockListStocks({ pageNo, pageSize, keyword, health }: QueryParams) {
  let list = stocks;
  if (health) list = list.filter((x) => x.health === health);
  if (keyword) {
    const k = keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.supplierName?.toLowerCase().includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockUpdateStockThreshold(id: string, alertQty: number) {
  const item = stocks.find((x) => x.id === id);
  if (item) {
    item.alertQty = alertQty;
    item.health = calcHealth(item.availableQty, alertQty);
    item.updateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
  return delay({ success: true });
}
