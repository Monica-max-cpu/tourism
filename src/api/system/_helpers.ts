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

export function buildRolePermissionPayload(roleId: string, permissionIds: string[], lastPermissionIds: string[]) {
  return {
    roleId,
    permissionIds: permissionIds.join(','),
    lastpermissionIds: lastPermissionIds.join(','),
  };
}

export function buildUserSavePayload(data: Record<string, any>) {
  const payload = { ...data };
  if (Array.isArray(payload.selectedroles)) {
    payload.selectedroles = payload.selectedroles.join(',');
  }
  if (Array.isArray(payload.selecteddeparts)) {
    payload.selecteddeparts = payload.selecteddeparts.join(',');
  }
  return payload;
}
