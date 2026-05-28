import { normalizePageResult, buildQueryString } from '/@/api/system/_helpers';

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
});
