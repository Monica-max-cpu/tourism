/**
 * 供应商入驻审核 Mock — 对齐 b2b-api-contract.md v1.0
 */
import type { SupplierApply, ApplyStatus, OperationStatus } from '/#/b2b';
import { paginate, delay, pick, MOCK_DATA } from '../_helpers';

const statuses: ApplyStatus[] = [0, 0, 1, 1, 2, 1, 3];

const supplierApplies: SupplierApply[] = Array.from({ length: 47 }, (_, i) => {
  const name = `${pick(MOCK_DATA.SUPPLIER_NAMES)}有限公司 #${i + 1}`;
  const status = statuses[i % statuses.length];
  const statusLabel = { 0: '待审核', 1: '已通过', 2: '已拒绝', 3: '已停用' }[status];
  return {
    id: `sup-apply-${1000 + i}`,
    supplierName: name,
    contactPerson: pick(['张伟', '李娜', '王强', '刘洋', '陈思']),
    contactPhone: `138${String(10000000 + i * 137).slice(0, 8)}`,
    contactEmail: `contact${i}@example.com`,
    province: pick(MOCK_DATA.PROVINCES),
    city: '主城区',
    address: '示例路 ' + (100 + i) + ' 号',
    status,
    statusLabel,
    reviewStatus: status === 2 ? 2 : status === 1 || status === 3 ? 1 : 0,
    operationStatus: status === 3 ? 2 : status === 1 ? 1 : 0,
    authType: 'SUPPLIER',
    storeType: ((i % 3) + 1) as SupplierApply['storeType'],
    storeTypeLabel: ['普通', '自营', '文旅优选'][i % 3],
    mainCategory: pick(['生鲜类', '粮油类', '快消类', '文创类']),
    bankAccount: `622200${String(1000000000 + i)}`,
    bankName: pick(['中国银行太原分行', '工商银行晋中支行', '建设银行大同支行']),
    bankNo: `CNAPS${String(100000 + i)}`,
    description: '具备稳定供货能力，覆盖省内核心文旅消费场景。',
    storePhotos: '/mock/upload/supplier-store.jpg',
    mapAddress: '山西省太原市迎泽区示例路',
    coordinate: '112.549248,37.857014',
    remark: i % 3 === 0 ? '主营高端食材，已合作 3 家头部连锁' : '',
    reviewRemark: status === 2 ? '资质材料不全' : undefined,
    loginAccount: status >= 1 ? `supplier_202605${String(i).padStart(3, '0')}` : undefined,
    reviewer: status >= 1 ? 'admin' : undefined,
    createTime: `2026-05-${String((i % 24) + 1).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:30:00`,
    reviewTime: status >= 1 ? `2026-05-${String((i % 24) + 2).padStart(2, '0')} 14:20:00` : undefined,
  };
});

interface QueryParams {
  pageNo: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  [key: string]: any;
}

export function mockListSupplierApply({ pageNo, pageSize, keyword, status }: QueryParams) {
  let list = supplierApplies;
  if (status) list = list.filter((x) => String(x.status) === status);
  if (keyword) {
    const k = keyword.toLowerCase();
    list = list.filter((x) => x.supplierName.toLowerCase().includes(k) || x.contactPhone.includes(k));
  }
  return delay(paginate(list, pageNo, pageSize));
}

export function mockGetSupplierApply(id: string): Promise<SupplierApply | null> {
  return delay(supplierApplies.find((x) => x.id === id) || null);
}

export function mockApproveSupplierApply(id: string) {
  const item = supplierApplies.find((x) => x.id === id);
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

export function mockRejectSupplierApply(id: string, reason: string) {
  const item = supplierApplies.find((x) => x.id === id);
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

export function mockToggleSupplierStatus(id: string, operationStatus: OperationStatus) {
  const item = supplierApplies.find((x) => x.id === id);
  if (item && item.reviewStatus === 1) {
    item.operationStatus = operationStatus;
    item.status = operationStatus === 1 ? 1 : 3;
    item.statusLabel = operationStatus === 1 ? '已通过' : '已停用';
  }
  return delay({ success: true });
}
