jest.mock('/@/api/http', () => ({
  defHttp: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('/@/api/sys/menu', () => ({
  getBackMenuAndPerms: jest.fn(),
}));

jest.mock('/@/router/helper/routeHelper', () => ({
  transformObjToRoute: jest.fn((routes) => routes),
  flatMultiLevelRoutes: jest.fn((routes) => routes),
  addSlashToRouteComponent: jest.fn((routes) => routes),
}));

jest.mock('/@/router/helper/menuHelper', () => ({
  transformRouteToMenu: jest.fn(() => []),
}));

jest.mock('/@/utils/helper/treeHelper', () => ({
  filter: jest.fn((routes) => routes),
}));

describe('permission store cache', () => {
  beforeEach(() => {
    jest.resetModules();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      configurable: true,
    });
  });

  it('reuses a cached backend permission payload without refetching', async () => {
    const { getBackMenuAndPerms } = require('/@/api/sys/menu') as {
      getBackMenuAndPerms: jest.Mock;
    };
    const { useUserStoreWithOut } = require('/@/stores/modules/user');
    const { usePermissionStoreWithOut } = require('/@/stores/modules/permission');

    getBackMenuAndPerms.mockReset();

    const userStore = useUserStoreWithOut();
    userStore.setUserInfo({
      id: 'u-1',
      username: 'admin',
      realName: '管理员',
      email: 'admin@example.com',
      avatar: '',
      role: 'ADMIN',
      roleCode: 'b2b_admin',
      permissions: [],
    });

    const permissionStore = usePermissionStoreWithOut();
    permissionStore.setBackMenuPermissionPayload({
      codeList: ['b2b:admin:dashboard'],
      menu: [],
    });

    await expect(permissionStore.changePermissionCode()).resolves.toEqual([
      expect.objectContaining({
        name: 'AdminWorkbench',
        path: '/b2b/admin/workbench',
        component: 'workbench/AdminDashboard',
      }),
    ]);
    expect(getBackMenuAndPerms).not.toHaveBeenCalled();
    expect(permissionStore.getPermCodeList).toEqual(['b2b:admin:dashboard']);
  });
});
