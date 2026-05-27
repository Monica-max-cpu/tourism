<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted } from 'vue';
import { ArrowRight, Eye, EyeOff, Shield, BarChart3, Store, Truck, CreditCard, Users, Building2, Store as StoreIcon } from 'lucide-vue-next';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '/@/components/ui';
import { useUserStore } from '/@/stores/modules/user';
import { usePermissionStore } from '/@/stores/modules/permission';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { UserRole } from '/#/user';

const router = useRouter();
const userStore = useUserStore();
const permissionStore = usePermissionStore();

const showPassword = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');

// update-begin--author:claude---date:2026-05-24---for:【修复】登录页移除角色下拉，按用户名自动派发角色
const form = reactive({
  username: '',
  password: '',
});
// update-end--author:claude---date:2026-05-24---for:【修复】登录页移除角色下拉，按用户名自动派发角色

const stats = [
  { label: '合作景区', value: '120+', icon: 'icon-building' },
  { label: '入驻门店', value: '2,800+', icon: 'icon-store' },
  { label: '供应商', value: '450+', icon: 'icon-qiyeruzhu' },
  { label: '月交易额', value: '¥8.5M', icon: 'icon-chart' },
];

// Features Section 数据
const features = [
  {
    icon: BarChart3,
    title: '数据看板',
    description: '实时监控集采数据和门店销售情况，提供多维度数据分析',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Store,
    title: '门店管理',
    description: '门店入驻审核、采购管理、授信额度申请等一站式服务',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Truck,
    title: '供应链管理',
    description: '供应商入驻、商品管理、订单跟踪，构建完整供应链生态',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: CreditCard,
    title: '授信服务',
    description: '类白条的授信额度管理，支持免息期和分期还款',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

// CTA / 入驻 Dialog 状态
const showApplyDialog = ref(false);
const featuresSection = ref<HTMLElement | null>(null);
const ctaSection = ref<HTMLElement | null>(null);
const isFeaturesVisible = ref(false);
const isCtaVisible = ref(false);

let featuresObs: IntersectionObserver | null = null;
let ctaObs: IntersectionObserver | null = null;

onMounted(() => {
  featuresObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      isFeaturesVisible.value = true;
      featuresObs?.disconnect();
    }
  }, { threshold: 0.1 });
  if (featuresSection.value) featuresObs.observe(featuresSection.value);

  ctaObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      isCtaVisible.value = true;
      ctaObs?.disconnect();
    }
  }, { threshold: 0.1 });
  if (ctaSection.value) ctaObs.observe(ctaSection.value);
});

onUnmounted(() => {
  featuresObs?.disconnect();
  ctaObs?.disconnect();
});

function navigateToApply(type: 'supplier' | 'store') {
  showApplyDialog.value = false;
  router.push(type === 'supplier' ? ROUTE_PATHS.APPLY_SUPPLIER : ROUTE_PATHS.APPLY_STORE);
}

const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: ROUTE_PATHS.ADMIN_WORKBENCH,
  SUPPLIER: ROUTE_PATHS.SUPPLIER_WORKBENCH,
  STORE: ROUTE_PATHS.STORE_WORKBENCH,
};

async function handleLogin(e: Event) {
  e.preventDefault();
  if (!form.username || !form.password) return;
  errorMsg.value = '';
  isLoading.value = true;
  try {
    // Mock 阶段：用户名 = 角色键（admin / supplier / store），后端按 username 解析角色
    const user = await userStore.login({ username: form.username.trim(), password: form.password });
    permissionStore.setMenusByRole(user.role);
    router.push(ROLE_HOME[user.role]);
  } catch (err) {
    errorMsg.value = (err as Error).message || '登录失败';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden flex flex-col bg-gradient-to-br from-transparent via-transparent to-accent/5">
    <!-- 装饰性古建背景 -->
    <div class="absolute inset-0 -z-10 opacity-[0.55] pointer-events-none"
      style="background-image: url('https://pic.rmb.bdstatic.com/bjh/events/35203320101a8fabbfdec81a01935cf2.jpeg@h_1280'); background-size: cover; background-position: center; filter: grayscale(40%) sepia(10%);">
    </div>
    <!-- 白色半透明遮罩 -->
    <div class="absolute inset-0 -z-10 bg-white/50 pointer-events-none" />

    <!-- Hero 区 -->
    <section class="flex-1 flex items-center px-4 py-16 lg:py-24">
      <div class="container mx-auto max-w-7xl">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- 左侧文案 -->
          <div class="space-y-8 animate-fade-in-up">
            <Badge variant="secondary" class="px-4 py-2 text-sm font-medium">
              <Shield class="w-4 h-4 mr-2" />
              B2B 集采产业数字化管理平台 V1.0
            </Badge>
            <h1 class="text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">智慧集采</span>
              <br />
              <span class="text-foreground">数字化管理平台</span>
            </h1>
            <p class="text-xl text-muted-foreground leading-relaxed max-w-lg">
              连接供应商与门店，平台集采经销，价格隔离、利润透明、流程闭环。
            </p>

            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="(s, idx) in stats"
                :key="s.label"
                class="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 animate-fade-in-up"
                :style="{ animationDelay: `${0.1 + idx * 0.08}s` }"
              >
                <div class="text-2xl mb-1"><i :class="['iconfont', s.icon]" /></div>
                <div class="text-2xl font-bold text-primary">{{ s.value }}</div>
                <div class="text-sm text-muted-foreground">{{ s.label }}</div>
              </div>
            </div>
          </div>

          <!-- 右侧登录卡 -->
          <div class="lg:pl-8 mt-12 lg:mt-20 animate-fade-in-up" style="animation-delay: 0.15s">
            <Card class="p-2 shadow-2xl border-0 bg-card/80 backdrop-blur-md">
              <CardHeader class="text-center pb-4 pt-6">
                <CardTitle class="text-2xl font-bold">系统登录</CardTitle>
                <CardDescription class="text-base">输入账号密码登录管理后台，系统将自动识别角色</CardDescription>
              </CardHeader>
              <CardContent class="px-6 pb-6">
                <form class="space-y-5" @submit="handleLogin">
                  <!-- update-begin--author:claude---date:2026-05-24---for:【修复】移除角色下拉，按用户名自动派发角色 -->
                  <div class="space-y-2">
                    <Label for="username">用户名</Label>
                    <Input id="username" v-model="form.username" placeholder="请输入用户名（演示：admin / supplier / store）" />
                  </div>

                  <div class="space-y-2">
                    <Label for="password">密码</Label>
                    <div class="relative">
                      <Input
                        id="password"
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="请输入密码（演示任意填）"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        @click="showPassword = !showPassword"
                      >
                        <EyeOff v-if="showPassword" class="h-4 w-4 text-muted-foreground" />
                        <Eye v-else class="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <p v-if="errorMsg" class="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{{ errorMsg }}</p>

                  <Button
                    type="submit"
                    class="w-full shadow-lg shadow-primary/20 transition-all"
                    size="lg"
                    :disabled="isLoading || !form.username || !form.password"
                  >
                    {{ isLoading ? '登录中...' : '登录系统' }}
                    <ArrowRight v-if="!isLoading" class="w-4 h-4 ml-2" />
                  </Button>

                  <p class="text-center text-sm text-muted-foreground">
                    演示账号：admin（管理员） / supplier（供应商） / store（门店），密码任意
                  </p>
                  <!-- update-end--author:claude---date:2026-05-24---for:【修复】移除角色下拉，按用户名自动派发角色 -->

                  <!-- update-begin--author:claude---date:2026-05-24---for:【B2B-阶段1】登录页底部入驻入口 -->
                  <div class="pt-4 border-t border-border/50 text-center text-sm text-muted-foreground">
                    还不是合作伙伴？
                    <RouterLink :to="ROUTE_PATHS.APPLY_SUPPLIER" class="ml-2 text-primary font-medium hover:underline">申请供应商入驻</RouterLink>
                    <span class="mx-2 text-border">·</span>
                    <RouterLink :to="ROUTE_PATHS.APPLY_STORE" class="text-primary font-medium hover:underline">申请门店入驻</RouterLink>
                  </div>
                  <!-- update-end--author:claude---date:2026-05-24---for:【B2B-阶段1】登录页底部入驻入口 -->
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section ref="featuresSection" class="py-24 bg-white">
      <div class="container mx-auto px-4 max-w-7xl">
        <div
          class="text-center mb-16 transition-all duration-700 ease-out"
          :class="isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'"
        >
          <h2 class="text-3xl lg:text-4xl font-bold mb-6">核心功能模块</h2>
          <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
            基于集采产业特色，打造数据驱动的智能化管理平台
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="(feat, idx) in features"
            :key="feat.title"
            class="group transition-all duration-700 ease-out"
            :class="isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'"
            :style="{ transitionDelay: `${idx * 0.1}s` }"
          >
            <Card class="h-full p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 group-hover:-translate-y-2">
              <CardHeader class="pb-4">
                <div
                  :class="[feat.bgColor, 'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110']"
                >
                  <component :is="feat.icon" :class="[feat.color, 'w-6 h-6']" />
                </div>
                <CardTitle class="text-xl font-bold">{{ feat.title }}</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground leading-relaxed">{{ feat.description }}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section ref="ctaSection" class="py-24 relative overflow-hidden bg-white">
      <div class="absolute inset-0 z-0 bg-gradient-to-r from-primary/90 to-accent/90" />

      <div class="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        <div
          class="space-y-8 transition-all duration-700 ease-out"
          :class="isCtaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'"
        >
          <h2 class="text-3xl lg:text-5xl font-bold text-white">
            开启数字化集采新时代
          </h2>
          <p class="text-xl text-white/90 leading-relaxed">
            加入我们的平台，享受一站式集采管理服务，
            让数据驱动业务增长，让科技赋能产业发展。
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              variant="secondary"
              class="px-8 py-4 text-lg font-semibold"
              @click="showApplyDialog = true"
            >
              <Users class="w-5 h-5 mr-2" />
              申请入驻
              <ArrowRight class="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              class="px-8 py-4 text-lg font-semibold !bg-transparent !border-white/30 !text-white hover:!bg-white/10"
              @click="featuresSection?.scrollIntoView({ behavior: 'smooth' })"
            >
              了解更多
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Apply Dialog -->
    <Dialog :open="showApplyDialog" @update:open="showApplyDialog = $event">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-center">选择入驻类型</DialogTitle>
          <DialogDescription class="text-center">
            请选择您要申请的合作身份，平台将在 1-3 个工作日内完成审核
          </DialogDescription>
        </DialogHeader>
        <div class="grid grid-cols-2 gap-4 pt-4">
          <Card
            class="p-6 border-border/40 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer text-center group"
            @click="navigateToApply('supplier')"
          >
            <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Building2 class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="font-bold text-lg mb-2">供应商入驻</h3>
            <p class="text-sm text-muted-foreground mb-4">成为平台供应商，向门店提供商品和服务</p>
            <Button variant="outline" size="sm" class="w-full">
              去申请
              <ArrowRight class="w-4 h-4 ml-1" />
            </Button>
          </Card>
          <Card
            class="p-6 border-border/40 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer text-center group"
            @click="navigateToApply('store')"
          >
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <StoreIcon class="w-6 h-6 text-emerald-600" />
            </div>
            <h3 class="font-bold text-lg mb-2">门店入驻</h3>
            <p class="text-sm text-muted-foreground mb-4">加入平台门店网络，享受集采价格和授信服务</p>
            <Button variant="outline" size="sm" class="w-full">
              去申请
              <ArrowRight class="w-4 h-4 ml-1" />
            </Button>
          </Card>
        </div>
      </DialogContent>
    </Dialog>

    <footer class="py-6 border-t border-border/50 bg-white">
      <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © 2026 B2B 集采管理平台 · 数字化集采产业管理
      </div>
    </footer>
  </div>
</template>