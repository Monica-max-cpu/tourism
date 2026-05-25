<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '/@/components/ui';
const router = useRouter();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center space-y-6 px-4">
      <div class="text-9xl font-bold text-primary/20 select-none">404</div>
      <h1 class="text-2xl font-bold tracking-tight">页面不存在</h1>
      <p class="text-muted-foreground">您访问的页面已被移除或链接错误</p>
      <Button @click="router.push('/')">返回首页</Button>
    </div>
  </div>
</template>
