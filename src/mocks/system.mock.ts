import type { PageResult, PermissionTreeNode, SystemDict, SystemDictItem, SystemMenu, SystemRole, SystemUser } from '/#/system';

const roles: SystemRole[] = [
  { id: 'role-admin', roleName: '平台管理员', roleCode: 'admin', description: '平台后台管理角色', isAppConfig: '0', createTime: '2026-05-01 09:00:00' },
  { id: 'role-operator', roleName: '运营人员', roleCode: 'operator', description: '日常运营角色', isAppConfig: '0', createTime: '2026-05-02 09:00:00' },
];

const users: SystemUser[] = [
  { id: 'u-admin-001', username: 'admin', realname: '平台管理员', phone: '13800000000', email: 'admin@example.com', status: '1', status_dictText: '正常', orgCodeTxt: '平台运营部', selectedroles: ['role-admin'], createTime: '2026-05-01 09:30:00' },
  { id: 'u-op-001', username: 'operator', realname: '运营人员', phone: '13900000000', email: 'operator@example.com', status: '1', status_dictText: '正常', orgCodeTxt: '平台运营部', selectedroles: ['role-operator'], createTime: '2026-05-03 10:00:00' },
];

const dicts: SystemDict[] = [
  { id: 'dict-status', dictName: '启用状态', dictCode: 'dict_item_status', description: '通用启停状态', createTime: '2026-05-01 09:00:00' },
  { id: 'dict-pay', dictName: '支付方式', dictCode: 'pay_type', description: '平台支付渠道', createTime: '2026-05-02 09:00:00' },
];

const deletedDicts: SystemDict[] = [];

const dictItems: SystemDictItem[] = [
  { id: 'item-status-1', dictId: 'dict-status', itemText: '启用', itemValue: '1', itemColor: '#16a34a', sortOrder: 1, status: 1, status_dictText: '启用' },
  { id: 'item-status-0', dictId: 'dict-status', itemText: '禁用', itemValue: '0', itemColor: '#64748b', sortOrder: 2, status: 1, status_dictText: '启用' },
  { id: 'item-pay-cash', dictId: 'dict-pay', itemText: '现金', itemValue: 'cash', itemColor: '#0ea5e9', sortOrder: 1, status: 1, status_dictText: '启用' },
  { id: 'item-pay-bank', dictId: 'dict-pay', itemText: '银行转账', itemValue: 'bank', itemColor: '#f59e0b', sortOrder: 2, status: 1, status_dictText: '启用' },
];

const menus: SystemMenu[] = [
  {
    id: 'menu-system',
    name: '系统管理',
    menuType: 0,
    icon: 'Settings',
    url: '/b2b/admin/system',
    component: 'layouts/default/index',
    sortNo: 100,
    route: true,
    children: [
      { id: 'menu-users', parentId: 'menu-system', name: '用户管理', menuType: 1, url: '/b2b/admin/system/users', component: 'system/user/UserManage', sortNo: 1, route: true },
      { id: 'menu-roles', parentId: 'menu-system', name: '角色管理', menuType: 1, url: '/b2b/admin/system/roles', component: 'system/role/RoleManage', sortNo: 2, route: true },
      {
        id: 'menu-menus',
        parentId: 'menu-system',
        name: '菜单管理',
        menuType: 1,
        url: '/b2b/admin/system/menus',
        component: 'system/menu/MenuManage',
        sortNo: 3,
        route: true,
        children: [
          { id: 'perm-menu-add', parentId: 'menu-menus', name: '新增菜单', menuType: 2, perms: 'system:menu:add', permsType: '1', status: '1' },
        ],
      },
    ],
  },
];

const permissionTree: PermissionTreeNode[] = [
  {
    key: 'menu-system',
    title: '系统管理',
    children: [
      { key: 'menu-users', title: '用户管理' },
      { key: 'menu-roles', title: '角色管理' },
      {
        key: 'menu-menus',
        title: '菜单管理',
        children: [{ key: 'perm-menu-add', title: '新增菜单' }],
      },
    ],
  },
];

let rolePermissionMap: Record<string, string[]> = {
  'role-admin': ['menu-system', 'menu-users', 'menu-roles', 'menu-menus', 'perm-menu-add'],
  'role-operator': ['menu-users', 'menu-roles'],
};

function filterByKeyword<T extends Record<string, any>>(items: T[], params: Recordable, fields: string[]) {
  return items.filter((item) =>
    fields.every((field) => {
      const value = params[field];
      if (!value) return true;
      return String(item[field] ?? '').includes(String(value));
    }),
  );
}

function page<T>(items: T[], params: Recordable = {}): PageResult<T> {
  const pageNo = Number(params.pageNo || 1);
  const pageSize = Number(params.pageSize || 10);
  const start = (pageNo - 1) * pageSize;
  return { records: items.slice(start, start + pageSize), total: items.length };
}

export function mockListUsers(params: Recordable) {
  return Promise.resolve(page(filterByKeyword(users, params, ['username', 'realname', 'phone', 'status']), params));
}

export function mockSaveUser(data: Partial<SystemUser> & Recordable, isUpdate: boolean) {
  if (isUpdate && data.id) {
    const index = users.findIndex((item) => item.id === data.id);
    if (index >= 0) users[index] = { ...users[index], ...data } as SystemUser;
  } else {
    users.unshift({ id: `u-${Date.now()}`, status: '1', status_dictText: '正常', createTime: new Date().toISOString(), ...data } as SystemUser);
  }
  return Promise.resolve();
}

export function mockDeleteUser(id: string) {
  const index = users.findIndex((item) => item.id === id);
  if (index >= 0) users.splice(index, 1);
  return Promise.resolve();
}

export function mockUserRoles(id: string) {
  return Promise.resolve(users.find((item) => item.id === id)?.selectedroles || []);
}

export function mockRoles() {
  return Promise.resolve(roles);
}

export function mockImportUsers() {
  return Promise.resolve();
}

export function mockExportUsers() {
  return Promise.resolve(new Blob(['username,realname\nadmin,平台管理员\n'], { type: 'text/csv;charset=utf-8' }));
}

export function mockListDicts(params: Recordable) {
  return Promise.resolve(page(filterByKeyword(dicts, params, ['dictName', 'dictCode']), params));
}

export function mockSaveDict(data: Partial<SystemDict> & Recordable, isUpdate: boolean) {
  if (isUpdate && data.id) {
    const index = dicts.findIndex((item) => item.id === data.id);
    if (index >= 0) dicts[index] = { ...dicts[index], ...data } as SystemDict;
  } else {
    dicts.unshift({ id: `dict-${Date.now()}`, createTime: new Date().toISOString(), ...data } as SystemDict);
  }
  return Promise.resolve();
}

export function mockDeleteDict(id: string) {
  const index = dicts.findIndex((item) => item.id === id);
  if (index >= 0) {
    deletedDicts.unshift(dicts[index]);
    dicts.splice(index, 1);
  }
  return Promise.resolve();
}

export function mockListDictItems(params: Recordable) {
  const rows = dictItems
    .filter((item) => item.dictId === params.dictId)
    .filter((item) => (!params.itemText ? true : item.itemText.includes(String(params.itemText))))
    .filter((item) => (!params.status && params.status !== 0 ? true : String(item.status) === String(params.status)));
  return Promise.resolve(page(rows, params));
}

export function mockSaveDictItem(data: Partial<SystemDictItem> & Recordable, isUpdate: boolean) {
  if (isUpdate && data.id) {
    const index = dictItems.findIndex((item) => item.id === data.id);
    if (index >= 0) dictItems[index] = { ...dictItems[index], ...data } as SystemDictItem;
  } else {
    dictItems.unshift({ id: `item-${Date.now()}`, sortOrder: 1, status: 1, ...data } as SystemDictItem);
  }
  return Promise.resolve();
}

export function mockDeleteDictItem(id: string) {
  const index = dictItems.findIndex((item) => item.id === id);
  if (index >= 0) dictItems.splice(index, 1);
  return Promise.resolve();
}

export function mockListDictRecycleBin(params: Recordable) {
  return Promise.resolve(page(deletedDicts, params));
}

export function mockRestoreDict(id: string) {
  const index = deletedDicts.findIndex((item) => item.id === id);
  if (index >= 0) {
    dicts.unshift(deletedDicts[index]);
    deletedDicts.splice(index, 1);
  }
  return Promise.resolve();
}

export function mockDeleteDictPhysically(id: string) {
  const index = deletedDicts.findIndex((item) => item.id === id);
  if (index >= 0) deletedDicts.splice(index, 1);
  return Promise.resolve();
}

export function mockQueryAllDictItems() {
  return Promise.resolve(
    dictItems.reduce<Record<string, SystemDictItem[]>>((acc, item) => {
      const dictCode = dicts.find((dict) => dict.id === item.dictId)?.dictCode;
      if (!dictCode) return acc;
      acc[dictCode] = [...(acc[dictCode] || []), item];
      return acc;
    }, {}),
  );
}

export function mockImportDicts() {
  return Promise.resolve();
}

export function mockExportDicts() {
  return Promise.resolve(new Blob(['dictName,dictCode\n启用状态,dict_item_status\n'], { type: 'text/csv;charset=utf-8' }));
}

export function mockListRoles(params: Recordable) {
  return Promise.resolve(page(filterByKeyword(roles, params, ['roleName', 'roleCode']), params));
}

export function mockSaveRole(data: Partial<SystemRole> & Recordable, isUpdate: boolean) {
  if (isUpdate && data.id) {
    const index = roles.findIndex((item) => item.id === data.id);
    if (index >= 0) roles[index] = { ...roles[index], ...data } as SystemRole;
  } else {
    roles.unshift({ id: `role-${Date.now()}`, createTime: new Date().toISOString(), ...data } as SystemRole);
  }
  return Promise.resolve();
}

export function mockDeleteRole(id: string) {
  const index = roles.findIndex((item) => item.id === id);
  if (index >= 0) roles.splice(index, 1);
  return Promise.resolve();
}

export function mockPermissionTree() {
  return Promise.resolve({ treeList: permissionTree, ids: ['menu-system', 'menu-users', 'menu-roles', 'menu-menus', 'perm-menu-add'] });
}

export function mockRolePermission(roleId: string) {
  return Promise.resolve(rolePermissionMap[roleId] || []);
}

export function mockSaveRolePermission(roleId: string, permissionIds: string[]) {
  rolePermissionMap = { ...rolePermissionMap, [roleId]: permissionIds };
  return Promise.resolve();
}

export function mockListMenus(params: Recordable = {}) {
  if (!params.name) return Promise.resolve(menus);
  const matchName = String(params.name);
  return Promise.resolve(menus.filter((item) => item.name.includes(matchName)));
}

export function mockSaveMenu(data: Partial<SystemMenu> & Recordable, isUpdate: boolean) {
  if (!isUpdate) {
    menus.push({ id: `menu-${Date.now()}`, menuType: 0, ...data } as SystemMenu);
  }
  return Promise.resolve();
}

export function mockDeleteMenu() {
  return Promise.resolve();
}
