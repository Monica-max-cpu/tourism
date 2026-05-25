<script setup lang="ts">
import { cn } from '/@/utils/cn';
import { badgeVariants, type BadgeVariants } from './index';

interface Props {
  variant?: BadgeVariants['variant'];
  class?: string;
}
const props = defineProps<Props>();
</script>

<template>
  <div :class="cn(badgeVariants({ variant: props.variant }), $props.class)">
    <slot />
  </div>
</template>
