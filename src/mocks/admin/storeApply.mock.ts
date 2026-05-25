/**
 * 门店入驻审核 Mock
 */
import type { StoreApply, ApplyStatus, StoreType } from '/#/b2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const statuses: ApplyStatus[] = ['PENDING', 'PENDING', 'APPROVED', 'APPROVED', 'REJECTED'];
const types: StoreType[] = ['SCENIC', 'CHAIN', 'INDEPENDENT'];

const storeApplies: StoreApply[] = Array.from({ length: 38 }, (_, i) => {
  const name = `${pick(MOCK_DATA.STORE_NAMES)} #${i + 1}`;
  const status = statuses[i % statuses.length];
  return {
    id: `str-apply-${2000 + i}`,
    applyNo: `STR${String(20260500 + i).padStart(8, '0')}`,
    storeName: name,
    storeType: types[i % types.length],
    contactPerson: pick(['赵敏', '孙磊', '周悦', '吴婷', '郑海']),
    contactPhone: `139${String(20000000 + i * 211).slice(0, 8)}`,
    contactEmail: `store${i}@example.com`,
    province: pick(MOCK_DATA.PROVINCES),
    city: '主城区',
    address: '景区大道 ' + (200 + i) + ' 号',
    status,
    rejectReason: status === 'REJECTED' ? '门店类型不符合要求' : '',
    createdAt: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(9 + (i % 10)).padStart(2, '0')}:15:00`,
    reviewedAt: status !== 'PENDING' ? `2026-05-${String((i % 24) + 3).padStart(2, '0')} 16:00:00` : undefined,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: { keyword?: string; status?: string; storeType?: string };
}

export function mockListStoreApply({ pageNo, pageSize, searchInfo }: QueryParams) {
  let list = storeApplies;
  if (searchInfo?.status) list = list.filter((x) => x.status === searchInfo.status);
  if (searchInfo?.storeType) list = list.filter((x) => x.storeType === searchInfo.storeType);
  if (searchInfo?.keyword) {
    const k = searchInfo.keyword.toLowerCase();
    list = list.filter((x) => x.storeName.toLowerCase().includes(k) || x.applyNo.includes(k) || x.contactPhone.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetStoreApply(id: string): Promise<StoreApply | null> {
  return delay(storeApplies.find((x) => x.id === id) || null);
}

export function mockApproveStoreApply(id: string) {
  const item = storeApplies.find((x) => x.id === id);
  if (item) {
    item.status = 'APPROVED';
    item.reviewedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return delay({ success: true });
}

export function mockRejectStoreApply(id: string, reason: string) {
  const item = storeApplies.find((x) => x.id === id);
  if (item) {
    item.status = 'REJECTED';
    item.rejectReason = reason;
    item.reviewedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  return delay({ success: true });
}
