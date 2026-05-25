<script setup lang="ts">
import { Label as RadixLabel, type LabelProps } from 'radix-vue';
import { cn } from '/@/utils/cn';

interface Props extends LabelProps { class?: string }
const props = defineProps<Props>();
</script>

<template>
  <RadixLabel v-bind="props" :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', $props.class)">
    <slot />
  </RadixLabel>
</template>
