<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, Phone, Lock, User, CheckCircle2 } from 'lucide-vue-next';
import {
  Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Badge,
} from '/@/components/ui';
import { phoneVerifyApi, passwordChangeApi, getCaptchaApi } from '/@/api/login/api';
import { ROUTE_PATHS } from '/@/constants/routePaths';

const router = useRouter();

const currentStep = ref(1);

// Step 1: 手机验证
const step1 = reactive({
  phone: '',
  smsCode: '',
});

// Step 2: 设置新密码
const step2 = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

const submitting = ref(false);
const errorMsg = ref('');

// 短信倒计时
const smsCountdown = ref(0);
const smsSending = ref(false);
let smsTimer: ReturnType<typeof setInterval> | null = null;

function startSmsCountdown() {
  smsCountdown.value = 60;
  smsTimer = setInterval(() => {
    smsCountdown.value--;
    if (smsCountdown.value <= 0) {
      if (smsTimer) clearInterval(smsTimer);
      smsTimer = null;
    }
  }, 1000);
}

async function handleSendSms() {
  if (smsCountdown.value > 0 || smsSending.value) return;
  if (!step1.phone) {
    errorMsg.value = '请先输入手机号';
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(step1.phone)) {
    errorMsg.value = '请输入正确的手机号';
    return;
  }
  errorMsg.value = '';
  smsSending.value = true;
  try {
    await getCaptchaApi({ mobile: step1.phone, smsmode: '2' });
    startSmsCountdown();
  } catch (err) {
    errorMsg.value = (err as Error).message || '发送失败';
  } finally {
    smsSending.value = false;
  }
}

// Step 1 → Step 2
async function handleStep1(e: Event) {
  e.preventDefault();
  errorMsg.value = '';
  if (!step1.phone) { errorMsg.value = '请输入手机号'; return; }
  if (!/^1[3-9]\d{9}$/.test(step1.phone)) { errorMsg.value = '请输入正确的手机号'; return; }
  if (!step1.smsCode) { errorMsg.value = '请输入短信验证码'; return; }
  submitting.value = true;
  try {
    const res = await phoneVerifyApi({ phone: step1.phone, smscode: step1.smsCode });
    if (res.success) {
      currentStep.value = 2;
    } else {
      errorMsg.value = res.message || '验证失败';
    }
  } catch (err) {
    errorMsg.value = (err as Error).message || '验证失败';
  } finally {
    submitting.value = false;
  }
}

// Step 2: 设置新密码
async function handleStep2(e: Event) {
  e.preventDefault();
  errorMsg.value = '';
  if (!step2.username) { errorMsg.value = '请输入用户名'; return; }
  if (!step2.password) { errorMsg.value = '请输入新密码'; return; }
  if (step2.password.length < 6) { errorMsg.value = '密码至少6位'; return; }
  if (step2.password !== step2.confirmPassword) { errorMsg.value = '两次输入的密码不一致'; return; }
  submitting.value = true;
  try {
    const res = await passwordChangeApi({
      username: step2.username.trim(),
      password: step2.password,
      phone: step1.phone,
      smscode: step1.smsCode,
    });
    if (res.success) {
      currentStep.value = 3;
    } else {
      errorMsg.value = res.message || '修改失败';
    }
  } catch (err) {
    errorMsg.value = (err as Error).message || '修改失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen relative flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
    <div
      class="absolute inset-0 -z-10 opacity-[0.35] pointer-events-none"
      style="background-image: url('https://pic.rmb.bdstatic.com/bjh/events/35203320101a8fabbfdec81a01935cf2.jpeg@h_1280'); background-size: cover; background-position: center; filter: grayscale(40%) sepia(10%);"
    />
    <div class="absolute inset-0 -z-10 bg-white/50 pointer-events-none" />

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

    <main class="flex-1 flex items-center justify-center px-4 py-12">
      <!-- Step 1 & 2: 表单卡片 -->
      <Card v-if="currentStep !== 3" class="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-md animate-fade-in-up">
        <CardHeader class="text-center pb-4 pt-8">
          <CardTitle class="text-2xl font-bold">忘记密码</CardTitle>
          <CardDescription class="text-base">
            {{ currentStep === 1 ? '验证手机号以重置密码' : '设置新密码' }}
          </CardDescription>
        </CardHeader>

        <!-- 步骤指示器 -->
        <div class="px-8 pb-2">
          <div class="flex items-center justify-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
              :class="currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
            >1</div>
            <div class="w-10 h-px" :class="currentStep >= 2 ? 'bg-primary' : 'bg-muted'" />
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
              :class="currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
            >2</div>
            <div class="w-10 h-px" :class="currentStep >= 3 ? 'bg-primary' : 'bg-muted'" />
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
              :class="currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
            >3</div>
          </div>
          <div class="flex justify-center gap-2 text-xs text-muted-foreground mt-2">
            <span class="w-8 text-center">验证</span>
            <span class="w-10" />
            <span class="w-8 text-center">改密</span>
            <span class="w-10" />
            <span class="w-8 text-center">完成</span>
          </div>
        </div>

        <!-- Step 1: 手机验证 -->
        <CardContent v-if="currentStep === 1" class="px-8 pb-8">
          <form class="space-y-4" @submit="handleStep1">
            <div class="space-y-2">
              <Label for="fp-phone">手机号 <Badge variant="secondary">必填</Badge></Label>
              <div class="relative">
                <Phone class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="fp-phone" v-model="step1.phone" placeholder="请输入注册时的手机号" class="pl-10" maxlength="11" />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="fp-sms">短信验证码 <Badge variant="secondary">必填</Badge></Label>
              <div class="flex gap-3">
                <Input id="fp-sms" v-model="step1.smsCode" placeholder="请输入验证码" class="flex-1" maxlength="6" />
                <Button
                  type="button"
                  variant="outline"
                  class="shrink-0 w-32"
                  :disabled="smsCountdown > 0 || smsSending"
                  @click="handleSendSms"
                >
                  {{ smsSending ? '发送中...' : smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码' }}
                </Button>
              </div>
              <p class="text-xs text-muted-foreground">演示环境验证码固定为 123456</p>
            </div>

            <p v-if="errorMsg" class="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{{ errorMsg }}</p>

            <Button type="submit" class="w-full shadow-lg shadow-primary/20" size="lg" :disabled="submitting">
              {{ submitting ? '验证中...' : '下一步' }}
            </Button>
          </form>
        </CardContent>

        <!-- Step 2: 设置新密码 -->
        <CardContent v-if="currentStep === 2" class="px-8 pb-8">
          <form class="space-y-4" @submit="handleStep2">
            <div class="space-y-2">
              <Label for="fp-username">用户名 <Badge variant="secondary">必填</Badge></Label>
              <div class="relative">
                <User class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="fp-username" v-model="step2.username" placeholder="请输入您的用户名" class="pl-10" />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="fp-pwd">新密码 <Badge variant="secondary">必填</Badge></Label>
              <div class="relative">
                <Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="fp-pwd" v-model="step2.password" type="password" placeholder="请输入新密码（至少6位）" class="pl-10" />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="fp-pwd2">确认密码 <Badge variant="secondary">必填</Badge></Label>
              <div class="relative">
                <Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="fp-pwd2" v-model="step2.confirmPassword" type="password" placeholder="请再次输入新密码" class="pl-10" />
              </div>
            </div>

            <p v-if="errorMsg" class="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{{ errorMsg }}</p>

            <div class="flex gap-3">
              <Button type="button" variant="outline" class="flex-1" @click="currentStep = 1">上一步</Button>
              <Button type="submit" class="flex-1 shadow-lg shadow-primary/20" size="lg" :disabled="submitting">
                {{ submitting ? '提交中...' : '确认修改' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Step 3: 成功页 -->
      <Card v-else class="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-md animate-fade-in-up">
        <CardContent class="p-12 text-center space-y-6">
          <div class="inline-flex w-16 h-16 rounded-full bg-emerald-100 items-center justify-center">
            <CheckCircle2 class="w-10 h-10 text-emerald-600" />
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl font-bold tracking-tight">密码修改成功</h2>
            <p class="text-muted-foreground">请使用新密码重新登录系统</p>
          </div>
          <Button class="shadow-lg shadow-primary/20" @click="router.push(ROUTE_PATHS.LOGIN)">
            返回登录
          </Button>
        </CardContent>
      </Card>
    </main>

    <footer class="py-6 border-t border-border/50 bg-white">
      <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
        &copy; 2026 B2B 集采管理平台 &middot; 数字化集采产业管理
      </div>
    </footer>
  </div>
</template>
