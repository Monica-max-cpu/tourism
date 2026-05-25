<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '/@/components/ui';
import { useUserStore } from '/@/stores/modules/user';
import { ROUTE_PATHS } from '/@/constants/routePaths';

const router = useRouter();
const userStore = useUserStore();

const ROLE_HOME: Record<string, string> = {
  ADMIN: ROUTE_PATHS.ADMIN_WORKBENCH,
  SUPPLIER: ROUTE_PATHS.SUPPLIER_WORKBENCH,
  STORE: ROUTE_PATHS.STORE_WORKBENCH,
};

function goHome() {
  const role = userStore.getRole;
  if (role && ROLE_HOME[role]) router.push(ROLE_HOME[role]);
  else router.push(ROUTE_PATHS.LOGIN);
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center space-y-6 px-4">
      <div class="text-9xl font-bold text-destructive/30 select-none">403</div>
      <h1 class="text-2xl font-bold tracking-tight">无权访问</h1>
      <p class="text-muted-foreground">您没有访问此页面的权限</p>
      <Button @click="goHome">返回工作台</Button>
    </div>
  </div>
</template>
