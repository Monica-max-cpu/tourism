/**
 * 供应商入驻审核 Mock
 */
import type { SupplierApply, ApplyStatus } from '/#/b2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const statuses: ApplyStatus[] = ['PENDING', 'PENDING', 'PENDING', 'APPROVED', 'REJECTED'];

const supplierApplies: SupplierApply[] = Array.from({ length: 47 }, (_, i) => {
  const name = `${pick(MOCK_DATA.SUPPLIER_NAMES)}有限公司 #${i + 1}`;
  const status = statuses[i % statuses.length];
  return {
    id: `sup-apply-${1000 + i}`,
    applyNo: `SUP${String(20260500 + i).padStart(8, '0')}`,
    supplierName: name,
    contactPerson: pick(['张伟', '李娜', '王强', '刘洋', '陈思']),
    contactPhone: `138${String(10000000 + i * 137).slice(0, 8)}`,
    contactEmail: `contact${i}@example.com`,
    province: pick(MOCK_DATA.PROVINCES),
    city: '主城区',
    address: '示例路 ' + (100 + i) + ' 号',
    status,
    remark: i % 3 === 0 ? '主营高端食材，已合作 3 家头部连锁' : '',
    rejectReason: status === 'REJECTED' ? '资质材料不全' : '',
    createdAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:30:00`,
    reviewedAt: status !== 'PENDING' ? `2026-05-${String((i % 24) + 2).padStart(2, '0')} 14:20:00` : undefined,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string };
}

export function mockListSupplierApply({ pageNo, pageSize, searchInfo }: QueryParams) {
  let list = supplierApplies;
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.supplierName.toLowerCase().includes(k) || x.applyNo.includes(k) || x.contactPhone.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetSupplierApply(id: string): Promise<SupplierApply | null> {
  return delay(supplierApplies.find((x) => x.id === id) || null);
}

export function mockApproveSupplierApply(id: string) {
  const item = supplierApplies.find((x) => x.id === id);
  if (item) {
    item.status = 'APPROVED';
    item.reviewedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return delay({ success: true });
}

export function mockRejectSupplierApply(id: string, reason: string) {
  const item = supplierApplies.find((x) => x.id === id);
  if (item) {
    item.status = 'REJECTED';
    item.rejectReason = reason;
    item.reviewedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return delay({ success: true });
}
