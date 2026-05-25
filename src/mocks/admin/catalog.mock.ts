/**
 * 平台商品目录 Mock
 */
import type { PlatformCatalog, CatalogStatus } from '/#/b2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const statuses: CatalogStatus[] = ['ON_SHELF', 'ON_SHELF', 'ON_SHELF', 'OFF_SHELF'];

const catalogs: PlatformCatalog[] = Array.from({ length: 42 }, (_, i) => {
  const cost = +(20 + Math.random() * 180).toFixed(2);
  return {
    id: `cat-${4000 + i}`,
    productSku: `SKU${String(60000 + i).padStart(6, '0')}`,
    productName: pick(MOCK_DATA.PRODUCT_NAMES) + ` 规格 ${i + 1}`,
    category: pick(MOCK_DATA.CATEGORIES),
    unit: pick(MOCK_DATA.UNITS),
    salePrice: +(cost * 1.35).toFixed(2),
    bestCostPrice: cost,
    status: statuses[i % statuses.length],
    description: i % 3 === 0 ? '平台精选商品，月销 1000+' : '',
    createdAt: `2026-04-${String((i % 28) + 1).padStart(2, '0')}`,
    updatedAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')}`,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string; category?: string };
}

export function mockListCatalogs({ pageNo, pageSize, searchInfo }: QueryParams) {
  let list = catalogs;
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.category) list = list.filter((x) => x.category === searchInfo.category);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.productSku.toLowerCase().includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockUpdateCatalog(id: string, patch: Partial<PlatformCatalog>) {
  const item = catalogs.find((x) => x.id === id);
  if (item) Object.assign(item, patch, { updatedAt: new Date().toISOString().slice(0, 10) });
  return delay({ success: true });
}

export function mockToggleShelf(id: string, status: CatalogStatus) {
  return mockUpdateCatalog(id, { status });
}
