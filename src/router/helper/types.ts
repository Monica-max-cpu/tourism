import type { RouteMeta, RouteRecordRedirectOption } from 'vue-router';

export interface AppRouteRecordRaw {
  path: string;
  name: string;
  meta: RouteMeta & Recordable;
  component?: any;
  children?: AppRouteRecordRaw[];
  fullPath?: string;
  alwaysShow?: boolean;
  hidden?: boolean;
  route?: number;
  redirect?: RouteRecordRedirectOption;
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
