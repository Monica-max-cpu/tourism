<script setup lang="ts">
import { Clock3 } from 'lucide-vue-next';
import { Button } from '/@/components/ui';

defineProps<{
  syncing: boolean;
  applyNo: string;
}>();

const emit = defineEmits<{
  (e: 'sync'): void;
}>();
</script>

<template>
  <section class="credit-pending-full">
    <div class="credit-pending-full__icon">
      <Clock3 class="h-12 w-12" />
    </div>
    <h3>授信额度申请审核中</h3>
    <p>
      您的授信申请已成功提交至合作银行，预计需要 <strong>1-3 个工作日</strong> 完成风控审核。审核结果将通过短信通知您，请耐心等待。
    </p>
    <div class="credit-pending-full__meta">申请单号：{{ applyNo || '-' }}</div>
    <Button class="credit-primary-btn" :disabled="syncing" @click="emit('sync')">
      {{ syncing ? '同步中...' : '同步审批状态' }}
    </Button>
  </section>
</template>

<style scoped>
.credit-pending-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 180px);
  padding: 96px 24px;
  text-align: center;
  border: 1px solid #f1f5f9;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
}

.credit-pending-full__icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112px;
  height: 112px;
  margin-bottom: 40px;
  color: #3b82f6;
  border: 1px solid rgb(191 219 254 / 0.8);
  border-radius: 9999px;
  background: linear-gradient(135deg, #eff6ff 0%, #fff 100%);
  box-shadow: inset 0 2px 10px rgb(59 130 246 / 0.08);
}

.credit-pending-full__icon::after {
  content: '';
  position: absolute;
  inset: -1px;
  border: 1.5px solid rgb(191 219 254 / 0.6);
  border-radius: inherit;
  border-top-color: #60a5fa;
  border-right-color: #93c5fd;
  animation: credit-spin 3s linear infinite;
}

.credit-pending-full h3 {
  margin: 0;
  color: #111827;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.credit-pending-full p {
  max-width: 560px;
  margin: 16px 0 0;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.8;
}

.credit-pending-full__meta {
  margin: 16px 0 40px;
  color: #4b5563;
  font-size: 14px;
}

.credit-primary-btn {
  min-width: 220px;
  height: 52px;
  padding: 0 32px;
  color: #fff;
  font-weight: 600;
  border-radius: 9999px;
  background: #214fb6;
  box-shadow: 0 14px 30px rgb(94 135 214 / 0.22);
}

.credit-primary-btn:hover:not(:disabled) {
  background: #214fb6;
}

@keyframes credit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .credit-pending-full h3 {
    font-size: 24px;
  }
}
</style>
