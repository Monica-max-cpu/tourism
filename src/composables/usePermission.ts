/**
 * usePermission - 模板内权限判断
 */
import { computed } from 'vue';
import { useUserStore } from '/@/stores/modules/user';

export function usePermission() {
  const userStore = useUserStore();
  const has = (code: string | string[]) => {
    const perms = userStore.getPermissions;
    if (typeof code === 'string') return perms.includes(code);
    return code.some((c) => perms.includes(c));
  };
  return {
    permissions: computed(() => userStore.getPermissions),
    has,
  };
}
