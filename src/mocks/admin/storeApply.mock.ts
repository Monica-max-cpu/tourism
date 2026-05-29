/**
 * 门店入驻审核 Mock — 对齐 b2b-api-contract.md v1.0
 */
import type { StoreApply, ApplyStatus, StoreType, OperationStatus } from '/#/b2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const statuses: ApplyStatus[] = [0, 0, 1, 1, 2, 1, 3];
const types: StoreType[] = [1, 1, 2, 3, 1, 2, 3];

const storeApplies: StoreApply[] = Array.from({ length: 38 }, (_, i) => {
  const name = `${pick(MOCK_DATA.STORE_NAMES)} #${i + 1}`;
  const status = statuses[i % statuses.length];
  const storeType = types[i % types.length];
  const statusLabel = { 0: '待审核', 1: '已通过', 2: '已拒绝', 3: '已停用' }[status];
  return {
    id: `str-apply-${2000 + i}`,
    storeName: name,
    storeType,
    storeTypeLabel: { 1: '普通', 2: '自营', 3: '文旅优选' }[storeType],
    contactPerson: pick(['赵敏', '孙磊', '周悦', '吴婷', '郑海']),
    contactPhone: `139${String(20000000 + i * 211).slice(0, 8)}`,
    contactEmail: `store${i}@example.com`,
    province: pick(MOCK_DATA.PROVINCES),
    city: '主城区',
    address: '景区大道 ' + (200 + i) + ' 号',
    status,
    statusLabel,
    reviewStatus: status === 2 ? 2 : status === 1 || status === 3 ? 1 : 0,
    operationStatus: status === 3 ? 2 : status === 1 ? 1 : 0,
    authType: 'MERCHANT',
    mainCategory: pick(['文创零售', '餐饮', '特产', '便利服务']),
    categoryIds: pick(['文创,特产', '餐饮,零售', '便利服务', '粮油,快消']),
    logoId: '/mock/upload/store-logo.png',
    bankAccount: `622700${String(2000000000 + i)}`,
    bankName: pick(['中国银行太原分行', '工商银行晋中支行', '建设银行大同支行']),
    bankNo: `CNAPS${String(200000 + i)}`,
    description: '景区门店经营稳定，具备线下履约和销售能力。',
    storePhotos: '/mock/upload/store-front.jpg',
    mapAddress: '山西省太原市迎泽区景区大道',
    coordinate: '112.549248,37.857014',
    supplySourceId: i % 4 === 0 ? `supply-source-${i}` : undefined,
    reviewRemark: status === 2 ? '门店类型不符合要求' : undefined,
    loginAccount: status >= 1 ? `store_202605${String(i).padStart(3, '0')}` : undefined,
    creditLimit: status >= 1 ? 5000 : 0,
    reviewer: status >= 1 ? 'admin' : undefined,
    createTime: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(9 + (i % 10)).padStart(2, '0')}:15:00`,
    reviewTime: status >= 1 ? `2026-05-${String((i % 24) + 3).padStart(2, '0')} 16:00:00` : undefined,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  storeType?: string;
  [key: string]: any;
}

export function mockListStoreApply({ pageNo, pageSize, keyword, status, storeType }: QueryParams) {
  let list = storeApplies;
  if (status) list = list.filter((x) => String(x.status) === status);
  if (storeType) list = list.filter((x) => String(x.storeType) === storeType);
  if (keyword) {
    const k = keyword.toLowerCase();
    list = list.filter((x) => x.storeName.toLowerCase().includes(k) || x.contactPhone.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetStoreApply(id: string): Promise<StoreApply | null> {
  return delay(storeApplies.find((x) => x.id === id) || null);
}

export function mockApproveStoreApply(id: string) {
  const item = storeApplies.find((x) => x.id === id);
  if (item) {
    item.status = 1;
    item.statusLabel = '已通过';
    item.reviewStatus = 1;
    item.operationStatus = 1;
    item.reviewTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    item.reviewer = 'admin';
  }
  return delay({ success: true });
}

export function mockRejectStoreApply(id: string, reason: string) {
  const item = storeApplies.find((x) => x.id === id);
  if (item) {
    item.status = 2;
    item.statusLabel = '已拒绝';
    item.reviewStatus = 2;
    item.operationStatus = 0;
    item.reviewRemark = reason;
    item.reviewTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    item.reviewer = 'admin';
  }
  return delay({ success: true });
}

export function mockToggleStoreStatus(id: string, operationStatus: OperationStatus) {
  const item = storeApplies.find((x) => x.id === id);
  if (item && item.reviewStatus === 1) {
    item.operationStatus = operationStatus;
    item.status = operationStatus === 1 ? 1 : 3;
    item.statusLabel = operationStatus === 1 ? '已通过' : '已停用';
  }
  return delay({ success: true });
}
