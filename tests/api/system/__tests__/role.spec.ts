import { buildRolePermissionPayload } from '/@/api/system/_helpers';

describe('system role api', () => {
  it('builds the JSON request body required by role authorization', () => {
    expect(buildRolePermissionPayload('role-1', ['menu-1', 'perm-2'], ['menu-0'])).toEqual({
      roleId: 'role-1',
      permissionIds: 'menu-1,perm-2',
      lastpermissionIds: 'menu-0',
    });
  });
});
