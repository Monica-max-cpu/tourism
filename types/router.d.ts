import 'vue-router';
import type { UserRole } from './user';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    icon?: string;
    requiresAuth?: boolean;
    roles?: UserRole[];
    authCode?: string;
    hidden?: boolean;
    keepAlive?: boolean;
  }
}
