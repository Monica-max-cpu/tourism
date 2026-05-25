/**
 * 供应商报价审核 Mock
 */
import type { SupplierQuote, QuoteStatus } from '/#/b2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const statuses: QuoteStatus[] = ['PENDING', 'PENDING', 'APPROVED', 'APPROVED', 'REJECTED', 'EXPIRED'];

const quotes: SupplierQuote[] = Array.from({ length: 56 }, (_, i) => {
  const cost = +(20 + Math.random() * 180).toFixed(2);
  const status = statuses[i % statuses.length];
  return {
    id: `quote-${3000 + i}`,
    quoteNo: `Q${String(20260500 + i).padStart(8, '0')}`,
    supplierId: `sup-${100 + (i % 8)}`,
    supplierName: pick(MOCK_DATA.SUPPLIER_NAMES) + '有限公司',
    productName: pick(MOCK_DATA.PRODUCT_NAMES),
    productSku: `SKU${String(50000 + i).padStart(6, '0')}`,
    unit: pick(MOCK_DATA.UNITS),
    costPrice: cost,
    suggestedPrice: +(cost * (1.2 + Math.random() * 0.3)).toFixed(2),
    validFrom: '2026-05-01',
    validTo: '2026-08-01',
    status,
    remark: i % 4 === 0 ? '量大可议' : '',
    createdAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(10 + (i % 8)).padStart(2, '0')}:00:00`,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string };
}

export function mockListQuotes({ pageNo, pageSize, searchInfo }: QueryParams) {
  let list = quotes;
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.supplierName.toLowerCase().includes(k) || x.quoteNo.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockApproveQuote(id: string) {
  const item = quotes.find((x) => x.id === id);
  if (item) item.status = 'APPROVED';
  return delay({ success: true });
}

export function mockBatchApproveQuotes(ids: string[]) {
  ids.forEach((id) => {
    const item = quotes.find((x) => x.id === id);
    if (item) item.status = 'APPROVED';
  });
  return delay({ success: true, count: ids.length });
}

export function mockRejectQuote(id: string, reason: string) {
  const item = quotes.find((x) => x.id === id);
  if (item) {
    item.status = 'REJECTED';
    item.remark = reason;
  }
  return delay({ success: true });
}
