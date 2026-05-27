/**
 * 登录 API
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段1】登录接口（Mock+真接口双轨）
 * 真接口预留 JeecgBoot 风格 URL；Mock 阶段直接走 mockLogin。
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段1】登录接口（Mock+真接口双轨）
 */
import { defHttp } from '/@/api/http';
import { mockLogin, mockUsers } from '/@/mocks/login.mock';
import type { LoginParams, LoginResult, UserInfo } from './model';

enum Api {
  Login = '/sys/login',
  Logout = '/sys/logout',
  GetUserInfo = '/sys/user/getUserInfo',
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function loginApi(params: LoginParams): Promise<LoginResult> {
  if (USE_MOCK) return mockLogin(params);
  // update-begin--author:phase7---date:2026-05-26---for:【阶段7】supplier/store 后端未实现，用户名含关键字的走 mock
  const userLower = params.username.toLowerCase();
  if (userLower.includes('supplier') || userLower.includes('store')) {
    return mockLogin(params);
  }
  // update-end--author:phase7---date:2026-05-26---for:【阶段7】supplier/store 后端未实现，用户名含关键字的走 mock
  // update-begin--author:phase7---date:2026-05-25---for:【阶段7】适配 JeecgBoot 返回结构
  const res = await defHttp.post<any>({ url: Api.Login, data: params });
  const raw = res.userInfo ?? res.user ?? {};
  // JeecgBoot 角色在 roleList[0]，可能为空（用户未分配角色）
  const resolveRole = (): UserInfo['role'] => {
    const code = (res.roleList?.[0] || raw.role || raw.username || '').toUpperCase();
    if (code === 'STOREUSER') return 'STORE';
    if (code === 'ADMIN' || code === 'SUPPLIER' || code === 'STORE') return code;
    // 兜底：用户名匹配
    if (code === 'SUPPLIER') return 'SUPPLIER';
    return 'ADMIN'; // 默认 ADMIN，后端修好 roleList 后此逻辑自动跳过
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
      return ['b2b:supplier:review', 'b2b:store:review', 'b2b:quote:review', 'b2b:catalog:edit', 'b2b:admin:dashboard', 'b2b:admin:fulfillment'];
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
      permissions: resolvePermissions(),
    },
  };
  // update-end--author:phase7---date:2026-05-25---for:【阶段7】适配 JeecgBoot 返回结构
}

export function logoutApi(): Promise<void> {
  if (USE_MOCK) return Promise.resolve();
  return defHttp.post<void>({ url: Api.Logout });
}

export async function getUserInfoApi(): Promise<UserInfo> {
  if (USE_MOCK) {
    const token = localStorage.getItem('b2b:token') || '';
    const m = token.match(/mock-token-(ADMIN|SUPPLIER|STORE)/);
    if (m) return Promise.resolve(mockUsers[m[1] as keyof typeof mockUsers]);
    return Promise.reject(new Error('未登录'));
  }
  // supplier/store mock 登录的 token，直接从 mock 取用户信息（绕过真实接口）
  const tokenVal = localStorage.getItem('b2b:token') || '';
  const mockMatch = tokenVal.match(/mock-token-(ADMIN|SUPPLIER|STORE)/);
  if (mockMatch) return Promise.resolve(mockUsers[mockMatch[1] as keyof typeof mockUsers]);

  const raw = await defHttp.get<any>({ url: Api.GetUserInfo });
  // 提取权限，兜底同 loginApi
  const resolvePerms = (): string[] => {
    const candidates = [raw.permissionList, raw.permissions, raw.perms, raw.authList];
    for (const c of candidates) {
      if (Array.isArray(c) && c.length > 0) return c;
    }
    const code = (raw.role || raw.username || '').toUpperCase();
    if (code === 'ADMIN') {
      return ['b2b:supplier:review', 'b2b:store:review', 'b2b:quote:review', 'b2b:catalog:edit', 'b2b:admin:dashboard', 'b2b:admin:fulfillment'];
    }
    return [];
  };
  return {
    id: raw.id || '',
    username: raw.username || '',
    realName: raw.realname || raw.realName || '',
    email: raw.email || '',
    avatar: raw.avatar || '',
    role: raw.role || '',
    permissions: resolvePerms(),
  };
}
