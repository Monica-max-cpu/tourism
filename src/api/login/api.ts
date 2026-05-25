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

export function loginApi(params: LoginParams): Promise<LoginResult> {
  if (USE_MOCK) return mockLogin(params);
  return defHttp.post<LoginResult>({ url: Api.Login, data: params });
}

export function logoutApi(): Promise<void> {
  if (USE_MOCK) return Promise.resolve();
  return defHttp.post<void>({ url: Api.Logout });
}

export function getUserInfoApi(): Promise<UserInfo> {
  if (USE_MOCK) {
    // 通过本地 token 反推角色（mock-token-ADMIN-xxx）
    const token = localStorage.getItem('b2b:token') || '';
    const m = token.match(/mock-token-(ADMIN|SUPPLIER|STORE)/);
    if (m) return Promise.resolve(mockUsers[m[1] as keyof typeof mockUsers]);
    return Promise.reject(new Error('未登录'));
  }
  return defHttp.get<UserInfo>({ url: Api.GetUserInfo });
}
