import type { AppRouteRecordRaw } from './types';
import type { Router, RouteRecordNormalized } from 'vue-router';
import { getParentLayout, LAYOUT } from '/@/router/constant';
import { cloneDeep, omit } from 'lodash-es';
import { createRouter, createWebHashHistory } from 'vue-router';

export type LayoutMapKey = 'LAYOUT';
const IFRAME = () => import('/@/views/sys/iframe/FrameBlank.vue');

const LayoutMap = new Map<string, () => Promise<typeof import('*.vue')>>();
LayoutMap.set('LAYOUT', LAYOUT);
LayoutMap.set('IFRAME', IFRAME);
LayoutMap.set('LAYOUTS/DEFAULT/INDEX', LAYOUT);

let dynamicViewsModules: Record<string, () => Promise<Recordable>>;

function dynamicImport(dynamicViewsModules: Record<string, () => Promise<Recordable>>, component: string) {
  const keys = Object.keys(dynamicViewsModules);
  const matchKeys = keys.filter((key) => {
    const k = key.replace('../../views', '');
    const startFlag = component.startsWith('/');
    const endFlag = component.endsWith('.vue') || component.endsWith('.tsx');
    const startIndex = startFlag ? 0 : 1;
    const lastIndex = endFlag ? k.length : k.lastIndexOf('.');
    return k.substring(startIndex, lastIndex) === component;
  });
  if (matchKeys?.length === 1) {
    const matchKey = matchKeys[0];
    return dynamicViewsModules[matchKey];
  } else if (matchKeys?.length > 1) {
    console.warn(
      'Please do not create `.vue` and `.TSX` files with the same file name in the same hierarchical directory under the views folder.',
    );
    return;
  }
}

function isUrl(path: string): boolean {
  const reg =
    /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
  return reg.test(path);
}

// Dynamic introduction
function asyncImportRoute(routes: AppRouteRecordRaw[] | undefined) {
  if (!dynamicViewsModules) {
    dynamicViewsModules = import.meta.glob('../../views/**/*.{vue,tsx}');
  }
  if (!routes) return;
  routes.forEach((item) => {
    if (item?.hidden) {
      item.meta.hideMenu = true;
      item.meta.hideBreadcrumb = true;
    }
    if (item?.route == 0) {
      item.meta.ignoreRoute = true;
    }
    item.meta.ignoreKeepAlive = !item?.meta.keepAlive;

    // 适配 iframe
    if (/^\/?http(s)?/.test(item.component as string)) {
      item.component = (item.component as string).substring(1);
    }
    if (/^http(s)?/.test(item.component as string)) {
      if (item.meta?.internalOrExternal) {
        item.path = item.component as string;
      } else {
        item.meta.frameSrc = item.component;
      }
      delete item.component;
    }

    if (!item.component && item.meta?.frameSrc) {
      item.component = 'IFRAME';
    }

    let { component, name } = item;
    const { children } = item;
    if (component) {
      const layoutFound = LayoutMap.get((component as string).toUpperCase());
      if (layoutFound) {
        item.component = layoutFound;
      } else {
        item.component = dynamicImport(dynamicViewsModules, component as string);
      }
    } else if (name) {
      item.component = getParentLayout();
    }
    children && asyncImportRoute(children);
  });
}

// Turn background objects into routing objects
export function transformObjToRoute<T = AppRouteRecordRaw>(routeList: AppRouteRecordRaw[]): T[] {
  routeList.forEach((route) => {
    const component = route.component as string;
    if (component) {
      if (component.toUpperCase() === 'LAYOUT') {
        route.component = LayoutMap.get(component.toUpperCase());
      } else {
        route.children = [cloneDeep(route as any)];
        route.component = LAYOUT;
        route.name = `${route.name}Parent`;
        route.path = '';
        const meta = route.meta || {};
        meta.single = true;
        meta.affix = false;
        route.meta = meta;
      }
    } else {
      console.warn('请正确配置路由：' + route?.name + '的component属性');
    }
    route.children && asyncImportRoute(route.children);
  });
  return routeList as unknown as T[];
}

/**
 * 组件地址前加斜杠处理
 */
export function addSlashToRouteComponent(routeList: AppRouteRecordRaw[]) {
  routeList.forEach((route) => {
    let component = route.component as string;
    if (component) {
      const layoutFound = LayoutMap.get(component);
      if (!layoutFound) {
        route.component = component.startsWith('/') ? component : `/${component}`;
      }
    }
    route.children && addSlashToRouteComponent(route.children);
  });
  return routeList;
}

/**
 * 将多级路由转换为二级
 */
export function flatMultiLevelRoutes(routeModules: AppRouteRecordRaw[]) {
  // 去重：父子路由不能同名
  dedupeRouteNames(routeModules);
  const modules: AppRouteRecordRaw[] = cloneDeep(routeModules);
  for (let index = 0; index < modules.length; index++) {
    const routeModule = modules[index];
    if (!isMultipleRoute(routeModule)) {
      continue;
    }
    promoteRouteLevel(routeModule);
  }
  return modules;
}

/** 递归去重路由名，避免父子同名导致 Vue Router 报错 */
function dedupeRouteNames(routes: AppRouteRecordRaw[], parentNames = new Set<string>()) {
  routes.forEach((route) => {
    if (parentNames.has(route.name)) {
      route.name = `${route.name}_child`;
    }
    if (route.children?.length) {
      const next = new Set(parentNames);
      next.add(route.name);
      dedupeRouteNames(route.children, next);
    }
  });
}

function promoteRouteLevel(routeModule: AppRouteRecordRaw) {
  let router: Router | null = createRouter({
    routes: [routeModule as unknown as RouteRecordNormalized],
    history: createWebHashHistory(),
  });

  const routes = router.getRoutes();
  addToChildren(routes, routeModule.children || [], routeModule);
  router = null;

  routeModule.children = routeModule.children?.map((item) => omit(item, 'children'));
}

function addToChildren(
  routes: RouteRecordNormalized[],
  children: AppRouteRecordRaw[],
  routeModule: AppRouteRecordRaw,
) {
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    const route = routes.find((item) => item.name === child.name);
    if (!route) {
      continue;
    }
    routeModule.children = routeModule.children || [];
    if (!routeModule.children.find((item) => item.name === route.name)) {
      routeModule.children?.push(route as unknown as AppRouteRecordRaw);
    }
    if (child.children?.length) {
      addToChildren(routes, child.children, routeModule);
    }
  }
}

function isMultipleRoute(routeModule: AppRouteRecordRaw) {
  if (!routeModule || !Reflect.has(routeModule, 'children') || !routeModule.children?.length) {
    return false;
  }

  const children = routeModule.children;
  let flag = false;
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    if (child.children?.length) {
      flag = true;
      break;
    }
  }
  return flag;
}
