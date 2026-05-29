<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AlertCircle, CheckCircle2, Clock3, Loader2, Store, Truck } from 'lucide-vue-next';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '/@/components/ui';
import { getUserApplicationStatusApi } from '/@/api/b2b/entry';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import {
  BIND_STATUS_LABEL,
  OPERATION_STATUS_LABEL,
  OPERATION_STATUS_VARIANT,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_VARIANT,
} from '/@/constants/b2bStatus';
import type { MerchantApplicationStatus, UserApplicationStatus } from '/#/b2b';

const router = useRouter();
const loading = ref(false);
const status = ref<UserApplicationStatus>({});

const cards = computed(() => [
  {
    type: 'supplier' as const,
    title: '供应商入驻',
    subtitle: '提交企业资质、结算账户和经营信息，审核通过后获得供应商工作台权限。',
    icon: Truck,
    data: status.value.supplier,
    applyPath: ROUTE_PATHS.APPLY_SUPPLIER,
  },
  {
    type: 'store' as const,
    title: '门店入驻',
    subtitle: '提交门店主体、经营地址和资质信息，审核通过后获得采购门店权限。',
    icon: Store,
    data: status.value.store,
    applyPath: ROUTE_PATHS.APPLY_STORE,
  },
]);

function progressIndex(item?: MerchantApplicationStatus) {
  if (!item) return 0;
  if (item.reviewStatus === 2) return 3;
  if (item.reviewStatus === 1) return 3;
  return 2;
}

function stepTone(index: number, item?: MerchantApplicationStatus) {
  const current = progressIndex(item);
  if (!item && index === 0) return 'bg-primary text-primary-foreground';
  if (index < current) return 'bg-success text-white';
  if (index === current) {
    if (item?.reviewStatus === 2) return 'bg-destructive text-destructive-foreground';
    if (item?.reviewStatus === 1) return 'bg-success text-white';
    return 'bg-warning text-warning-foreground';
  }
  return 'bg-muted text-muted-foreground';
}

async function loadStatus() {
  loading.value = true;
  try {
    status.value = await getUserApplicationStatusApi();
  } finally {
    loading.value = false;
  }
}

function actionText(item?: MerchantApplicationStatus) {
  if (!item) return '立即申请';
  if (item.reviewStatus === 1) return '审核通过，请重新登录';
  if (item.reviewStatus === 2) return '重新申请';
  return '查看审核进度';
}

function goApply(path: string) {
  router.push(path);
}

onMounted(loadStatus);
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-medium text-muted-foreground">入驻中心</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight">选择要开通的 B2B 身份</h1>
        <p class="mt-2 text-muted-foreground">申请提交后由管理员审核，审核通过后重新登录即可进入对应工作台。</p>
      </div>
      <Button variant="outline" :disabled="loading" @click="loadStatus">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        刷新进度
      </Button>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <Card v-for="card in cards" :key="card.type" class="border-border/70">
        <CardHeader class="space-y-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <component :is="card.icon" class="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle class="text-xl">{{ card.title }}</CardTitle>
                <p class="mt-1 text-sm text-muted-foreground">{{ card.subtitle }}</p>
              </div>
            </div>
            <Badge v-if="card.data?.reviewStatus !== undefined" :variant="REVIEW_STATUS_VARIANT[card.data.reviewStatus]">
              {{ REVIEW_STATUS_LABEL[card.data.reviewStatus] }}
            </Badge>
            <Badge v-else variant="secondary">未申请</Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-4 gap-2">
            <div v-for="(label, index) in ['未申请', '已提交', '审核中', '完成']" :key="label" class="space-y-2">
              <div class="h-2 rounded-full" :class="stepTone(index, card.data)" />
              <div class="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 v-if="index < progressIndex(card.data)" class="h-3.5 w-3.5 text-success" />
                <Clock3 v-else-if="index === progressIndex(card.data) && card.data?.reviewStatus === 0" class="h-3.5 w-3.5 text-warning" />
                <AlertCircle v-else-if="index === progressIndex(card.data) && card.data?.reviewStatus === 2" class="h-3.5 w-3.5 text-destructive" />
                <span>{{ label }}</span>
              </div>
            </div>
          </div>

          <div v-if="card.data" class="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm md:grid-cols-2">
            <div>
              <span class="text-muted-foreground">审核状态：</span>
              <Badge :variant="REVIEW_STATUS_VARIANT[card.data.reviewStatus ?? 0]">{{ REVIEW_STATUS_LABEL[card.data.reviewStatus ?? 0] }}</Badge>
            </div>
            <div>
              <span class="text-muted-foreground">运营状态：</span>
              <Badge :variant="OPERATION_STATUS_VARIANT[card.data.operationStatus ?? 0]">{{ OPERATION_STATUS_LABEL[card.data.operationStatus ?? 0] }}</Badge>
            </div>
            <div v-if="card.data.bindStatus !== undefined">
              <span class="text-muted-foreground">绑定状态：</span>{{ BIND_STATUS_LABEL[card.data.bindStatus] }}
            </div>
            <div v-if="card.data.createTime">
              <span class="text-muted-foreground">提交时间：</span>{{ card.data.createTime }}
            </div>
            <div v-if="card.data.reviewRemark" class="md:col-span-2 text-destructive">
              <span class="text-muted-foreground">拒绝原因：</span>{{ card.data.reviewRemark }}
            </div>
          </div>

          <div class="flex justify-end">
            <Button
              :variant="card.data?.reviewStatus === 1 ? 'outline' : 'default'"
              :disabled="card.data?.reviewStatus === 1 || card.data?.reviewStatus === 0"
              @click="goApply(card.applyPath)"
            >
              {{ actionText(card.data) }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
