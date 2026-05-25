/**
 * 通用 API 类型
 */
export interface Result<T = any> {
  code: number;
  message: string;
  result: T;
  success: boolean;
  timestamp: number;
}

export interface PageParams {
  pageNo?: number;
  pageSize?: number;
  column?: string;
  order?: 'asc' | 'desc';
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export type Recordable<T = any> = Record<string, T>;
