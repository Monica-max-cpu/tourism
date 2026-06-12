import type { CreditBillStatus, CreditSplitStatus, StoreCreditStatus } from '/#/b2b-store';

export const CREDIT_STATUS_LABEL: Record<StoreCreditStatus, string> = {
  0: '未申请',
  1: '银行审批中',
  2: '已启用',
  3: '银行拒绝',
  4: '已冻结',
  5: '已停用',
  6: '同步异常',
};

export const CREDIT_STATUS_VARIANT: Record<StoreCreditStatus, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  0: 'muted',
  1: 'warning',
  2: 'success',
  3: 'destructive',
  4: 'warning',
  5: 'muted',
  6: 'destructive',
};

export const CREDIT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '未申请' },
  { value: 1, label: '银行审批中' },
  { value: 2, label: '已启用' },
  { value: 3, label: '银行拒绝' },
  { value: 4, label: '已冻结' },
  { value: 5, label: '已停用' },
  { value: 6, label: '同步异常' },
];

export const CREDIT_BILL_STATUS_LABEL: Record<CreditBillStatus, string> = {
  0: '待还款',
  1: '部分还款',
  2: '已结清',
  3: '已逾期',
  4: '已关闭',
};

export const CREDIT_BILL_STATUS_VARIANT: Record<CreditBillStatus, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  0: 'warning',
  1: 'info',
  2: 'success',
  3: 'destructive',
  4: 'muted',
};

export const CREDIT_BILL_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待还款' },
  { value: 1, label: '部分还款' },
  { value: 2, label: '已结清' },
  { value: 3, label: '已逾期' },
  { value: 4, label: '已关闭' },
];

export const CREDIT_SPLIT_STATUS_LABEL: Record<CreditSplitStatus, string> = {
  0: '待确认',
  1: '待分账',
  2: '分账中',
  3: '已完成',
  4: '分账失败',
};

export const CREDIT_SPLIT_STATUS_VARIANT: Record<CreditSplitStatus, 'warning' | 'info' | 'success' | 'destructive' | 'muted'> = {
  0: 'warning',
  1: 'info',
  2: 'info',
  3: 'success',
  4: 'destructive',
};

export const CREDIT_SPLIT_STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 0, label: '待确认' },
  { value: 1, label: '待分账' },
  { value: 2, label: '分账中' },
  { value: 3, label: '已完成' },
  { value: 4, label: '分账失败' },
];
