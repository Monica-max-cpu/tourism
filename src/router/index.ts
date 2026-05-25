/**
 * vue-router 实例
 */
import { createRouter, createWebHistory } from 'vue-router';
import { basicRoutes } from './routes/basic';
import { adminRoutes, supplierRoutes, storeRoutes } from './routes/business';
import { setupGuards } from './guard';
import { ROUTE_PATHS } from '/@/constants/routePaths';

export const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE),
  routes: [
    ...basicRoutes,
    adminRoutes,
    supplierRoutes,
    storeRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: ROUTE_PATHS.NOT_FOUND,
      meta: { hidden: true },
    },
  ],
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
