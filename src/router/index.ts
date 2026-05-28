/**
 * vue-router 实例
 * BACK 模式：仅注册基础路由，业务路由在守卫中动态加载
 */
import { createRouter, createWebHistory } from 'vue-router';
import { basicRoutes } from './routes/basic';
import { setupGuards } from './guard';

export const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE),
  routes: [...basicRoutes],
  scrollBehavior() {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ top: 0 }), 0);
    });
  },
});

export function setupRouter(app: import('vue').App) {
  setupGuards(router);
  app.use(router);
}
