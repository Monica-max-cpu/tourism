<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CheckCircle2 } from 'lucide-vue-next';
import { Button, Card, CardContent, Badge } from '/@/components/ui';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import ApplyShell from './ApplyShell.vue';

const route = useRoute();
const router = useRouter();
const type = computed(() => route.query.type as string);
const applyNo = computed(() => (route.query.applyNo as string) || '-');
const name = computed(() => (route.query.name as string) || '-');
const typeLabel = computed(() => (type.value === 'supplier' ? '供应商' : '门店'));
</script>

<template>
  <ApplyShell title="提交成功" subtitle="平台将在 1-3 个工作日内完成审核">
    <Card>
      <CardContent class="p-8 md:p-12 text-center space-y-6">
        <div class="inline-flex w-16 h-16 rounded-full bg-[hsl(var(--status-success))]/10 items-center justify-center">
          <CheckCircle2 class="w-10 h-10 text-[hsl(var(--status-success))]" />
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">{{ typeLabel }}入驻申请已提交</h2>
          <p class="text-muted-foreground">我们会尽快审核您的申请，审核结果将通过您填写的联系电话通知</p>
        </div>

        <div class="max-w-md mx-auto bg-muted/50 rounded-lg p-4 text-left space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">申请编号</span>
            <span class="font-mono font-medium">{{ applyNo }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">{{ typeLabel }}名称</span>
            <span class="font-medium">{{ name }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">当前状态</span>
            <Badge variant="warning">待审核</Badge>
          </div>
        </div>

        <div class="pt-4">
          <Button @click="router.push(ROUTE_PATHS.LOGIN)">返回登录</Button>
        </div>
      </CardContent>
    </Card>
  </ApplyShell>
</template>
