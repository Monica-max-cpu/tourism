<script setup lang="ts">
import { cn } from '/@/utils/cn';
import type { ClassValue } from 'clsx';
defineProps<{ class?: ClassValue }>();
</script>

<template>
  <div :class="cn('rounded-lg border bg-card text-card-foreground shadow-sm', $props.class)">
    <slot />
  </div>
</template>
