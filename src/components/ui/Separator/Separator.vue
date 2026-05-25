<script setup lang="ts">
import { Separator as RadixSeparator, type SeparatorProps } from 'radix-vue';
import { cn } from '/@/utils/cn';

interface Props extends SeparatorProps { class?: string }
const props = withDefaults(defineProps<Props>(), { orientation: 'horizontal', decorative: true });
</script>

<template>
  <RadixSeparator v-bind="props" :class="cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', $props.class)" />
</template>
