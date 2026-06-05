<script setup lang="ts">
/**
 * TableAction - 表格行操作按钮列
 * 自动支持 v-auth 权限隐藏
 */
import { computed } from 'vue';
import { Button } from '/@/components/ui';
import { usePermissionStore } from '/@/stores/modules/permission';

interface ActionItem {
  label: string;
  onClick: () => void;
  authCode?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  hidden?: boolean;
}

const props = defineProps<{ actions: ActionItem[] }>();
const permissionStore = usePermissionStore();

const visibleActions = computed(() =>
  props.actions.filter((a) => {
    if (a.hidden) return false;
    if (a.authCode && !permissionStore.getPermCodeList.includes(a.authCode)) return false;
    return true;
  }),
);
</script>

<template>
  <div class="table-action flex items-center gap-1">
    <template v-for="(a, idx) in visibleActions" :key="a.label">
      <Button :variant="a.variant || 'link'" size="sm" class="h-7 px-2" :disabled="a.disabled" @click.stop="a.onClick">
        {{ a.label }}
      </Button>
      <span v-if="idx < visibleActions.length - 1" class="text-border text-xs">|</span>
    </template>
  </div>
</template>
