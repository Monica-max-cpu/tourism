<script setup lang="ts">
/**
 * update-begin--author:claude---date:2026-05-24---for:【修复】radix-vue SelectItem 不允许 value=''
 * - 业务字典常量保持 { value: '', label: '全部' } 写法不动
 * - 本组件把传入的 '' 自动转成哨兵 '__ALL__'，与 Select.vue 的 modelValue 映射成对
 * update-end--author:claude---date:2026-05-24---for:【修复】radix-vue SelectItem 不允许 value=''
 */
import { computed } from 'vue';
import { SelectItem, SelectItemIndicator, SelectItemText } from 'radix-vue';
import { Check } from 'lucide-vue-next';
import { cn } from '/@/utils/cn';
import { toInnerValue } from './constants';

interface Props {
  value: string | number | boolean;
  disabled?: boolean;
  textValue?: string;
  class?: string;
}
const props = defineProps<Props>();

const safeValue = computed(() => toInnerValue(props.value));
</script>

<template>
  <SelectItem
    :value="safeValue"
    :disabled="props.disabled"
    :text-value="props.textValue"
    :class="
      cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        $props.class,
      )
    "
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectItemIndicator>
        <Check class="h-4 w-4" />
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
