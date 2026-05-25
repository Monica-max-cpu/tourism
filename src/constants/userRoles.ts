/**
 * 用户角色枚举
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段1】角色与标签映射
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段1】角色与标签映射
 */
import type { UserRole } from '/#/user';

export const ROLE = {
  ADMIN: 'ADMIN',
  SUPPLIER: 'SUPPLIER',
  STORE: 'STORE',
} as const;

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: '平台管理员',
  SUPPLIER: '供应商',
  STORE: '门店',
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: '平台管理员' },
  { value: 'SUPPLIER', label: '供应商' },
  { value: 'STORE', label: '门店' },
];
