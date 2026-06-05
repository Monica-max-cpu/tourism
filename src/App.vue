<script setup lang="ts">
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAppStore } from '/@/stores/modules/app';

const appStore = useAppStore();
const { getRouteLoading } = storeToRefs(appStore);
</script>

<template>
  <RouterView />
  <Transition name="fade">
    <div v-if="getRouteLoading" class="route-loading-overlay">
      <div class="route-loading-card">
        <div class="route-loading-mark" aria-hidden="true">
          <span class="route-loading-halo" />
          <span class="route-loading-ring" />
          <span class="route-loading-ring route-loading-ring--inner" />
          <span class="route-loading-emblem">晋</span>
        </div>
        <div class="route-loading-copy">
          <p class="route-loading-title">正在加载工作台</p>
          <p class="route-loading-desc">权限与菜单正在准备中，请稍候...</p>
        </div>
        <div class="route-loading-accent" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.route-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.12), transparent 34%),
    radial-gradient(circle at 50% 72%, hsl(var(--accent) / 0.12), transparent 30%),
    linear-gradient(180deg, hsl(var(--background) / 0.84), hsl(var(--background) / 0.9));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.route-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-width: min(92vw, 360px);
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.route-loading-mark {
  position: relative;
  width: 116px;
  height: 116px;
  display: grid;
  place-items: center;
  flex: none;
}

.route-loading-halo {
  position: absolute;
  inset: -22px;
  border-radius: 9999px;
  background:
    radial-gradient(circle, hsl(var(--accent) / 0.14) 0%, transparent 58%),
    radial-gradient(circle, hsl(var(--primary) / 0.12) 20%, transparent 68%);
  filter: blur(8px);
  animation: route-breathe 2.8s ease-in-out infinite;
}

.route-loading-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid transparent;
  background:
    linear-gradient(hsl(var(--background)), hsl(var(--background))) padding-box,
    conic-gradient(
      from 220deg,
      transparent 0deg,
      transparent 250deg,
      hsl(var(--primary) / 0.96) 272deg,
      hsl(var(--accent) / 0.95) 304deg,
      hsl(var(--primary) / 0.96) 332deg,
      transparent 360deg
    ) border-box;
  animation: route-spin 1.5s linear infinite;
  -webkit-mask:
    linear-gradient(#000 0 0) padding-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.route-loading-ring--inner {
  inset: 28px;
  background:
    linear-gradient(hsl(var(--background)), hsl(var(--background))) padding-box,
    conic-gradient(
      from 40deg,
      transparent 0deg,
      transparent 210deg,
      hsl(var(--accent) / 0.62) 244deg,
      hsl(var(--primary) / 0.78) 288deg,
      transparent 330deg,
      transparent 360deg
    ) border-box;
  animation-duration: 2.3s;
  animation-direction: reverse;
  opacity: 0.88;
}

.route-loading-ring::after {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: inherit;
  border: 1px solid hsl(var(--primary) / 0.12);
}

.route-loading-emblem {
  position: relative;
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: transparent;
  border: 0;
  box-shadow: none;
  display: grid;
  place-items: center;
  color: hsl(var(--primary));
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-shadow:
    0 1px 0 hsl(var(--card) / 0.88),
    0 3px 8px hsl(var(--primary) / 0.06);
  animation: route-emblem 3s ease-in-out infinite;
}

.route-loading-copy {
  text-align: center;
}

.route-loading-title {
  margin: 0;
  color: hsl(var(--foreground));
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.route-loading-desc {
  margin: 6px 0 0;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  line-height: 1.5;
}

.route-loading-accent {
  width: 100%;
  height: 4px;
  overflow: hidden;
  border-radius: 9999px;
  background: linear-gradient(90deg, hsl(var(--muted) / 0.72), hsl(var(--muted) / 0.38), hsl(var(--muted) / 0.72));
}

.route-loading-accent > span {
  display: block;
  width: 34%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
  box-shadow: 0 0 18px hsl(var(--accent) / 0.18);
  animation: route-accent 1.8s ease-in-out infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes route-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes route-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.78;
  }
  50% {
    transform: scale(1.03);
    opacity: 1;
  }
}

@keyframes route-emblem {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-1px) scale(1.03);
  }
}

@keyframes route-accent {
  0% {
    transform: translateX(-120%);
  }
  50% {
    transform: translateX(125%);
  }
  100% {
    transform: translateX(260%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-loading-halo,
  .route-loading-ring,
  .route-loading-ring--inner,
  .route-loading-emblem,
  .route-loading-accent > span {
    animation: none !important;
  }
}
</style>
