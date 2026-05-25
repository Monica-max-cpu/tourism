<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { Button } from '/@/components/ui';
import { ROUTE_PATHS } from '/@/constants/routePaths';

defineProps<{ title: string; subtitle?: string }>();
const router = useRouter();
</script>

<template>
  <div class="min-h-screen relative bg-gradient-to-br from-background via-background to-accent/20">
    <header class="border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">B2B</div>
          <span class="font-semibold tracking-tight">集采管理平台</span>
        </div>
        <Button variant="ghost" size="sm" @click="router.push(ROUTE_PATHS.LOGIN)">
          <ChevronLeft class="w-4 h-4 mr-1.5" />
          返回登录
        </Button>
      </div>
    </header>

    <main class="container mx-auto px-4 py-12 max-w-3xl">
      <div class="mb-8 text-center animate-fade-in-up">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="mt-2 text-muted-foreground">{{ subtitle }}</p>
      </div>
      <slot />
    </main>
  </div>
</template>
