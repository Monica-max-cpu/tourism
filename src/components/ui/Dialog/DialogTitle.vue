<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from 'radix-vue';
import { cn } from '/@/utils/cn';
interface Props extends DialogTitleProps { class?: string }
const props = defineProps<Props>();
</script>

<template>
  <DialogTitle v-bind="props" :class="cn('text-lg font-semibold leading-none tracking-tight', $props.class)">
    <slot />
  </DialogTitle>
</template>
