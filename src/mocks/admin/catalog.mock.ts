/**
 * 平台商品目录 Mock — 对齐 b2b-api-contract.md v1.0
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】对齐合约字段，去 searchInfo，新增 addCatalog
 * update-end--author:claude---date:2026-05-26---for:【阶段7】对齐合约字段，去 searchInfo，新增 addCatalog
 */
import type { PlatformCatalog, CatalogStatus } from '/#/b2b';
import { paginate, delay, pick, randomId, MOCK_DATA } from '../_helpers';

const statuses: CatalogStatus[] = [1, 1, 1, 0, 1, 2];

const PREFERRED_SUPPLIERS = ['山西晋商食品有限公司', '太原老字号调味品厂', '平遥冠云牛肉集团'];

function makeCatalogTiers(basePrice: number) {
  return [
    { minQty: 5, maxQty: 19, unitPrice: basePrice },
    { minQty: 20, maxQty: 99, unitPrice: +(basePrice * 0.94).toFixed(2) },
    { minQty: 100, maxQty: null as number | null, unitPrice: +(basePrice * 0.89).toFixed(2) },
  ];
}

const catalogs: PlatformCatalog[] = Array.from({ length: 42 }, (_, i) => {
  const supplierBasePrice = +(20 + Math.random() * 180).toFixed(2);
  const basePrice = +(supplierBasePrice * 1.35).toFixed(2);
  const status = statuses[i % statuses.length];
  return {
    id: `catalog-${4000 + i}`,
    productName: pick(MOCK_DATA.PRODUCT_NAMES) + ` 规格 ${i + 1}`,
    productImages: i % 2 === 0 ? '["https://oss.example.com/catalog/img/1.jpg"]' : '',
    categoryId: `cat_00${(i % 8) + 1}`,
    unit: pick(MOCK_DATA.UNITS),
    basePrice,
    minOrderQty: [1, 5, 10, 20][i % 4],
    commissionRate: 0,
    preferredQuoteId: `quote-${5000 + i}`,
    preferredSupplierName: PREFERRED_SUPPLIERS[i % PREFERRED_SUPPLIERS.length],
    supplierBasePrice,
    margin: +(basePrice - supplierBasePrice).toFixed(2),
    marginRate: +((basePrice - supplierBasePrice) / basePrice).toFixed(4),
    status,
    sortOrder: i + 1,
    description: i % 3 === 0 ? '平台精选商品，月销 1000+' : '',
    catalogTiers: i % 2 === 0 ? makeCatalogTiers(basePrice) : undefined,
    createTime: `2026-04-${String((i % 28) + 1).padStart(2, '0')} 10:00:00`,
    updateTime: `2026-05-${String((i % 24) + 1).padStart(2, '0')} 14:00:00`,
  };
});

export function mockListCatalogs(params: any) {
  let list = catalogs;
  if (params.status) list = list.filter((x) => String(x.status) === String(params.status));
  if (params.categoryId) list = list.filter((x) => x.categoryId === params.categoryId);
  if (params.keyword) {
    const k = params.keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k));
  }
  return delay(paginate(list, params.pageNo, params.pageSize));
}

export function mockAddCatalog(payload: Partial<PlatformCatalog>) {
  const id = randomId('catalog-');
  const record: PlatformCatalog = {
    id,
    productName: payload.productName || '',
    productImages: payload.productImages || '',
    categoryId: payload.categoryId || '',
    unit: payload.unit || '',
    basePrice: payload.basePrice || 0,
    minOrderQty: payload.minOrderQty ?? 1,
    commissionRate: payload.commissionRate ?? 0,
    preferredQuoteId: payload.preferredQuoteId || '',
    preferredSupplierName: '',
    supplierBasePrice: 0,
    margin: 0,
    marginRate: 0,
    status: 0,
    sortOrder: payload.sortOrder ?? catalogs.length + 1,
    description: payload.description || '',
    catalogTiers: (payload as any).catalogTiers,
    createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
  catalogs.unshift(record);
  return delay({ success: true, id });
}

export function mockUpdateCatalog(id: string, patch: Partial<PlatformCatalog>) {
  const item = catalogs.find((x) => x.id === id);
  if (item) {
    Object.assign(item, patch, { updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ') });
  }
  return delay({ success: true });
}

export function mockToggleShelf(id: string, status: CatalogStatus) {
  return mockUpdateCatalog(id, { status });
}
