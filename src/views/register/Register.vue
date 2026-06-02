<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, Shield, XCircle } from 'lucide-vue-next';
import {
  Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Badge,
} from '/@/components/ui';
import { registerApi, checkOnlyUserApi, getCaptchaApi } from '/@/api/login/api';
import { ROUTE_PATHS } from '/@/constants/routePaths';

const router = useRouter();

const form = reactive({
  realname: '',
  phone: '',
  smsCode: '',
  password: '',
  confirmPassword: '',
});

const submitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const phoneChecking = ref(false);
const phoneAvailable = ref(true);

// 短信验证码倒计时
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

async function handlePhoneBlur() {
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) return;
  phoneChecking.value = true;
  phoneAvailable.value = true;
  errorMsg.value = '';
  try {
    const res = await checkOnlyUserApi({ phone: form.phone });
    if (!res.success) {
      phoneAvailable.value = false;
      errorMsg.value = res.message || '手机号已被注册';
    }
  } catch (err) {
    // 接口异常不阻塞
  } finally {
    phoneChecking.value = false;
  }
}

async function handleSendSms() {
  if (smsCountdown.value > 0 || smsSending.value) return;
  if (!form.phone) {
    errorMsg.value = '请先输入手机号';
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    errorMsg.value = '请输入正确的手机号';
    return;
  }
  if (!phoneAvailable.value) {
    errorMsg.value = '手机号已被注册';
    return;
  }
  errorMsg.value = '';
  smsSending.value = true;
  try {
    await getCaptchaApi({ mobile: form.phone, smsmode: '1' });
    startSmsCountdown();
  } catch (err) {
    errorMsg.value = (err as Error).message || '发送失败';
  } finally {
    smsSending.value = false;
  }
}

function validate(): boolean {
  if (form.realname && form.realname.length < 2) { errorMsg.value = '昵称至少2个字符'; return false; }
  if (!form.phone) { errorMsg.value = '请输入手机号'; return false; }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) { errorMsg.value = '请输入正确的手机号'; return false; }
  if (!phoneAvailable.value) { errorMsg.value = '手机号已被注册'; return false; }
  if (!form.smsCode) { errorMsg.value = '请输入短信验证码'; return false; }
  if (!form.password) { errorMsg.value = '请输入密码'; return false; }
  if (form.password.length < 6) { errorMsg.value = '密码至少6位'; return false; }
  if (form.password !== form.confirmPassword) { errorMsg.value = '两次输入的密码不一致'; return false; }
  return true;
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  errorMsg.value = '';
  if (!validate()) return;
  submitting.value = true;
  try {
    const payload: Record<string, string> = {
      username: form.phone,
      password: form.password,
      phone: form.phone,
      smscode: form.smsCode,
    };
    if (form.realname.trim()) {
      payload.realname = form.realname.trim();
    }
    const res = await registerApi(payload as any);
    if (res.success) {
      successMsg.value = '注册成功！即将跳转到登录页...';
      setTimeout(() => {
        router.push(ROUTE_PATHS.LOGIN);
      }, 1500);
    } else {
      errorMsg.value = res.message || '注册失败';
    }
  } catch (err) {
    errorMsg.value = (err as Error).message || '注册失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen relative flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
    <!-- 装饰背景 -->
    <div
      class="absolute inset-0 -z-10 opacity-[0.35] pointer-events-none"
      style="background-image: url('https://pic.rmb.bdstatic.com/bjh/events/35203320101a8fabbfdec81a01935cf2.jpeg@h_1280'); background-size: cover; background-position: center; filter: grayscale(40%) sepia(10%);"
    />
    <div class="absolute inset-0 -z-10 bg-white/50 pointer-events-none" />

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

    <!-- 主内容 -->
    <main class="flex-1 flex items-center justify-center px-4 py-12">
      <Card class="w-full max-w-3xl shadow-2xl border-0 bg-card/80 backdrop-blur-md animate-fade-in-up">
        <CardHeader class="text-center pb-8 pt-14">
          <div class="mx-auto mb-6 w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
            <Shield class="w-12 h-12 text-primary" />
          </div>
          <CardTitle class="text-4xl font-bold">注册账号</CardTitle>
          <CardDescription class="text-lg">注册后即可申请供应商或门店入驻</CardDescription>
          <p class="mt-3 text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-2 text-center">
            请使用入驻时填写的联系电话注册，否则无法自动认领
          </p>
        </CardHeader>
        <CardContent class="px-14 pb-14">
          <form class="space-y-4" @submit="handleSubmit">
            <!-- 昵称 -->
            <div class="space-y-2">
              <Label for="reg-realname">昵称 <Badge variant="outline">选填</Badge></Label>
              <Input id="reg-realname" v-model="form.realname" placeholder="给自己起个名字，方便识别" />
            </div>

            <!-- 手机号 -->
            <div class="space-y-2">
              <Label for="reg-phone">手机号 <Badge variant="secondary">必填</Badge></Label>
              <Input id="reg-phone" v-model="form.phone" placeholder="请输入手机号" maxlength="11" @blur="handlePhoneBlur" />
              <p v-if="phoneChecking" class="text-xs text-muted-foreground">检查中...</p>
              <p v-else-if="form.phone && /^1[3-9]\d{9}$/.test(form.phone) && phoneAvailable" class="text-xs text-emerald-600">手机号可用</p>
            </div>

            <!-- 短信验证码 -->
            <div class="space-y-2">
              <Label for="reg-sms">短信验证码 <Badge variant="secondary">必填</Badge></Label>
              <div class="flex gap-3">
                <Input id="reg-sms" v-model="form.smsCode" placeholder="请输入验证码" class="flex-1" maxlength="6" />
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

            <!-- 密码 -->
            <div class="space-y-2">
              <Label for="reg-pwd">密码 <Badge variant="secondary">必填</Badge></Label>
              <Input id="reg-pwd" v-model="form.password" type="password" placeholder="请输入密码（至少6位）" />
            </div>

            <!-- 确认密码 -->
            <div class="space-y-2">
              <Label for="reg-pwd2">确认密码 <Badge variant="secondary">必填</Badge></Label>
              <Input id="reg-pwd2" v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" />
            </div>

            <!-- 错误提示 -->
            <div v-if="errorMsg" class="flex items-start gap-3 border-2 border-destructive bg-destructive/10 rounded-lg px-4 py-3">
              <XCircle class="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-destructive">注册失败</p>
                <p class="text-sm text-destructive/80 mt-0.5">{{ errorMsg }}</p>
              </div>
            </div>
            <!-- 成功提示 -->
            <p v-if="successMsg" class="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-4 py-2">{{ successMsg }}</p>

            <!-- 提交 -->
            <Button
              type="submit"
              class="w-full shadow-lg shadow-primary/20"
              size="lg"
              :disabled="submitting || !!successMsg"
            >
              {{ submitting ? '注册中...' : successMsg ? '注册成功' : '注册' }}
            </Button>

            <p class="text-center text-sm text-muted-foreground pt-2">
              已有账号？
              <RouterLink :to="ROUTE_PATHS.LOGIN" class="text-primary font-medium hover:underline">返回登录</RouterLink>
            </p>
          </form>
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
