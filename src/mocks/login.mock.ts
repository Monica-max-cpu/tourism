/**
 * 登录 Mock
 */
import type { UserInfo, UserRole, LoginParams, LoginResult } from '/#/user';
import type { RegisterParams } from '/@/api/login/api';

export const mockUsers: Record<UserRole, UserInfo> = {
  ADMIN: {
    id: 'u-admin-001',
    username: 'admin',
    realName: '平台管理员',
    email: 'admin@b2b.example.com',
    avatar: '',
    role: 'ADMIN',
    roleCode: 'admin,b2b_admin',
    permissions: [
      'b2b:supplier:review',
      'b2b:store:review',
      'b2b:quote:review',
      'b2b:catalog:edit',
      'b2b:catalog:shelf',
      'b2b:payment:pendingList',
      'b2b:payment:manualConfirm',
      'b2b:collective:trigger',
      'b2b:collective:config',
      'b2b:delivery:exception',
      'b2b:settlement:storeList',
      'b2b:settlement:supplierList',
      'b2b:settlement:supplierPay',
      'b2b:settlement:profitList',
      'b2b:settlement:profitSummary',
    ],
  },
  SUPPLIER: {
    id: 'u-supplier-001',
    username: 'supplier',
    realName: '示例供应商',
    email: 'supplier@b2b.example.com',
    avatar: '',
    role: 'SUPPLIER',
    roleCode: 'b2b_supplier',
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
    roleCode: 'b2b_store',
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
    roleCode: '',
    permissions: [],
  },
};

export function mockLogin(params: LoginParams): Promise<LoginResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 检查已注册用户
      const registered = getRegisteredUsers();
      const regUser = registered.find((u) => u.username === params.username);
      if (regUser) {
        if (regUser.password !== params.password) {
          reject(new Error('密码错误'));
          return;
        }
        resolve({
          token: `mock-token-BASIC_USER-${Date.now()}`,
          user: {
            id: regUser.id,
            username: regUser.username,
            realName: regUser.username,
            email: '',
            avatar: '',
            role: 'BASIC_USER' as UserRole,
            roleCode: '',
            permissions: [],
          },
        });
        return;
      }
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

// ===== 注册 / 忘记密码 Mock =====

interface RegisteredUser {
  id: string;
  username: string;
  password: string;
  phone: string;
}

function getRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem('b2b:registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: RegisteredUser[]): void {
  localStorage.setItem('b2b:registered_users', JSON.stringify(users));
}

/** Mock 短信发送 */
export function mockGetCaptcha(params: { mobile: string; smsmode: string }): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(`b2b:sms:${params.smsmode}:${params.mobile}`, '123456');
      console.log(`[Mock] 短信验证码已发送到 ${params.mobile}，验证码：123456（模式: ${params.smsmode}）`);
      resolve({ success: true, message: '验证码已发送' });
    }, 300);
  });
}

function verifySmsCode(mobile: string, smsmode: string, code: string): boolean {
  const cached = localStorage.getItem(`b2b:sms:${smsmode}:${mobile}`);
  return cached === code;
}

/** Mock 注册 */
export function mockRegister(params: RegisterParams): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getRegisteredUsers();
      if (users.find((u) => u.username === params.username)) {
        reject(new Error('用户名已存在'));
        return;
      }
      if (users.find((u) => u.phone === params.phone)) {
        reject(new Error('手机号已被注册'));
        return;
      }
      if (!verifySmsCode(params.phone, '1', params.smscode)) {
        reject(new Error('短信验证码错误'));
        return;
      }
      users.push({
        id: `u-reg-${Date.now()}`,
        username: params.username,
        password: params.password,
        phone: params.phone,
      });
      saveRegisteredUsers(users);
      resolve({ success: true, message: '注册成功' });
    }, 400);
  });
}

/** Mock 检查用户名/手机号唯一 */
export function mockCheckOnlyUser(params: { username?: string; phone?: string }): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getRegisteredUsers();
      if (params.username && users.find((u) => u.username === params.username)) {
        resolve({ success: false, message: '用户名已存在' });
        return;
      }
      if (params.phone && users.find((u) => u.phone === params.phone)) {
        resolve({ success: false, message: '手机号已被注册' });
        return;
      }
      resolve({ success: true });
    }, 200);
  });
}

/** Mock 手机号验证（忘记密码第一步） */
export function mockPhoneVerify(params: { phone: string; smscode: string }): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!verifySmsCode(params.phone, '2', params.smscode)) {
        reject(new Error('短信验证码错误'));
        return;
      }
      resolve({ success: true, message: '验证通过' });
    }, 300);
  });
}

/** Mock 修改密码 */
export function mockPasswordChange(params: { username: string; password: string; phone: string; smscode: string }): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getRegisteredUsers();
      const idx = users.findIndex((u) => u.username === params.username && u.phone === params.phone);
      if (idx === -1) {
        reject(new Error('未找到匹配的用户，请检查用户名和手机号'));
        return;
      }
      users[idx].password = params.password;
      saveRegisteredUsers(users);
      resolve({ success: true, message: '密码修改成功' });
    }, 400);
  });
}
