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

// 将路由转换成菜单
export function transformRouteToMenu(routeModList: any[], routerMapping = false) {
  const cloneRouteModList = cloneDeep(routeModList);
  const routeList: any[] = [];

  cloneRouteModList.forEach((item) => {
    if (routerMapping && item.meta.hideChildrenInMenu && typeof item.redirect === 'string') {
      item.path = item.redirect;
    }

    if (item.meta?.single) {
      const realItem = item?.children?.[0];
      realItem && routeList.push(realItem);
    } else {
      routeList.push(item);
    }
  });

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
