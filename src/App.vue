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
      <div class="route-loading-card" role="status" aria-live="polite">
        <div class="route-loading-mark" aria-hidden="true">
          <span class="route-loading-halo" />
          <svg class="route-loading-orbit route-loading-orbit--dashed" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" />
          </svg>
          <svg class="route-loading-orbit route-loading-orbit--dots" viewBox="0 0 100 100">
            <circle cx="50" cy="10" r="2" />
            <circle cx="90" cy="50" r="1.5" />
            <circle cx="10" cy="50" r="1" />
          </svg>
          <svg class="route-loading-orbit route-loading-orbit--main" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="route-loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#214fb6" />
                <stop offset="100%" stop-color="#a8c5ec" stop-opacity="0" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" stroke="url(#route-loading-gradient)" />
          </svg>
          <svg class="route-loading-orbit route-loading-orbit--inner" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" />
          </svg>
          <div class="route-loading-core">
            <span class="route-loading-core__ping" />
            <span class="route-loading-core__dot" />
          </div>
        </div>
        <div class="route-loading-copy">
          <p class="route-loading-title">正在加载工作台</p>
          <p class="route-loading-desc">
            <span>权限与菜单正在准备中</span>
            <span class="route-loading-dots" aria-hidden="true">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
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
    radial-gradient(circle at 50% 26%, rgb(33 79 182 / 0.1), transparent 32%),
    radial-gradient(circle at 50% 74%, rgb(127 166 225 / 0.1), transparent 28%),
    linear-gradient(180deg, rgb(248 250 252 / 0.88), rgb(248 250 252 / 0.94));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.route-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  min-width: min(92vw, 320px);
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.route-loading-mark {
  position: relative;
  width: 128px;
  height: 128px;
  display: grid;
  place-items: center;
  flex: none;
}

.route-loading-halo {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: rgb(33 79 182 / 0.2);
  filter: blur(24px);
  animation: route-pulse 1.8s ease-in-out infinite;
}

.route-loading-orbit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.route-loading-orbit circle {
  fill: none;
  stroke-linecap: round;
}

.route-loading-orbit--dashed {
  color: rgb(203 220 244 / 0.8);
  animation: route-spin 8s linear infinite;
}

.route-loading-orbit--dashed circle {
  stroke: currentColor;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.route-loading-orbit--dots {
  color: #7fa6e1;
  animation: route-spin-reverse 4s linear infinite;
}

.route-loading-orbit--dots circle {
  fill: currentColor;
}

.route-loading-orbit--dots circle:nth-child(2) {
  opacity: 0.5;
}

.route-loading-orbit--dots circle:nth-child(3) {
  opacity: 0.3;
}

.route-loading-orbit--main {
  inset: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  filter: drop-shadow(0 0 8px rgb(33 79 182 / 0.5));
  animation: route-spin-soft 2s ease-in-out infinite;
}

.route-loading-orbit--main circle {
  stroke-width: 4;
  stroke-dasharray: 180 250;
}

.route-loading-orbit--inner {
  inset: 24px;
  width: calc(100% - 48px);
  height: calc(100% - 48px);
  color: rgb(94 135 214 / 0.4);
  animation: route-spin 1s linear infinite;
}

.route-loading-orbit--inner circle {
  stroke: currentColor;
  stroke-width: 2;
  stroke-dasharray: 40 150;
}

.route-loading-core {
  position: absolute;
  inset: 35px;
  display: grid;
  place-items: center;
  border: 1px solid rgb(226 235 249 / 0.8);
  border-radius: 9999px;
  background: linear-gradient(135deg, #eff4fc 0%, #fff 100%);
  box-shadow: inset 0 2px 10px rgb(33 79 182 / 0.1);
}

.route-loading-core__ping {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: #214fb6;
  opacity: 0.75;
  animation: route-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.route-loading-core__dot {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #5e87d6;
}

.route-loading-copy {
  text-align: center;
}

.route-loading-title {
  margin: 0;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.route-loading-desc {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 10px 0 0;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes route-spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes route-spin-soft {
  0%,
  100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}

@keyframes route-pulse {
  0%,
  100% { transform: scale(1); opacity: 0.68; }
  50% { transform: scale(1.04); opacity: 1; }
}

@keyframes route-ping {
  75%,
  100% { transform: scale(2); opacity: 0; }
}

.route-loading-dots span {
  display: inline-block;
  color: #7fa6e1;
}

.route-loading-dots span:nth-child(1) {
  animation: route-dot 1.4s infinite;
}

.route-loading-dots span:nth-child(2) {
  animation: route-dot 1.4s infinite 0.2s;
}

.route-loading-dots span:nth-child(3) {
  animation: route-dot 1.4s infinite 0.4s;
}

@keyframes route-dot {
  0%,
  80%,
  100% { transform: translateY(0); opacity: 0.55; }
  40% { transform: translateY(-2px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .route-loading-halo,
  .route-loading-orbit,
  .route-loading-core__ping,
  .route-loading-dots span {
    animation: none !important;
  }
}
</style>
