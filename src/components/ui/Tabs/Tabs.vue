<script setup lang="ts">
import { TabsRoot, type TabsRootProps, useForwardPropsEmits } from 'radix-vue';
import { cn } from '/@/utils/cn';
interface Props extends TabsRootProps { class?: string }
const props = defineProps<Props>();
const emits = defineEmits<{ 'update:modelValue': [v: string] }>();
const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <TabsRoot v-bind="forwarded" :class="cn($props.class)">
    <slot />
  </TabsRoot>
</template>
