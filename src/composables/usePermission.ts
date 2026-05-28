/**
 * usePermission - 模板内权限判断
 * BACK 模式：权限码来自 permissionStore.permCodeList
 */
import { computed } from 'vue';
import { useUserStore } from '/@/stores/modules/user';
import { usePermissionStore } from '/@/stores/modules/permission';

export function usePermission() {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  const has = (code: string | string[]) => {
    const perms = permissionStore.getPermCodeList;
    if (typeof code === 'string') return perms.includes(code);
    return code.some((c) => perms.includes(c));
  };

  return {
    permissions: computed(() => permissionStore.getPermCodeList),
    has,
  };
}
