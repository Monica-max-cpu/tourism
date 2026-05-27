/**
 * 供应商报价审核 Mock — 对齐 b2b-api-contract.md 5.2
 * status: 0=待审 1=已生效 2=已过期 3=已撤回
 */
import type { SupplierQuote } from '/#/b2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const statuses = [0, 0, 1, 1, 2, 3] as const;

const quotes: SupplierQuote[] = Array.from({ length: 56 }, (_, i) => {
  const price = +(20 + Math.random() * 180).toFixed(2);
  const status = statuses[i % statuses.length];
  return {
    id: `quote-${3000 + i}`,
    supplierId: `sup-${100 + (i % 8)}`,
    supplierName: pick(MOCK_DATA.SUPPLIER_NAMES) + '有限公司',
    productId: `prod-${5000 + i}`,
    productName: pick(MOCK_DATA.PRODUCT_NAMES),
    minOrderQty: [10, 20, 50, 100][i % 4],
    basePrice: price,
    validFrom: '2026-05-01',
    validTo: '2026-08-01',
    leadTimeDays: [3, 5, 7][i % 3],
    status,
    statusLabel: ['待平台审核', '已生效', '已过期', '已撤回'][status],
    tiers: i % 3 === 0
      ? [
          { id: `tier-${i}-1`, minQty: 10, maxQty: 49, unitPrice: price },
          { id: `tier-${i}-2`, minQty: 50, maxQty: 199, unitPrice: +(price * 0.95).toFixed(2) },
          { id: `tier-${i}-3`, minQty: 200, maxQty: null as number | null, unitPrice: +(price * 0.90).toFixed(2) },
        ]
      : undefined,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  [key: string]: any;
}

export function mockListQuotes({ pageNo, pageSize, keyword, status }: QueryParams) {
  let list = quotes;
  if (status) list = list.filter((x) => x.status === Number(status));
  if (keyword) {
    const k = keyword.toLowerCase();
    list = list.filter((x) => x.productName.toLowerCase().includes(k) || x.supplierName.toLowerCase().includes(k) || x.id.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockApproveQuote(id: string) {
  const item = quotes.find((x) => x.id === id);
  if (item) { item.status = 1; item.statusLabel = '已生效'; }
  return delay({ success: true });
}

export function mockBatchApproveQuotes(ids: string[]) {
  ids.forEach((id) => {
    const item = quotes.find((x) => x.id === id);
    if (item) { item.status = 1; item.statusLabel = '已生效'; }
  });
  return delay({ success: true, count: ids.length });
}

export function mockRejectQuote(id: string, reason: string) {
  const item = quotes.find((x) => x.id === id);
  if (item) { item.status = 2; item.statusLabel = '已过期'; }
  return delay({ success: true });
}

export function mockOffQuote(id: string) {
  const item = quotes.find((x) => x.id === id);
  if (!item) return delay({ success: false, message: '报价不存在' });
  if (item.status !== 1) {
    return delay({ success: false, code: 400, message: '仅已生效的报价可由平台撤回' });
  }
  item.status = 3; item.statusLabel = '已撤回';
  return delay({ success: true });
}

/** 返回所有已生效报价，供目录商品选择优选报价下拉 */
export function mockListApprovedQuotesForSelect() {
  const list = quotes
    .filter((x) => x.status === 1)
    .map((x) => ({
      id: x.id,
      supplierId: x.supplierId,
      supplierName: x.supplierName,
      productName: x.productName,
      minOrderQty: x.minOrderQty,
      basePrice: x.basePrice,
    }));
  return delay(list);
}
