<script setup lang="ts">
import Sider from './Sider.vue';
import Header from './Header.vue';
</script>

<template>
  <div class="h-screen w-screen flex">
    <Sider />
    <div class="flex-1 flex flex-col min-w-0">
      <Header />
      <main class="flex-1 overflow-y-auto">
        <div class="relative min-h-full">
          <div class="absolute inset-0 z-0 pointer-events-none opacity-5">
            <img
              src="https://pic.rmb.bdstatic.com/bjh/events/35203320101a8fabbfdec81a01935cf2.jpeg@h_1280"
              class="h-full w-full object-cover"
              style="object-position: right bottom; filter: grayscale(30%) sepia(10%);"
              alt=""
            />
          </div>
          <div
            class="absolute inset-0 z-0 pointer-events-none"
            style="background: linear-gradient(to bottom, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.03) 50%, transparent 100%)"
          />
          <div class="relative z-10 p-4 lg:p-8 min-h-[calc(100vh-10rem)]">
            <RouterView v-slot="{ Component, route }">
              <component :is="Component" :key="route.fullPath" />
            </RouterView>
          </div>
          <footer class="relative z-10 border-t border-border bg-slate-50 p-8">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                  <span class="text-primary text-[10px] font-bold">B2B</span>
                </div>
                <p class="text-sm text-muted-foreground">© 2026 B2B 集采管理平台 · 数字化集采产业管理</p>
              </div>
              <div class="flex items-center gap-6 text-xs text-muted-foreground font-medium">
                <a href="#" class="hover:text-primary transition-colors">隐私政策</a>
                <a href="#" class="hover:text-primary transition-colors">服务条款</a>
                <a href="#" class="hover:text-primary transition-colors">技术支持</a>
                <span class="px-2 py-0.5 bg-accent rounded text-accent-foreground">V1.0</span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  </div>
</template>
