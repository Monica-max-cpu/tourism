/**
 * VAxios 二次封装
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段1】defHttp 封装
 * - 拦截器注入 X-Access-Token
 * - 统一响应结构 Result<T> 解包
 * - 401 自动登出
 * - 业务码失败抛出 BizError
 * - 失败重试（仅 GET、网络错误）
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段1】defHttp 封装
 */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { Result } from '/#/api';
import { getToken, clearAuth } from '/@/utils/auth';
import { ROUTE_PATHS } from '/@/constants/routePaths';

export class BizError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

interface RequestOptions {
  /** 是否直接返回 result 字段，默认 true */
  unwrap?: boolean;
  /** 是否走 mock，默认读 VITE_USE_MOCK */
  useMock?: boolean;
  /** 失败重试次数（仅 GET），默认 0 */
  retry?: number;
}

const DEFAULT_OPTIONS: Required<RequestOptions> = {
  unwrap: true,
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  retry: 0,
};

class VAxios {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE ?? '/jeecgboot',
      timeout: 15000,
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers['X-Access-Token'] = token;
      }
      // update-begin--author:phase7---date:2026-05-25---for:【阶段7】JeecgBoot 防重放 + 多租户头
      config.headers['X-Timestamp'] = Date.now().toString();
      config.headers['X-Nonce'] = Math.random().toString(36).slice(2, 10);
      const tenantId = localStorage.getItem('b2b:tenantId') || '';
      if (tenantId) config.headers['X-Tenant-Id'] = tenantId;
      // update-end--author:phase7---date:2026-05-25---for:【阶段7】JeecgBoot 防重放 + 多租户头
      return config;
    });

    this.instance.interceptors.response.use(
      (res: AxiosResponse<Result>) => res,
      (error) => {
        if (error?.response?.status === 401) {
          clearAuth();
          if (location.pathname !== ROUTE_PATHS.LOGIN) {
            location.href = ROUTE_PATHS.LOGIN;
          }
        }
        return Promise.reject(error);
      },
    );
  }

  async request<T = any>(config: AxiosRequestConfig, options: RequestOptions = {}): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: unknown;
    const total = opts.retry + 1;

    for (let i = 0; i < total; i++) {
      try {
        const res = await this.instance.request<Result<T>>(config);
        const body = res.data;
        if (!body) throw new BizError(-1, '响应体为空');
        if (body.success === false || (body.code !== undefined && body.code !== 200)) {
          throw new BizError(body.code, body.message || '请求失败');
        }
        return opts.unwrap ? (body.result as T) : (body as unknown as T);
      } catch (err) {
        lastError = err;
        // 仅 GET + 网络错误重试
        const isRetriable = config.method?.toUpperCase() === 'GET' && !(err instanceof BizError);
        if (!isRetriable || i === total - 1) break;
      }
    }
    throw lastError;
  }

  get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request<T>({ ...config, method: 'GET' }, options);
  }
  post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request<T>({ ...config, method: 'POST' }, options);
  }
  put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT' }, options);
  }
  delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE' }, options);
  }
}

export const defHttp = new VAxios();
