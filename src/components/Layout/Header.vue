<script setup lang="ts">
import { Menu, LogOut, Bell } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Avatar, AvatarFallback, Badge, Button, Separator } from '/@/components/ui';
import { useUserStore } from '/@/stores/modules/user';
import { useAppStore } from '/@/stores/modules/app';
import { ROLE_LABEL } from '/@/constants/userRoles';
import { ROUTE_PATHS } from '/@/constants/routePaths';

const userStore = useUserStore();
const appStore = useAppStore();
const router = useRouter();
const { user } = storeToRefs(userStore);

async function handleLogout() {
  await userStore.logout();
  router.push(ROUTE_PATHS.LOGIN);
}
</script>

<template>
  <header class="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center px-4 gap-3">
    <Button variant="ghost" size="icon" @click="appStore.toggleCollapsed()">
      <Menu class="w-5 h-5" />
    </Button>

    <div class="flex-1" />

    <Button variant="ghost" size="icon" class="relative">
      <Bell class="w-5 h-5" />
      <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
    </Button>

    <Separator orientation="vertical" class="h-6" />

    <div v-if="user" class="flex items-center gap-3 px-2">
      <div class="text-right hidden sm:block">
        <div class="text-sm font-medium text-foreground leading-tight">{{ user.realName }}</div>
        <div class="text-xs text-muted-foreground">
          <Badge variant="secondary" class="text-[10px] py-0 px-1.5 font-normal">{{ ROLE_LABEL[user.role] }}</Badge>
        </div>
      </div>
      <Avatar class="h-9 w-9">
        <AvatarFallback class="bg-primary text-primary-foreground text-xs font-semibold">
          {{ user.realName.slice(0, 2) }}
        </AvatarFallback>
      </Avatar>
    </div>

    <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive hover:bg-destructive/10" @click="handleLogout">
      <LogOut class="w-4 h-4 mr-1.5" />
      退出
    </Button>
  </header>
</template>
