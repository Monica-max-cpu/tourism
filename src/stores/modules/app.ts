/**
 * 应用 UI 状态 Store
 */
import { defineStore } from 'pinia';
import { store } from '/@/stores';

interface AppState {
  collapsed: boolean;
  locale: 'zh-CN' | 'en-US';
  routeLoading: boolean;
  loggingOut: boolean;
}

export const useAppStore = defineStore({
  id: 'app-app',
  state: (): AppState => ({
    collapsed: false,
    locale: 'zh-CN',
    routeLoading: false,
    loggingOut: false,
  }),
  getters: {
    getCollapsed(state): boolean {
      return state.collapsed;
    },
    getLocale(state): 'zh-CN' | 'en-US' {
      return state.locale;
    },
    getRouteLoading(state): boolean {
      return state.routeLoading;
    },
    getLoggingOut(state): boolean {
      return state.loggingOut;
    },
  },
  actions: {
    setCollapsed(v: boolean) {
      this.collapsed = v;
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    setLocale(locale: 'zh-CN' | 'en-US') {
      this.locale = locale;
    },
    setRouteLoading(loading: boolean) {
      this.routeLoading = loading;
    },
    setLoggingOut(loggingOut: boolean) {
      this.loggingOut = loggingOut;
    },
  },
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
