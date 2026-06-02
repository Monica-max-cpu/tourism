import type { Menu } from './types';
import { findPath, treeMap } from '/@/utils/helper/treeHelper';
import { cloneDeep } from 'lodash-es';

function isUrl(path: string): boolean {
  const reg =
    /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
  return reg.test(path);
}

export function getAllParentPath<T = Recordable>(treeData: T[], path: string) {
  let menuList = findMenuPath(treeData, path, false);
  if (!(menuList?.length)) {
    menuList = findMenuPath(treeData, path, true);
  }
  return (menuList || []).map((item: any) => item.path);
}

function findMenuPath<T = Recordable>(treeData: T[], path: string, matchHide: boolean) {
  return findPath(treeData, (n: any) => {
    if (!matchHide && n.hideMenu) {
      return false;
    }
    return n.path === path;
  }) as Menu[];
}

function joinParentPath(menus: Menu[], parentPath = '') {
  for (let index = 0; index < menus.length; index++) {
    const menu = menus[index];
    if (!(menu.path.startsWith('/') || isUrl(menu.path))) {
      menu.path = `${parentPath}/${menu.path}`;
    }
    if (menu?.children?.length) {
      joinParentPath(menu.children, menu.meta?.hidePathForChildren ? parentPath : menu.path);
    }
  }
}

/** 递归展开 single 包装项：把 { single:true, children:[realItem] } → realItem */
function flattenSingleRoutes(items: any[]): any[] {
  const result: any[] = [];
  for (const item of items) {
    if (item.meta?.single) {
      const realItem = item.children?.[0];
      if (realItem) {
        if (realItem.children?.length) {
          realItem.children = flattenSingleRoutes(realItem.children);
        }
        result.push(realItem);
      }
    } else {
      if (item.children?.length) {
        item.children = flattenSingleRoutes(item.children);
      }
      result.push(item);
    }
  }
  return result;
}

// 将路由转换成菜单
export function transformRouteToMenu(routeModList: any[], routerMapping = false) {
  const cloneRouteModList = cloneDeep(routeModList);

  cloneRouteModList.forEach((item) => {
    if (routerMapping && item.meta.hideChildrenInMenu && typeof item.redirect === 'string') {
      item.path = item.redirect;
    }
  });

  // 递归展开所有层级的 single 包装
  const routeList = flattenSingleRoutes(cloneRouteModList);

  const list = treeMap(routeList, {
    conversion: (node: any) => {
      const { meta: { title, hideMenu = false } = {} } = node;
      return {
        ...(node.meta || {}),
        meta: node.meta,
        name: title,
        hideMenu,
        alwaysShow: node.alwaysShow || false,
        path: node.path,
        ...(node.redirect ? { redirect: node.redirect } : {}),
      };
    },
  });

  joinParentPath(list);
  return cloneDeep(list);
}
