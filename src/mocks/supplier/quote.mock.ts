/**
 * 阶段 3 - 供应商报价 + 自营商品 Mock
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价/商品库 Mock
 * - 强制按 supplierId 隔离：所有列表查询必须传 supplierId，否则返回空
 * - 「上架」= 新增/编辑后状态置为 PENDING，留待平台 QuoteReview 审核
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价/商品库 Mock
 */
import type {
  SupplierProduct,
  SupplierProductStatus,
  SupplierQuoteRecord,
  SupplierQuoteStatus,
  SupplierQuoteCreateParams,
} from '/#/b2b-supplier';
import { paginate, delay, pick, randomId, MOCK_DATA } from '../_helpers';

// 当前登录供应商 ID（与 login.mock 中 supplierId 对齐）
const CURRENT_SUPPLIER_ID = 'sup-001';

// ===== 自营商品库 =====
const productStatuses: SupplierProductStatus[] = ['ON_SHELF', 'ON_SHELF', 'ON_SHELF', 'OFF_SHELF', 'DRAFT'];

const products: SupplierProduct[] = Array.from({ length: 24 }, (_, i) => ({
  id: `sup-prod-${1000 + i}`,
  supplierId: CURRENT_SUPPLIER_ID,
  productSku: `SKU${String(60000 + i).padStart(6, '0')}`,
  productName: pick(MOCK_DATA.PRODUCT_NAMES),
  category: pick(MOCK_DATA.CATEGORIES),
  unit: pick(MOCK_DATA.UNITS),
  defaultCost: +(20 + Math.random() * 180).toFixed(2),
  cover: '',
  description: i % 3 === 0 ? '原产地直供，量大可议' : '',
  status: productStatuses[i % productStatuses.length],
  createdAt: `2026-04-${String((i % 28) + 1).padStart(2, '0')} 09:00:00`,
  updatedAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')} 14:30:00`,
}));

// ===== 报价 =====
const quoteStatuses: SupplierQuoteStatus[] = ['PENDING', 'APPROVED', 'APPROVED', 'APPROVED', 'REJECTED', 'EXPIRED', 'OFF', 'DRAFT'];

const quotes: SupplierQuoteRecord[] = Array.from({ length: 42 }, (_, i) => {
  const prod = products[i % products.length];
  const status = quoteStatuses[i % quoteStatuses.length];
  return {
    id: `sup-quote-${4000 + i}`,
    quoteNo: `Q${String(20260600 + i).padStart(8, '0')}`,
    supplierId: CURRENT_SUPPLIER_ID,
    productId: prod.id,
    productSku: prod.productSku,
    productName: prod.productName,
    unit: prod.unit,
    costPrice: +(prod.defaultCost * (0.92 + Math.random() * 0.16)).toFixed(2),
    validFrom: '2026-05-01',
    validTo: '2026-08-01',
    minQty: [10, 20, 50, 100][i % 4],
    status,
    remark: i % 5 === 0 ? '量大可议' : '',
    rejectReason: status === 'REJECTED' ? '资质材料不全，请补充质检报告' : undefined,
    createdAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(10 + (i % 8)).padStart(2, '0')}:00:00`,
    reviewedAt: status === 'APPROVED' || status === 'REJECTED' ? `2026-05-${String((i % 24) + 2).padStart(2, '0')} 16:00:00` : undefined,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string; supplierId?: string };
}

// ---------- 商品库 ----------
export function mockListSupplierProducts({ pageNo, pageSize, searchInfo }: QueryParams) {
  const sid = searchInfo?.supplierId;
  if (!sid) return delay({ records: [], total: 0 });
  let list = products.filter((x) => x.supplierId === sid);
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.productSku.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockSaveSupplierProduct(payload: Partial<SupplierProduct>) {
  if (payload.id) {
    const item = products.find((x) => x.id === payload.id);
    if (item) Object.assign(item, payload, { updatedAt: new Date().toISOString() });
    return delay({ success: true, id: payload.id });
  }
  const id = randomId('sup-prod-');
  products.unshift({
    id,
    supplierId: CURRENT_SUPPLIER_ID,
    productSku: payload.productSku || `SKU${String(60000 + products.length).padStart(6, '0')}`,
    productName: payload.productName || '',
    category: payload.category || '',
    unit: payload.unit || '箱',
    defaultCost: payload.defaultCost || 0,
    cover: payload.cover || '',
    description: payload.description || '',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return delay({ success: true, id });
}

export function mockToggleProductShelf(id: string, status: SupplierProductStatus) {
  const item = products.find((x) => x.id === id);
  if (item) {
    item.status = status;
    item.updatedAt = new Date().toISOString();
  }
  return delay({ success: true });
}

// ---------- 报价 ----------
export function mockListSupplierQuotes({ pageNo, pageSize, searchInfo }: QueryParams) {
  const sid = searchInfo?.supplierId;
  if (!sid) return delay({ records: [], total: 0 });
  let list = quotes.filter((x) => x.supplierId === sid);
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.quoteNo.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

/**
 * 创建报价 = 提交平台审核：状态置 PENDING
 * 上架审核流复用阶段 2A QuoteReview 页（数据流入待审池）
 */
export function mockCreateSupplierQuote(params: SupplierQuoteCreateParams) {
  const id = randomId('sup-quote-');
  const record: SupplierQuoteRecord = {
    id,
    quoteNo: `Q${String(20260700 + quotes.length).padStart(8, '0')}`,
    supplierId: CURRENT_SUPPLIER_ID,
    productId: params.productId,
    productSku: params.productSku,
    productName: params.productName,
    unit: params.unit,
    costPrice: params.costPrice,
    validFrom: params.validFrom,
    validTo: params.validTo,
    minQty: params.minQty,
    status: 'PENDING',
    remark: params.remark,
    createdAt: new Date().toISOString(),
  };
  quotes.unshift(record);
  return delay({ success: true, id });
}

export function mockUpdateSupplierQuote(id: string, patch: Partial<SupplierQuoteRecord>) {
  const item = quotes.find((x) => x.id === id);
  if (item) {
    Object.assign(item, patch);
    // 编辑后重新提交审核
    if (patch.costPrice !== undefined || patch.validTo !== undefined) {
      item.status = 'PENDING';
      item.reviewedAt = undefined;
    }
  }
  return delay({ success: true });
}

export function mockOffSupplierQuote(id: string) {
  const item = quotes.find((x) => x.id === id);
  if (item) item.status = 'OFF';
  return delay({ success: true });
}

export function mockResubmitSupplierQuote(id: string) {
  const item = quotes.find((x) => x.id === id);
  if (item && (item.status === 'OFF' || item.status === 'REJECTED' || item.status === 'EXPIRED')) {
    item.status = 'PENDING';
    item.reviewedAt = undefined;
    item.rejectReason = undefined;
  }
  return delay({ success: true });
}
