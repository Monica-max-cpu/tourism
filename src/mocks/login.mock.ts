/**
 * 登录 Mock
 */
import type { UserInfo, UserRole, LoginParams, LoginResult } from '/#/user';

export const mockUsers: Record<UserRole, UserInfo> = {
  ADMIN: {
    id: 'u-admin-001',
    username: 'admin',
    realName: '平台管理员',
    email: 'admin@b2b.example.com',
    avatar: '',
    role: 'ADMIN',
    permissions: [
      'b2b:supplier:review',
      'b2b:store:review',
      'b2b:quote:review',
      'b2b:catalog:edit',
      'b2b:catalog:shelf',
      'b2b:payment:confirm',
      'b2b:collective:trigger',
      'b2b:collective:config',
      'b2b:delivery:exception',
      'b2b:settlement:pay',
      'b2b:profit:view',
    ],
  },
  SUPPLIER: {
    id: 'u-supplier-001',
    username: 'supplier',
    realName: '示例供应商',
    email: 'supplier@b2b.example.com',
    avatar: '',
    role: 'SUPPLIER',
    supplierId: 'sup-001',
    permissions: [
      'b2b:supplier:product',
      'b2b:supplier:warehouse',
      'b2b:supplier:quote',
      'b2b:supplier:stock',
      'b2b:supplier:delivery',
      'b2b:supplier:settlement',
    ],
  },
  STORE: {
    id: 'u-store-001',
    username: 'store',
    realName: '示例门店',
    email: 'store@b2b.example.com',
    avatar: '',
    role: 'STORE',
    storeId: 'str-001',
    permissions: [
      'b2b:store:catalog',
      'b2b:store:order',
      'b2b:store:payment',
      'b2b:store:receive',
      // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端销售上报权限
      'b2b:store:sales',
      // update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端销售上报权限
    ],
  },
  BASIC_USER: {
    id: 'u-basic-001',
    username: 'basic',
    realName: '普通用户',
    email: 'basic@b2b.example.com',
    avatar: '',
    role: 'BASIC_USER',
    permissions: [],
  },
};

export function mockLogin(params: LoginParams): Promise<LoginResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 演示逻辑：用户名等于角色 key（小写）即匹配；不区分密码
      const rawKey = params.username.toUpperCase();
      const key = (rawKey === 'BASIC' ? 'BASIC_USER' : rawKey) as UserRole;
      const user = mockUsers[key];
      if (!user) {
        reject(new Error('用户名不存在，请使用 admin / supplier / store / basic'));
        return;
      }
      resolve({
        token: `mock-token-${user.role}-${Date.now()}`,
        user,
      });
    }, 500);
  });
}
