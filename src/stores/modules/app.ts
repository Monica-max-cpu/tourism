/**
 * 应用 UI 状态 Store
 */
import { defineStore } from 'pinia';
import { store } from '/@/stores';

interface AppState {
  collapsed: boolean;
  locale: 'zh-CN' | 'en-US';
}

export const useAppStore = defineStore({
  id: 'app-app',
  state: (): AppState => ({
    collapsed: false,
    locale: 'zh-CN',
  }),
  getters: {
    getCollapsed(state): boolean {
      return state.collapsed;
    },
    getLocale(state): 'zh-CN' | 'en-US' {
      return state.locale;
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
  },
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
