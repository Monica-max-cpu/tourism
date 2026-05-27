/**
 * 阶段 4 - 门店端 平台采购目录 Mock
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】对齐合约字段、去 searchInfo、加 minPrice/maxPrice
 * update-end--author:claude---date:2026-05-26---for:【阶段7】对齐合约字段、去 searchInfo、加 minPrice/maxPrice
 */
import type { StoreCatalogItem } from '/#/b2b-store';
import { paginate, delay, MOCK_DATA } from '../_helpers';

function makeTiers(basePrice: number) {
  return [
    { minQty: 5, maxQty: 19, unitPrice: basePrice },
    { minQty: 20, maxQty: 99, unitPrice: +(basePrice * 0.94).toFixed(2) },
    { minQty: 100, maxQty: null as number | null, unitPrice: +(basePrice * 0.89).toFixed(2) },
  ];
}

const items: StoreCatalogItem[] = Array.from({ length: 60 }, (_, i) => {
  const basePrice = +(28 + ((i * 13) % 360)).toFixed(2);
  return {
    id: `catalog-${5000 + i}`,
    productName: MOCK_DATA.PRODUCT_NAMES[i % MOCK_DATA.PRODUCT_NAMES.length] + ` 规格 ${(i % 30) + 1}`,
    productImages: `["https://placehold.co/600x600/eef2ff/4f46e5?text=P${60000 + i}"]`,
    categoryId: `cat_00${(i % 8) + 1}`,
    unit: MOCK_DATA.UNITS[i % MOCK_DATA.UNITS.length],
    basePrice,
    minOrderQty: [1, 5, 10, 20][i % 4],
    status: (i % 7 === 0 ? 0 : 1) as 0 | 1 | 2,
    sortOrder: i + 1,
    description: i % 3 === 0 ? '原产地直供，平台严选优质货源' : '',
    catalogTiers: i % 3 === 0 ? makeTiers(basePrice) : undefined,
  };
});

export function mockListStoreCatalog(params: any) {
  let list = items;
  if (params.categoryId) list = list.filter((x) => x.categoryId === params.categoryId);
  if (params.productName) {
    const k = params.productName.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k));
  }
  if (params.minPrice) list = list.filter((x) => x.basePrice >= Number(params.minPrice));
  if (params.maxPrice) list = list.filter((x) => x.basePrice <= Number(params.maxPrice));
  return delay(paginate(list, params.pageNo, params.pageSize));
}

export function mockGetCatalogItem(id: string) {
  return delay(items.find((x) => x.id === id) || null);
}

export function mockListHotCatalog(limit = 8) {
  return delay({ records: items.slice(0, limit) });
}

export function mockReduceCatalogStock(updates: { catalogId: string; qty: number }[]) {
  return delay({ success: true });
}
