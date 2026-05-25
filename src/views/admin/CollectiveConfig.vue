<script setup lang="ts">
/**
 * 平台管理员 - 集采触发配置
 */
import { reactive, ref, onMounted } from 'vue';
import { Settings2, Save } from 'lucide-vue-next';
import { Button, Card, CardContent, Input, Label, Switch } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { getCollectiveConfigApi, updateCollectiveConfigApi } from '/@/api/admin/fulfillment';

const form = reactive({
  qtyThreshold: 100,
  hoursTimeout: 48,
  autoTrigger: true,
});
const loading = ref(true);
const submitting = ref(false);
const saved = ref(false);

async function load() {
  loading.value = true;
  try {
    const cfg = await getCollectiveConfigApi();
    Object.assign(form, cfg);
  } finally {
    loading.value = false;
  }
}

async function save() {
  submitting.value = true;
  try {
    await updateCollectiveConfigApi({ ...form });
    saved.value = true;
    setTimeout(() => (saved.value = false), 2000);
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <PageWrapper title="集采触发配置" subtitle="管理集采订单的自动触发规则">
    <Card class="max-w-3xl">
      <CardContent class="p-6 space-y-6">
        <div class="flex items-center gap-3 pb-4 border-b border-border">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Settings2 class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-semibold">触发规则</h3>
            <p class="text-sm text-muted-foreground">满足任一规则即可自动触发集采（启用时）</p>
          </div>
        </div>

        <div class="flex items-center justify-between py-2">
          <div>
            <Label class="text-base">启用自动触发</Label>
            <p class="text-xs text-muted-foreground mt-1">关闭后仅支持在「待集采订单」页手动触发</p>
          </div>
          <Switch v-model:checked="form.autoTrigger" />
        </div>

        <div class="space-y-2 pt-2 border-t border-border">
          <Label>数量阈值（件）<span class="text-destructive">*</span></Label>
          <Input v-model.number="form.qtyThreshold" type="number" min="1" :disabled="!form.autoTrigger" />
          <p class="text-xs text-muted-foreground">
            单 SKU 累计未集采订单达到此数量时自动触发，建议 50 - 200
          </p>
        </div>

        <div class="space-y-2">
          <Label>超时时长（小时）<span class="text-destructive">*</span></Label>
          <Input v-model.number="form.hoursTimeout" type="number" min="1" :disabled="!form.autoTrigger" />
          <p class="text-xs text-muted-foreground">
            单 SKU 自上次集采起，等待时长超过此值时强制触发，建议 24 - 72
          </p>
        </div>

        <div class="flex items-center gap-3 pt-4 border-t border-border">
          <Button v-auth="'b2b:collective:config'" :disabled="submitting || loading" @click="save">
            <Save class="w-4 h-4 mr-1.5" />
            {{ submitting ? '保存中...' : '保存配置' }}
          </Button>
          <span v-if="saved" class="text-sm text-[hsl(var(--status-success))]">✓ 已保存</span>
        </div>
      </CardContent>
    </Card>
  </PageWrapper>
</template>
