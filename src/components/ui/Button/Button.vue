<script setup lang="ts">
import { computed } from 'vue';
import { Primitive, type PrimitiveProps } from 'radix-vue';
import { buttonVariants, type ButtonVariants } from './index';
import { cn } from '/@/utils/cn';

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  type: 'button',
});

const classes = computed(() => cn(buttonVariants({ variant: props.variant, size: props.size }), props.class));
</script>

<template>
  <Primitive :as="as" :as-child="asChild" :class="classes" :disabled="disabled" :type="as === 'button' ? type : undefined">
    <slot />
  </Primitive>
</template>
