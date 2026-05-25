/**
 * 通用格式化工具
 */
import dayjs from 'dayjs';

export function formatCurrency(value: number | string | null | undefined, prefix = '¥'): string {
  if (value === null || value === undefined || value === '') return `${prefix}0.00`;
  const num = Number(value);
  if (Number.isNaN(num)) return `${prefix}0.00`;
  return `${prefix}${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('zh-CN');
}

export function formatDate(value: string | number | Date | null | undefined, fmt = 'YYYY-MM-DD'): string {
  if (!value) return '-';
  return dayjs(value).format(fmt);
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  return formatDate(value, 'YYYY-MM-DD HH:mm:ss');
}
