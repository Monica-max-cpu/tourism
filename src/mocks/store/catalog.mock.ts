/**
 * 阶段 4 - 门店端 平台采购目录 Mock
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店采购目录 Mock
 * - 仅暴露 salePrice + 抽象 SKU；绝不出现 costPrice / supplierName / supplierId / profit
 * - 数据语义：来自「平台已审核通过的报价」聚合后形成的对外采购目录
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店采购目录 Mock
 */
import type { StoreCatalogItem } from '/#/b2b-store';
import { paginate, delay, MOCK_DATA } from '../_helpers';

const items: StoreCatalogItem[] = Array.from({ length: 60 }, (_, i) => {
  const name = MOCK_DATA.PRODUCT_NAMES[i % MOCK_DATA.PRODUCT_NAMES.length] + ` 规格 ${(i % 30) + 1}`;
  // 销售价（伪造）= 一个稳定区间内的数值，保证可复现
  const sale = +(28 + ((i * 13) % 360)).toFixed(2);
  return {
    id: `cat-${5000 + i}`,
    productSku: `SKU${String(60000 + i).padStart(6, '0')}`,
    productName: name,
    category: MOCK_DATA.CATEGORIES[i % MOCK_DATA.CATEGORIES.length],
    unit: MOCK_DATA.UNITS[i % MOCK_DATA.UNITS.length],
    salePrice: sale,
    availableQty: 50 + ((i * 7) % 950),
    minQty: [1, 5, 10, 20][i % 4],
    cover: `https://placehold.co/300x300/eef2ff/4f46e5?text=${encodeURIComponent('SKU' + (60000 + i))}`,
    description: i % 3 === 0 ? '原产地直供，平台严选优质货源' : '',
    hot: i % 7 === 0,
    createdAt: `2026-04-${String((i % 28) + 1).padStart(2, '0')} 09:00:00`,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; category?: string; onlyHot?: boolean };
}

export function mockListStoreCatalog({ pageNo, pageSize, searchInfo }: QueryParams) {
  let list = items;
  if (searchInfo?.category) list = list.filter((x) => x.category === searchInfo.category);
  if (searchInfo?.onlyHot) list = list.filter((x) => x.hot);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.productSku.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetCatalogItem(id: string) {
  return delay(items.find((x) => x.id === id) || null);
}

export function mockListHotCatalog(limit = 8) {
  return delay({ records: items.filter((x) => x.hot).slice(0, limit) });
}

/** 减库存（下单成功后调用） */
export function mockReduceCatalogStock(updates: { catalogId: string; qty: number }[]) {
  for (const u of updates) {
    const item = items.find((x) => x.id === u.catalogId);
    if (item) item.availableQty = Math.max(0, item.availableQty - u.qty);
  }
  return delay({ success: true });
}
