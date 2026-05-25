/**
 * 库存 Mock（管理员视角，可看全部归属类型）
 */
import type { StockRecord, StockHealthLevel, StockOwnerType } from '/#/b2b-2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const owners: StockOwnerType[] = ['PLATFORM', 'SUPPLIER', 'STORE'];

function calcHealth(qty: number, threshold: number): StockHealthLevel {
  if (qty <= 0) return 'OUT';
  if (qty < threshold) return 'LOW';
  return 'NORMAL';
}

const stocks: StockRecord[] = Array.from({ length: 65 }, (_, i) => {
  const owner = owners[i % owners.length];
  const ownerName =
    owner === 'PLATFORM' ? '平台中心仓' :
      owner === 'SUPPLIER' ? pick(MOCK_DATA.SUPPLIER_NAMES) + '有限公司' :
        pick(MOCK_DATA.STORE_NAMES);

  const threshold = 50 + (i % 5) * 20;
  const available = i % 7 === 0 ? 0 : i % 5 === 0 ? Math.floor(threshold * 0.6) : 100 + (i % 9) * 80;

  return {
    id: `stk-${5000 + i}`,
    productSku: `SKU${String(60000 + (i % 42)).padStart(6, '0')}`,
    productName: pick(MOCK_DATA.PRODUCT_NAMES) + ` 规格 ${(i % 42) + 1}`,
    category: pick(MOCK_DATA.CATEGORIES),
    unit: pick(MOCK_DATA.UNITS),
    ownerType: owner,
    ownerName,
    ownerId: `${owner.toLowerCase()}-${i}`,
    warehouseName: owner === 'PLATFORM' ? '上海中心仓' : owner === 'SUPPLIER' ? '默认仓' : '门店仓',
    availableQty: available,
    lockedQty: i % 4 === 0 ? Math.floor(available * 0.1) : 0,
    warnThreshold: threshold,
    health: calcHealth(available, threshold),
    updatedAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:30:00`,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; ownerType?: string; health?: string };
}

export function mockListStocks({ pageNo, pageSize, searchInfo }: QueryParams) {
  let list = stocks;
  if (searchInfo?.ownerType) list = list.filter((x) => x.ownerType === searchInfo.ownerType);
  if (searchInfo?.health) list = list.filter((x) => x.health === searchInfo.health);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.productSku.toLowerCase().includes(k) || x.ownerName.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockUpdateStockThreshold(id: string, threshold: number) {
  const item = stocks.find((x) => x.id === id);
  if (item) {
    item.warnThreshold = threshold;
    item.health = calcHealth(item.availableQty, threshold);
  }
  return delay({ success: true });
}
