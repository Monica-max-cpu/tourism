import type { RouteRecordRaw, RouteMeta } from 'vue-router';

export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta'> {
  name: string;
  meta: RouteMeta & Recordable;
  component?: any;
  children?: AppRouteRecordRaw[];
  fullPath?: string;
  alwaysShow?: boolean;
  hidden?: boolean;
  route?: number;
  redirect?: string;
}

export interface Menu {
  name: string;
  icon?: string;
  path: string;
  paramPath?: string;
  disabled?: boolean;
  children?: Menu[];
  orderNo?: number;
  meta?: Partial<RouteMeta>;
  hideMenu?: boolean;
  alwaysShow?: boolean;
  title?: string;
}
