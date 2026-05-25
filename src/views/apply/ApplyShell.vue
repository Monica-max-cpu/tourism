<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { Button } from '/@/components/ui';
import { ROUTE_PATHS } from '/@/constants/routePaths';

defineProps<{ title: string; subtitle?: string }>();
const router = useRouter();
</script>

<template>
  <div class="min-h-screen relative flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
    <!-- 装饰性背景 -->
    <div
      class="absolute inset-0 -z-10 opacity-[0.35] pointer-events-none"
      style="background-image: url('https://pic.rmb.bdstatic.com/bjh/events/35203320101a8fabbfdec81a01935cf2.jpeg@h_1280'); background-size: cover; background-position: center; filter: grayscale(40%) sepia(10%);"
    />

    <!-- Header -->
    <header class="border-b border-border/50 bg-card/50 backdrop-blur-md">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span class="text-primary-foreground font-bold text-sm">B2B</span>
          </div>
          <span class="font-semibold tracking-tight">集采管理平台</span>
        </div>
        <Button variant="ghost" size="sm" @click="router.push(ROUTE_PATHS.LOGIN)">
          <ChevronLeft class="w-4 h-4 mr-1.5" />
          返回登录
        </Button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <div class="mb-10 text-center animate-fade-in-up">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="mt-3 text-muted-foreground text-lg">{{ subtitle }}</p>
      </div>

      <div class="animate-fade-in-up" style="animation-delay: 0.1s">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 border-t border-border/50 bg-white">
      <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © 2026 B2B 集采管理平台 · 数字化集采产业管理
      </div>
    </footer>
  </div>
</template>
