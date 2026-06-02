<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle2, Clock3, Loader2, Store, Truck } from 'lucide-vue-next';
import {
  Badge, Button, Card, CardContent, CardHeader, CardTitle,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Input, Label,
} from '/@/components/ui';
import { getUserApplicationStatusApi } from '/@/api/b2b/entry';
import { claimOnboardingApi } from '/@/api/b2b/apply';
import { getCaptchaApi } from '/@/api/login/api';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { BIND_STATUS_LABEL, normalizeReviewStatus } from '/@/constants/b2bStatus';
import type { MerchantApplicationStatus, UserApplicationStatus, MerchantType } from '/#/b2b';

const router = useRouter();
const loading = ref(false);
const status = ref<UserApplicationStatus>({});

const BIND_STATUS_VARIANT: Record<number, 'warning' | 'success' | 'destructive'> = {
  0: 'warning',
  1: 'success',
  2: 'destructive',
};

const cards = computed(() => [
  {
    type: 'SUPPLIER' as MerchantType,
    title: '供应商入驻',
    subtitle: '提交企业资质、结算账户和经营信息，审核通过后获得供应商工作台权限。',
    icon: Truck,
    data: status.value.supplier,
    applyPath: ROUTE_PATHS.APPLY_SUPPLIER,
    workbenchPath: ROUTE_PATHS.SUPPLIER_WORKBENCH,
  },
  {
    type: 'STORE' as MerchantType,
    title: '门店入驻',
    subtitle: '提交门店主体、经营地址和资质信息，审核通过后获得采购门店权限。',
    icon: Store,
    data: status.value.store,
    applyPath: ROUTE_PATHS.APPLY_STORE,
    workbenchPath: ROUTE_PATHS.STORE_WORKBENCH,
  },
]);

const visibleCards = computed(() => {
  const sup = status.value.supplier?.applied;
  const sto = status.value.store?.applied;
  if (sup && !sto) return cards.value.filter((c) => c.type === 'SUPPLIER');
  if (sto && !sup) return cards.value.filter((c) => c.type === 'STORE');
  return cards.value;
});

function canClaim(item?: MerchantApplicationStatus) {
  if (!item?.applied) return false;
  if (item.bindStatus === 1) return false;
  // 审核通过(1) 且未启用(0或2) 才可认领
  return item.reviewStatus === 1 && item.operationStatus !== 1;
}

function progressIndex(item?: MerchantApplicationStatus) {
  if (!item?.applied) return 0;
  if (item.bindStatus === 1) return 3;
  if (item.reviewStatus === 1) return 2;
  return 1;
}

function stepLabel(index: number, item?: MerchantApplicationStatus) {
  const labels = ['未申请', '已提交', '审核中', '完成'];
  if (index === 2 && canClaim(item)) return '待认领';
  return labels[index];
}

function stepTone(index: number, item?: MerchantApplicationStatus) {
  const current = progressIndex(item);
  if (index < current) return 'bg-emerald-500';
  if (index === current) {
    if (item?.bindStatus === 2) return 'bg-destructive';
    if (canClaim(item)) return 'bg-primary';
    if (item?.bindStatus === 0) return 'bg-amber-500';
    return 'bg-emerald-500';
  }
  return 'bg-muted';
}

async function loadStatus() {
  loading.value = true;
  try {
    status.value = await getUserApplicationStatusApi();
  } catch {
    // 接口失败不阻塞
  } finally {
    loading.value = false;
  }
}

// ===== 认领弹窗 =====
const claimDialog = reactive({
  open: false,
  loading: false,
  error: '',
  success: '',
  step: 'claim' as 'claim' | 'sms',
  type: 'SUPPLIER' as MerchantType,
  merchantId: '',
  phone: '',
  smsCode: '',
  countdown: 0,
  sending: false,
});

let smsTimer: ReturnType<typeof setInterval> | null = null;

function openClaimDialog(type: MerchantType, merchantId: string) {
  claimDialog.open = true;
  claimDialog.step = 'claim';
  claimDialog.error = '';
  claimDialog.success = '';
  claimDialog.type = type;
  claimDialog.merchantId = merchantId;
  claimDialog.phone = '';
  claimDialog.smsCode = '';
  claimDialog.countdown = 0;
  claimDialog.loading = false;
  // 自动发起首次认领（不带 smsCode）
  doClaim();
}

async function doClaim() {
  claimDialog.loading = true;
  claimDialog.error = '';
  try {
    const payload: any = {
      merchantType: claimDialog.type,
      merchantId: claimDialog.merchantId,
    };
    if (claimDialog.phone) payload.phone = claimDialog.phone;
    if (claimDialog.smsCode) payload.smsCode = claimDialog.smsCode;
    const res = await claimOnboardingApi(payload);
    claimDialog.success = res.message || '认领成功';
    claimDialog.loading = false;
    setTimeout(() => {
      claimDialog.open = false;
      loadStatus();
    }, 1500);
  } catch (err: any) {
    claimDialog.loading = false;
    const msg = err?.message || err?.msg || '认领失败';
    if (msg.includes('不一致') || msg.includes('手机号')) {
      claimDialog.step = 'sms';
      claimDialog.error = msg;
    } else {
      claimDialog.error = msg;
    }
  }
}

async function sendClaimSms() {
  if (claimDialog.countdown > 0 || claimDialog.sending) return;
  if (!claimDialog.phone) {
    claimDialog.error = '请输入手机号';
    return;
  }
  claimDialog.error = '';
  claimDialog.sending = true;
  try {
    await getCaptchaApi({ mobile: claimDialog.phone, smsmode: '3' });
    claimDialog.countdown = 60;
    smsTimer = setInterval(() => {
      claimDialog.countdown--;
      if (claimDialog.countdown <= 0 && smsTimer) {
        clearInterval(smsTimer);
        smsTimer = null;
      }
    }, 1000);
  } catch (err: any) {
    claimDialog.error = err?.message || '发送失败';
  } finally {
    claimDialog.sending = false;
  }
}

function closeClaimDialog() {
  claimDialog.open = false;
  if (smsTimer) { clearInterval(smsTimer); smsTimer = null; }
}

function actionText(item?: MerchantApplicationStatus) {
  if (!item?.applied) return '立即申请';
  if (item.bindStatus === 1) return '进入工作台';
  if (canClaim(item)) return '去认领';
  if (item.bindStatus === 0) return '审核中';
  return '重新申请';
}

function actionDisabled(item?: MerchantApplicationStatus) {
  if (canClaim(item)) return false;
  return item?.bindStatus === 0;
}

function goApply(path: string) {
  router.push(path);
}

function goWorkbench(path: string) {
  router.push(path);
}

function handleAction(item: MerchantApplicationStatus | undefined, path: string, workbenchPath: string, type: MerchantType) {
  if (!item?.applied) {
    router.push(path);
  } else if (item.bindStatus === 1) {
    router.push(workbenchPath);
  } else if (canClaim(item) && item?.merchantId) {
    openClaimDialog(type, item.merchantId);
  } else if (item.bindStatus === 2) {
    router.push(path);
  }
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

    <div class="grid gap-6 max-w-2xl">
      <Card v-for="card in visibleCards" :key="card.type" class="border-border/70">
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
            <Badge v-if="canClaim(card.data)" variant="success">待认领</Badge>
            <Badge v-else-if="card.data?.applied && card.data.bindStatus !== null" :variant="BIND_STATUS_VARIANT[card.data.bindStatus]">
              {{ BIND_STATUS_LABEL[card.data.bindStatus] }}
            </Badge>
            <Badge v-else variant="secondary">未申请</Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-4 gap-2">
            <div v-for="(label, index) in [0, 1, 2, 3]" :key="index" class="space-y-2">
              <div class="h-2 rounded-full" :class="stepTone(index, card.data)" />
              <div class="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 v-if="index < progressIndex(card.data)" class="h-3.5 w-3.5 text-emerald-500" />
                <Clock3 v-else-if="index === progressIndex(card.data) && card.data?.bindStatus === 0" class="h-3.5 w-3.5 text-amber-500" />
                <span>{{ stepLabel(index, card.data) }}</span>
              </div>
            </div>
          </div>

          <div v-if="card.data?.applied" class="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm md:grid-cols-2">
            <div>
              <span class="text-muted-foreground">绑定状态：</span>
              <Badge v-if="card.data.bindStatus !== null" :variant="BIND_STATUS_VARIANT[card.data.bindStatus]">{{ BIND_STATUS_LABEL[card.data.bindStatus] }}</Badge>
            </div>
            <div v-if="card.data.merchantId">
              <span class="text-muted-foreground">商户ID：</span>{{ card.data.merchantId }}
            </div>
            <div v-if="card.data.memberRole">
              <span class="text-muted-foreground">成员角色：</span>{{ card.data.memberRole === 'OWNER' ? '负责人' : '成员' }}
            </div>
          </div>

          <div class="flex justify-end">
            <Button
              :variant="card.data?.bindStatus === 1 ? 'outline' : 'default'"
              :disabled="actionDisabled(card.data)"
              @click="handleAction(card.data, card.applyPath, card.workbenchPath, card.type)"
            >
              {{ actionText(card.data) }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 认领弹窗 -->
    <Dialog :open="claimDialog.open" @update:open="closeClaimDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>认领入驻申请</DialogTitle>
          <DialogDescription>
            {{ claimDialog.type === 'SUPPLIER' ? '供应商' : '门店' }}入驻申请已审核通过，请认领账号
          </DialogDescription>
        </DialogHeader>

        <!-- 成功 -->
        <div v-if="claimDialog.success" class="text-center py-4">
          <CheckCircle2 class="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <p class="text-emerald-600 font-semibold">{{ claimDialog.success }}</p>
        </div>

        <!-- 首次认领中 -->
        <div v-else-if="claimDialog.step === 'claim' && claimDialog.loading" class="flex flex-col items-center py-6 gap-3">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
          <p class="text-sm text-muted-foreground">正在校验手机号...</p>
        </div>

        <!-- 首次认领失败 -->
        <div v-else-if="claimDialog.step === 'claim' && claimDialog.error" class="space-y-4">
          <p class="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{{ claimDialog.error }}</p>
          <Button variant="outline" class="w-full" @click="closeClaimDialog">知道了</Button>
        </div>

        <!-- 短信验证码认领 -->
        <div v-else-if="claimDialog.step === 'sms'" class="space-y-4">
          <p v-if="claimDialog.error" class="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{{ claimDialog.error }}</p>
          <div class="space-y-2">
            <Label>手机号</Label>
            <Input v-model="claimDialog.phone" placeholder="请输入入驻时填写的手机号" maxlength="11" />
          </div>
          <div class="space-y-2">
            <Label>短信验证码</Label>
            <div class="flex gap-3">
              <Input v-model="claimDialog.smsCode" placeholder="请输入验证码" class="flex-1" maxlength="6" />
              <Button
                type="button"
                variant="outline"
                class="shrink-0 w-32"
                :disabled="claimDialog.countdown > 0 || claimDialog.sending"
                @click="sendClaimSms"
              >
                {{ claimDialog.sending ? '发送中...' : claimDialog.countdown > 0 ? `${claimDialog.countdown}s` : '发送验证码' }}
              </Button>
            </div>
          </div>
          <Button class="w-full" :disabled="claimDialog.loading || !claimDialog.smsCode" @click="doClaim">
            {{ claimDialog.loading ? '认领中...' : '确认认领' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
