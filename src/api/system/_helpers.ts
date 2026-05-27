import type { PageResult } from '/#/system';

export function normalizePageResult<T>(input: any): PageResult<T> {
  if (Array.isArray(input)) {
    return { records: input, total: input.length };
  }
  if (input?.records && Array.isArray(input.records)) {
    return { records: input.records, total: Number(input.total ?? input.records.length) };
  }
  if (input?.result?.records && Array.isArray(input.result.records)) {
    return { records: input.result.records, total: Number(input.result.total ?? input.result.records.length) };
  }
  return { records: [], total: 0 };
}

export function buildQueryString(params: Record<string, any> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });
  return query.toString();
}
