/**
 * 用户 Store
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段1】用户态与登录流程
 * - 选项式 defineStore（{id, state, getters, actions}）
 * - 双导出：useUserStore（组件内）+ useUserStoreWithOut（路由守卫等非组件上下文）
 * - getter 用 get 前缀；action 用 set 前缀
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段1】用户态与登录流程
 */
import { defineStore } from 'pinia';
import { store } from '/@/stores';
import type { UserInfo, LoginParams } from '/#/user';
import { loginApi, logoutApi, getUserInfoApi } from '/@/api/login/api';
import {
  getToken as readToken,
  setToken as saveToken,
  getUser as readUser,
  setUser as saveUser,
  clearAuth,
} from '/@/utils/auth';

interface UserState {
  user: UserInfo | null;
  token: string;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    user: readUser(),
    token: readToken(),
  }),
  getters: {
    getUserInfo(state): UserInfo | null {
      return state.user;
    },
    getToken(state): string {
      return state.token;
    },
    getRole(state): string {
      return state.user?.role || '';
    },
    getPermissions(state): string[] {
      return state.user?.permissions || [];
    },
    isLoggedIn(state): boolean {
      return !!state.token && !!state.user;
    },
    isAdmin(state): boolean {
      return state.user?.role === 'ADMIN';
    },
    isSupplier(state): boolean {
      return state.user?.role === 'SUPPLIER';
    },
    isStore(state): boolean {
      return state.user?.role === 'STORE';
    },
  },
  actions: {
    setUserInfo(user: UserInfo | null) {
      this.user = user;
      if (user) saveUser(user);
    },
    setToken(token: string) {
      this.token = token;
      if (token) saveToken(token);
    },
    async login(params: LoginParams) {
      const { token, user } = await loginApi(params);
      this.setToken(token);
      this.setUserInfo(user);
      return user;
    },
    /** 占位：CAS 单点登录入口（后续阶段对接） */
    async loginByCAS(_ticket: string) {
      // TODO: 调 JeecgBoot CAS 校验接口换 token，再 fetchUserInfo
      throw new Error('CAS 登录暂未启用');
    },
    async fetchUserInfo() {
      const user = await getUserInfoApi();
      this.setUserInfo(user);
      return user;
    },
    async logout() {
      try {
        await logoutApi();
      } catch {
        // 忽略登出接口异常
      }
      this.user = null;
      this.token = '';
      clearAuth();
    },
  },
});

/** 非组件上下文使用（路由守卫、API 拦截器等） */
export function useUserStoreWithOut() {
  return useUserStore(store);
}
