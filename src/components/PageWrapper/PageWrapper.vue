<script setup lang="ts">
import { ChevronLeft, Calendar } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { Button } from '/@/components/ui';

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  hero?: boolean;
}
const props = withDefaults(defineProps<Props>(), { showBack: false, hero: false });
const router = useRouter();
</script>

<template>
  <div class="min-h-full pb-12">
    <!-- Hero 模式：工作台专用，带背景图的高 banner -->
    <div v-if="props.hero" class="relative h-48 w-full bg-primary overflow-hidden">
      <div class="absolute inset-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzc5NTV8MHwxfHNlYXJjaHw1fHxkYXRhJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzfGVufDB8MHx8fDE3NzA3MDQ2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
          class="w-full h-full object-cover"
          alt=""
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
      <div class="relative container mx-auto px-6 h-full flex flex-col justify-center">
        <div class="animate-fade-in-up text-primary-foreground">
          <h1 class="text-3xl font-bold mb-2">{{ props.title }}</h1>
          <p class="text-primary-foreground/80 flex items-center gap-2">
            <Calendar class="w-4 h-4" />
            {{ props.subtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- 默认模式：原型风格渐变圆角卡片头部 -->
    <div v-else class="px-6 pt-6">
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 text-white p-6 md:p-8 shadow-lg mb-6">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <Button v-if="props.showBack" variant="ghost" size="icon" class="text-white hover:bg-white/10 shrink-0" @click="router.back()">
              <ChevronLeft class="w-5 h-5" />
            </Button>
            <div>
              <h1 v-if="props.title" class="text-2xl md:text-3xl font-bold tracking-tight">{{ props.title }}</h1>
              <p v-if="props.subtitle" class="text-primary-foreground/70 mt-1.5 text-sm">{{ props.subtitle }}</p>
            </div>
          </div>
          <div v-if="$slots.extra" class="header-extra flex items-center gap-3 shrink-0">
            <slot name="extra" />
          </div>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="px-0">
        <slot />
      </div>
    </div>

    <!-- hero 模式内容区 -->
    <div v-if="props.hero" class="px-6 py-6">
      <slot />
    </div>
  </div>
</template>

<style>
/* 头部 #extra 按钮统一半透明白，适配渐变背景 */
.header-extra button {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}
.header-extra button:hover {
  background-color: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}
</style>
