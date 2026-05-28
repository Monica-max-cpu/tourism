/**
 * v-auth 指令：无权限时移除节点
 * BACK 模式：权限码来自 permissionStore.permCodeList
 */
import type { App, Directive } from 'vue';
import { usePermissionStoreWithOut } from '/@/stores/modules/permission';

function check(value: unknown): boolean {
  const perms = usePermissionStoreWithOut().getPermCodeList;
  if (typeof value === 'string') return perms.includes(value);
  if (Array.isArray(value)) return value.some((v) => perms.includes(v));
  return true;
}

const authDirective: Directive = {
  mounted(el, binding) {
    if (!check(binding.value)) {
      el.parentNode?.removeChild(el);
    }
  },
  updated(el, binding) {
    if (!check(binding.value)) {
      el.parentNode?.removeChild(el);
    }
  },
};

export function setupAuthDirective(app: App) {
  app.directive('auth', authDirective);
}
