jest.mock('/@/api/login/api', () => ({
  loginApi: jest.fn(),
  logoutApi: jest.fn(),
}));

describe('user store login', () => {
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

  it('only persists the authenticated token and user payload', async () => {
    const { loginApi } = require('/@/api/login/api') as {
      loginApi: jest.Mock;
    };
    const { useUserStoreWithOut } = require('/@/stores/modules/user');

    loginApi.mockResolvedValue({
      token: 'token-1',
      user: {
        id: 'u-1',
        username: 'admin',
        realName: '管理员',
        email: 'admin@example.com',
        avatar: '',
        role: 'ADMIN',
        roleCode: 'b2b_admin',
        permissions: ['b2b:admin:dashboard'],
      },
    });

    const userStore = useUserStoreWithOut();
    await expect(userStore.login({ username: 'admin', password: '123456' })).resolves.toMatchObject({
      username: 'admin',
      role: 'ADMIN',
      roleCode: 'b2b_admin',
    });

    expect(loginApi).toHaveBeenCalledTimes(1);
    expect(userStore.getToken).toBe('token-1');
    expect(userStore.getUserInfo).toMatchObject({
      username: 'admin',
      role: 'ADMIN',
      roleCode: 'b2b_admin',
    });
  });
});
