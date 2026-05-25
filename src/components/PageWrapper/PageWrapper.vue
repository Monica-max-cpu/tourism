<script setup lang="ts">
import { ChevronLeft, Calendar } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { Button } from '/@/components/ui';

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  hero?: boolean;
  variant?: 'sticky' | 'hero';
}
const props = withDefaults(defineProps<Props>(), { showBack: false, hero: false, variant: 'sticky' });
const router = useRouter();
</script>

<template>
  <div class="min-h-full pb-12">
    <!-- Hero 模式：原型风格彩色标题区 -->
    <div v-if="props.hero" class="relative h-48 w-full bg-primary overflow-hidden">
      <!-- 背景装饰图 -->
      <div class="absolute inset-0 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzc5NTV8MHwxfHNlYXJjaHw1fHxkYXRhJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzfGVufDB8MHx8fDE3NzA3MDQ2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
          class="w-full h-full object-cover"
          alt=""
        />
      </div>
      <!-- 渐变遮罩 -->
      <div class="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />

      <!-- 标题内容 -->
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

    <!-- Hero 横幅模式：原型风格深色背景 -->
    <div v-else-if="props.variant === 'hero'" class="relative overflow-hidden rounded-3xl bg-primary text-white p-8 md:p-12 shadow-2xl mx-6 mt-6">
      <!-- 背景图片 + 渐变遮罩 -->
      <img
        class="absolute inset-0 z-0 w-full h-full object-cover opacity-25"
        src="https://pic.rmb.bdstatic.com/bjh/events/35203320101a8fabbfdec81a01935cf2.jpeg@h_1280"
        style="filter: grayscale(30%) sepia(10%);"
        alt=""
      />
      <div class="absolute inset-0 z-[1] bg-gradient-to-br from-primary via-primary/85 to-primary/70" />
      <!-- 装饰圆点 -->
      <div class="absolute top-6 right-12 z-[2] opacity-10">
        <div class="w-32 h-32 rounded-full border-2 border-white" />
        <div class="w-24 h-24 rounded-full border-2 border-white absolute -top-4 -right-4" />
        <div class="w-16 h-16 rounded-full border-2 border-white absolute top-8 -right-8" />
      </div>
      <div class="relative z-10 flex flex-col items-start gap-4">
        <div class="space-y-3">
          <div class="flex items-center gap-3 mb-1">
            <div class="h-px w-8 bg-accent/60 rounded-full" />
            <span class="text-xs font-semibold tracking-[0.2em] uppercase text-accent/80">Cultural Tourism Platform</span>
            <div class="h-px w-8 bg-accent/60 rounded-full" />
          </div>
          <h1 v-if="props.title" class="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
            {{ props.title }}
            <span class="block w-12 h-1 bg-accent rounded-full mt-2" />
          </h1>
          <p v-if="props.subtitle" class="text-sm text-primary-foreground/70 flex items-center gap-2">
            <Calendar class="w-4 h-4 text-accent/70" />
            {{ props.subtitle }}
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <slot name="extra" />
        </div>
      </div>
    </div>

    <!-- 默认模式：sticky 标题栏 -->
    <div v-else class="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
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
