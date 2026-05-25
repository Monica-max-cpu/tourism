<script setup lang="ts">
/**
 * BasicModal - Dialog 二次封装
 * - 标题/确认/取消统一
 * - 内置 confirmLoading 状态
 * - 通过 useModal 控制
 */
import { computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '/@/components/ui';

interface Props {
  open?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  width?: string;
  hideFooter?: boolean;
  confirmDisabled?: boolean;
  confirmVariant?: 'default' | 'destructive';
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确定',
  cancelText: '取消',
  width: '520px',
  confirmVariant: 'default',
});

const emit = defineEmits<{
  'update:open': [v: boolean];
  confirm: [];
  cancel: [];
}>();

const isOpen = computed({
  get: () => !!props.open,
  set: (v) => emit('update:open', v),
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent :style="{ maxWidth: props.width }">
      <DialogHeader>
        <DialogTitle>{{ props.title }}</DialogTitle>
        <DialogDescription v-if="props.description">{{ props.description }}</DialogDescription>
      </DialogHeader>

      <div class="py-2">
        <slot />
      </div>

      <DialogFooter v-if="!props.hideFooter">
        <slot name="footer">
          <Button variant="outline" :disabled="confirmLoading" @click="emit('cancel'); isOpen = false">{{ cancelText }}</Button>
          <Button :variant="confirmVariant" :disabled="confirmDisabled || confirmLoading" @click="emit('confirm')">
            {{ confirmLoading ? '处理中...' : confirmText }}
          </Button>
        </slot>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
