import { normalizePageResult, buildQueryString, buildUserSavePayload } from '/@/api/system/_helpers';

describe('system api helpers', () => {
  it('normalizes jeecg paged records', () => {
    expect(normalizePageResult({ records: [{ id: '1' }], total: 6 })).toEqual({
      records: [{ id: '1' }],
      total: 6,
    });
  });

  it('normalizes array responses as unpaged tree/list data', () => {
    expect(normalizePageResult([{ id: 'root' }])).toEqual({
      records: [{ id: 'root' }],
      total: 1,
    });
  });

  it('builds query strings without empty values', () => {
    expect(buildQueryString({ username: 'admin', phone: '', status: undefined, pageNo: 1 })).toBe('username=admin&pageNo=1');
  });

  it('serializes user role and department selections for JeecgBoot user save APIs', () => {
    expect(
      buildUserSavePayload({
        id: 'user-1',
        selectedroles: ['role-1', 'role-2'],
        selecteddeparts: ['depart-1', 'depart-2'],
      }),
    ).toEqual({
      id: 'user-1',
      selectedroles: 'role-1,role-2',
      selecteddeparts: 'depart-1,depart-2',
    });
  });
});
