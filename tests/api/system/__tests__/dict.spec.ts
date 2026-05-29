jest.mock('/@/api/http', () => ({ defHttp: {} }));
jest.mock('/@/utils/auth', () => ({ getToken: () => '' }));
jest.mock('axios', () => ({ get: jest.fn() }));

import { buildDictExportUrl, normalizeDictItemPayload } from '/@/api/system/dict';

describe('system dict api', () => {
  it('builds the Jeecg dictionary export URL without empty query values', () => {
    expect(buildDictExportUrl({ dictName: '状态', dictCode: '', pageNo: 1 })).toBe('/jeecgboot/sys/dict/exportXls?dictName=%E7%8A%B6%E6%80%81&pageNo=1');
  });

  it('attaches dictId when saving dictionary items', () => {
    expect(normalizeDictItemPayload({ itemText: '启用', itemValue: '1' }, 'dict-1')).toEqual({
      itemText: '启用',
      itemValue: '1',
      dictId: 'dict-1',
    });
  });
});
