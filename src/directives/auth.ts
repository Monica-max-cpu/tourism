/**
 * v-auth 指令：无权限时移除节点
 * 用法：<button v-auth="'b2b:supplier:review'">审核</button>
 *      <button v-auth="['a','b']">需任一权限</button>
 */
import type { App, Directive } from 'vue';
import { useUserStoreWithOut } from '/@/stores/modules/user';

function check(value: unknown): boolean {
  const perms = useUserStoreWithOut().getPermissions;
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
