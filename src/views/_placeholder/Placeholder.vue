<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Construction } from 'lucide-vue-next';
import { Card, CardContent, Badge } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
const route = useRoute();
</script>

<template>
  <PageWrapper :title="String(route.meta.title || '页面')" subtitle="该页面将在后续阶段实现">
    <Card>
      <CardContent class="p-12 text-center space-y-4">
        <div class="inline-flex w-14 h-14 rounded-2xl bg-muted items-center justify-center">
          <Construction class="w-7 h-7 text-muted-foreground" />
        </div>
        <Badge variant="muted">占位页</Badge>
        <h2 class="text-xl font-semibold">{{ route.meta.title }}</h2>
        <p class="text-sm text-muted-foreground max-w-md mx-auto">阶段 1 仅交付脚手架与登录/入驻/工作台。后续阶段将按 b2b-frontend-design-doc.md 实现该页面。</p>
        <p class="text-xs font-mono text-muted-foreground">{{ route.path }}</p>
      </CardContent>
    </Card>
  </PageWrapper>
</template>
