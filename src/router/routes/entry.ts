import type { RouteRecordRaw } from 'vue-router';
import { ROUTE_PATHS } from '/@/constants/routePaths';

const Layout = () => import('/@/components/Layout/BasicLayout.vue');

export const entryRoutes: RouteRecordRaw = {
  path: ROUTE_PATHS.ENTRY,
  component: Layout,
  redirect: ROUTE_PATHS.ENTRY_B2B,
  meta: { roles: ['BASIC_USER'], requiresAuth: true },
  children: [
    {
      path: 'b2b',
      name: 'EntryB2B',
      component: () => import('/@/views/entry/EntryPage.vue'),
      meta: { title: 'B2B 入驻', icon: 'BadgeCheck' },
    },
    {
      path: 'b2c',
      name: 'EntryB2C',
      component: () => import('/@/views/entry/B2CPage.vue'),
      meta: { title: 'B2C 入驻', icon: 'Store' },
    },
  ],
};
