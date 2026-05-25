<script setup lang="ts">
import { computed } from 'vue';
import { SelectRoot, type SelectRootProps, type SelectRootEmits, useForwardPropsEmits } from 'radix-vue';
import { toInnerValue, toOuterValue } from './constants';

const props = defineProps<SelectRootProps>();
const emit = defineEmits<SelectRootEmits>();

const forwarded = useForwardPropsEmits(props, emit);

const mapped = computed(() => ({
  ...forwarded.value,
  modelValue: toInnerValue(forwarded.value.modelValue),
  'onUpdate:modelValue': (v: string) => emit('update:modelValue', toOuterValue(v)),
}));
</script>

<template>
  <SelectRoot v-bind="mapped">
    <slot />
  </SelectRoot>
</template>
