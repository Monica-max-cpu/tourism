import { collectNodeKeys, mergeCheckedTreeKeys, normalizeCheckedTreeKeys } from '/@/views/system/role/components/permissionTree';
import type { PermissionTreeNode } from '/#/system';

describe('permission tree selection', () => {
  const userMenu: PermissionTreeNode = {
    key: 'menu-users',
    title: '用户管理',
    children: [
      { key: 'perm-user-add', title: '新增' },
      { key: 'perm-user-edit', title: '编辑' },
    ],
  };

  it('collects the checked menu key and all descendant button keys', () => {
    expect(collectNodeKeys(userMenu)).toEqual(['menu-users', 'perm-user-add', 'perm-user-edit']);
  });

  it('keeps the route menu id when checking a menu with button children', () => {
    const next = mergeCheckedTreeKeys(['menu-system'], userMenu, true);

    expect(next).toEqual(['menu-system', 'menu-users', 'perm-user-add', 'perm-user-edit']);
  });

  it('removes the route menu id and descendant button keys when unchecking it', () => {
    const next = mergeCheckedTreeKeys(
      ['menu-system', 'menu-users', 'perm-user-add', 'perm-user-edit', 'menu-roles'],
      userMenu,
      false,
    );

    expect(next).toEqual(['menu-system', 'menu-roles']);
  });

  it('adds ancestor menu keys before saving when only descendant button keys are checked', () => {
    const tree: PermissionTreeNode[] = [
      {
        key: 'menu-system',
        title: '系统管理',
        children: [userMenu],
      },
    ];

    expect(normalizeCheckedTreeKeys(tree, ['perm-user-add'])).toEqual(['perm-user-add', 'menu-users', 'menu-system']);
  });
});
