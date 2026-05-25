<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { Button } from '/@/components/ui';

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}
const props = withDefaults(defineProps<Props>(), { showBack: false });
const router = useRouter();
</script>

<template>
  <div class="min-h-full pb-12">
    <div class="sticky top-0 z-30 border-b border-border">
      <div class="px-6 py-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <Button v-if="props.showBack" variant="ghost" size="icon" @click="router.back()">
            <ChevronLeft class="w-5 h-5" />
          </Button>
          <div>
            <h1 v-if="props.title" class="text-2xl font-bold text-foreground tracking-tight">{{ props.title }}</h1>
            <p v-if="props.subtitle" class="text-sm text-muted-foreground mt-1">{{ props.subtitle }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <slot name="extra" />
        </div>
      </div>
    </div>

    <div class="px-6 py-6">
      <slot />
    </div>
  </div>
</template>
