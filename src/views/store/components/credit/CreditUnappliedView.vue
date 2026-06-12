<script setup lang="ts">
import { BadgeCheck, Banknote, Clock3, ShieldCheck } from 'lucide-vue-next';
import { Button } from '/@/components/ui';

defineProps<{
  applying: boolean;
}>();

const emit = defineEmits<{
  (e: 'next'): void;
}>();
</script>

<template>
  <section class="credit-unapplied-full">
    <div class="credit-unapplied-full__bg credit-unapplied-full__bg--right" />
    <div class="credit-unapplied-full__bg credit-unapplied-full__bg--top" />
    <div class="credit-unapplied-full__bg credit-unapplied-full__bg--bottom" />
    <div class="credit-unapplied-full__content">
      <div class="credit-unapplied-full__icon">
        <ShieldCheck class="h-10 w-10" />
      </div>
      <h2>专属授信额度，先采购后付款</h2>
      <p>
        平台联合合作银行为优质门店提供专属采购额度。开通后，您在平台采购商品时可直接使用授信额度支付，享受最长 45
        天免息账期，缓解资金周转压力。
      </p>

      <div class="credit-unapplied-full__features">
        <div class="credit-unapplied-full__feature">
          <div class="credit-unapplied-full__feature-icon credit-unapplied-full__feature-icon--blue">
            <Banknote class="h-6 w-6" />
          </div>
          <h3>最高 100 万额度</h3>
          <p>根据门店经营情况，智能审批专属额度</p>
        </div>
        <div class="credit-unapplied-full__feature">
          <div class="credit-unapplied-full__feature-icon credit-unapplied-full__feature-icon--green">
            <Clock3 class="h-6 w-6" />
          </div>
          <h3>最长 45 天免息</h3>
          <p>按月出账，次月 15 日还款，资金更灵活</p>
        </div>
        <div class="credit-unapplied-full__feature">
          <div class="credit-unapplied-full__feature-icon credit-unapplied-full__feature-icon--violet">
            <BadgeCheck class="h-6 w-6" />
          </div>
          <h3>极速在线审批</h3>
          <p>全线上操作，无需线下繁琐手续，快速生效</p>
        </div>
      </div>
      <Button class="credit-primary-btn credit-unapplied-full__btn" :disabled="applying" @click="emit('next')">
        立即申请开通
      </Button>
    </div>
  </section>
</template>

<style scoped>
.credit-unapplied-full {
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 120px);
  border: 1px solid #f1f5f9;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
}

.credit-unapplied-full__bg {
  position: absolute;
  pointer-events: none;
}

.credit-unapplied-full__bg--right {
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(270deg, rgb(239 244 252 / 0.8), transparent);
}

.credit-unapplied-full__bg--top {
  top: -80px;
  right: -80px;
  width: 320px;
  height: 320px;
  border-radius: 9999px;
  background: rgb(127 166 225 / 0.12);
  filter: blur(56px);
}

.credit-unapplied-full__bg--bottom {
  right: 80px;
  bottom: -96px;
  width: 320px;
  height: 320px;
  border-radius: 9999px;
  background: rgb(96 165 250 / 0.12);
  filter: blur(56px);
}

.credit-unapplied-full__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 72px 32px;
  text-align: center;
}

.credit-unapplied-full__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  margin-bottom: 32px;
  color: #214fb6;
  border: 1px solid rgb(226 235 249 / 0.8);
  border-radius: 9999px;
  background: linear-gradient(135deg, #eff4fc 0%, #fff 100%);
  box-shadow: inset 0 2px 10px rgb(33 79 182 / 0.08);
}

.credit-unapplied-full__content h2 {
  margin: 0 0 20px;
  color: #111827;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.credit-unapplied-full__content > p {
  max-width: 820px;
  margin: 0 0 48px;
  color: #6b7280;
  font-size: 18px;
  line-height: 1.8;
}

.credit-unapplied-full__features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  width: 100%;
  max-width: 960px;
  margin-bottom: 48px;
}

.credit-unapplied-full__feature {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.credit-unapplied-full__feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  border-radius: 18px;
  transition: transform 0.2s ease;
}

.credit-unapplied-full__feature:hover .credit-unapplied-full__feature-icon {
  transform: scale(1.08);
}

.credit-unapplied-full__feature-icon--blue {
  color: #2563eb;
  background: #dbeafe;
}

.credit-unapplied-full__feature-icon--green {
  color: #059669;
  background: #d1fae5;
}

.credit-unapplied-full__feature-icon--violet {
  color: #7c3aed;
  background: #ede9fe;
}

.credit-unapplied-full__feature h3 {
  margin: 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
}

.credit-unapplied-full__feature p {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
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

.credit-unapplied-full__btn {
  margin-top: 32px;
}

@media (max-width: 768px) {
  .credit-unapplied-full__features {
    grid-template-columns: 1fr;
  }

  .credit-unapplied-full__content {
    padding: 56px 24px;
  }

  .credit-unapplied-full__content h2 {
    font-size: 32px;
  }
}
</style>
