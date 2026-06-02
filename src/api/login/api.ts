/**
 * 登录 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段1】登录接口（Mock+真接口双轨）
 * 真接口预留 JeecgBoot 风格 URL；Mock 阶段直接走 mockLogin。
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段1】登录接口（Mock+真接口双轨）
 */
import { defHttp } from '/@/api/http';
import { mockLogin, mockUsers, mockRegister, mockCheckOnlyUser, mockPhoneVerify, mockPasswordChange, mockGetCaptcha } from '/@/mocks/login.mock';
import type { LoginParams, LoginResult, UserInfo } from './model';

enum Api {
  Login = '/sys/login',
  Logout = '/sys/logout',
  GetUserInfo = '/sys/user/getUserInfo',
  Register = '/sys/user/register',
  CheckOnlyUser = '/sys/user/checkOnlyUser',
  PhoneVerify = '/sys/user/phoneVerification',
  PasswordChange = '/sys/user/passwordChange',
  GetCaptcha = '/sys/sms',
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function loginApi(params: LoginParams): Promise<LoginResult> {
  if (USE_MOCK) return mockLogin(params);
  // update-begin--author:phase7---date:2026-05-25---for:【阶段7】适配 JeecgBoot 返回结构
  const res = await defHttp.post<any>({ url: Api.Login, data: params });
  const raw = res.userInfo ?? res.user ?? {};
  // 角色码（逗号分隔的字符串），优先从 userInfo.roleCode 取
  const roleCode: string = raw.roleCode || res.roleCode || '';
  // 基于 roleCode 判定角色
  const resolveRole = (): UserInfo['role'] => {
    if (roleCode.includes('admin') || roleCode.includes('b2b_admin')) return 'ADMIN';
    if (roleCode.includes('b2b_supplier')) return 'SUPPLIER';
    if (roleCode.includes('b2b_store')) return 'STORE';
    return 'BASIC_USER';
  };
  // 权限提取：JeecgBoot 可能在 userInfo.permissionList / res.permissions / raw.perms 等字段
  const resolvePermissions = (): string[] => {
    const candidates = [res.permissionList, res.permissions, raw.permissionList, raw.permissions, raw.perms, raw.authList];
    for (const c of candidates) {
      if (Array.isArray(c) && c.length > 0) return c;
    }
    // 后端未返回权限时，ADMIN 兜底完整权限，其他角色空数组
    const role = resolveRole();
    if (role === 'ADMIN') {
      return [
        'b2b:supplier:review',
        'b2b:store:review',
        'b2b:quote:review',
        'b2b:catalog:edit',
        'b2b:payment:pendingList',
        'b2b:payment:manualConfirm',
        'b2b:settlement:storeList',
        'b2b:settlement:supplierList',
        'b2b:settlement:supplierPay',
        'b2b:settlement:profitList',
        'b2b:settlement:profitSummary',
        'b2b:admin:dashboard',
        'b2b:admin:fulfillment',
      ];
    }
    return [];
  };
  // JeecgBoot realname 全小写，前端用 realName 驼峰
  return {
    token: res.token,
    user: {
      id: raw.id || '',
      username: raw.username || '',
      realName: raw.realname || raw.realName || '',
      email: raw.email || '',
      avatar: raw.avatar || '',
      role: resolveRole(),
      roleCode: roleCode || undefined,
      supplierId: raw.supplierId || raw.supplier_id || undefined,
      storeId: raw.storeId || raw.store_id || undefined,
      permissions: resolvePermissions(),
    },
  };
  // update-end--author:phase7---date:2026-05-25---for:【阶段7】适配 JeecgBoot 返回结构
}

export function logoutApi(): Promise<void> {
  if (USE_MOCK) return Promise.resolve();
  return defHttp.post<void>({ url: Api.Logout });
}

export interface RegisterParams {
  username: string;
  password: string;
  phone: string;
  smscode: string;
  realname?: string;
}

/** 注册 */
export function registerApi(params: RegisterParams): Promise<{ success: boolean; message?: string }> {
  if (USE_MOCK) return mockRegister(params);
  return defHttp.post({ url: Api.Register, data: params }, { isTransformResponse: false });
}

/** 校验用户名/手机号是否已存在 */
export function checkOnlyUserApi(params: { username?: string; phone?: string }): Promise<{ success: boolean; message?: string }> {
  if (USE_MOCK) return mockCheckOnlyUser(params);
  return defHttp.get({ url: Api.CheckOnlyUser, params }, { isTransformResponse: false });
}

/** 手机号验证（忘记密码第一步） */
export function phoneVerifyApi(params: { phone: string; smscode: string }): Promise<{ success: boolean; message?: string }> {
  if (USE_MOCK) return mockPhoneVerify(params);
  return defHttp.post({ url: Api.PhoneVerify, data: params }, { isTransformResponse: false });
}

/** 修改密码（忘记密码第二步） */
export function passwordChangeApi(params: { username: string; password: string; phone: string; smscode: string }): Promise<{ success: boolean; message?: string }> {
  if (USE_MOCK) return mockPasswordChange(params);
  return defHttp.get({ url: Api.PasswordChange, params }, { isTransformResponse: false });
}

/** 发送短信验证码 */
export function getCaptchaApi(params: { mobile: string; smsmode: string }): Promise<{ success: boolean; message?: string; code?: number }> {
  if (USE_MOCK) return mockGetCaptcha(params);
  return defHttp.post({ url: Api.GetCaptcha, data: params }, { isTransformResponse: false });
}

export async function getUserInfoApi(): Promise<UserInfo> {
  if (USE_MOCK) {
    const token = localStorage.getItem('b2b:token') || '';
    const m = token.match(/mock-token-(ADMIN|SUPPLIER|STORE|BASIC_USER)/);
    if (m) return Promise.resolve(mockUsers[m[1] as keyof typeof mockUsers]);
    return Promise.reject(new Error('未登录'));
  }
  const raw = await defHttp.get<any>({ url: Api.GetUserInfo });
  const roleCode: string = raw.roleCode || '';
  // 提取权限，兜底同 loginApi
  const resolvePerms = (): string[] => {
    const candidates = [raw.permissionList, raw.permissions, raw.perms, raw.authList];
    for (const c of candidates) {
      if (Array.isArray(c) && c.length > 0) return c;
    }
    if (roleCode.includes('admin') || roleCode.includes('b2b_admin')) {
      return [
        'b2b:supplier:review',
        'b2b:store:review',
        'b2b:quote:review',
        'b2b:catalog:edit',
        'b2b:payment:pendingList',
        'b2b:payment:manualConfirm',
        'b2b:settlement:storeList',
        'b2b:settlement:supplierList',
        'b2b:settlement:supplierPay',
        'b2b:settlement:profitList',
        'b2b:settlement:profitSummary',
        'b2b:admin:dashboard',
        'b2b:admin:fulfillment',
      ];
    }
    return [];
  };
  // 基于 roleCode 判定角色
  const resolveRole = (): UserInfo['role'] => {
    if (roleCode.includes('admin') || roleCode.includes('b2b_admin')) return 'ADMIN';
    if (roleCode.includes('b2b_supplier')) return 'SUPPLIER';
    if (roleCode.includes('b2b_store')) return 'STORE';
    return 'BASIC_USER';
  };
  return {
    id: raw.id || '',
    username: raw.username || '',
    realName: raw.realname || raw.realName || '',
    email: raw.email || '',
    avatar: raw.avatar || '',
    role: resolveRole(),
    roleCode: roleCode || undefined,
    supplierId: raw.supplierId || raw.supplier_id || undefined,
    storeId: raw.storeId || raw.store_id || undefined,
    permissions: resolvePerms(),
  };
}
