<script setup lang="ts">
import { FileText } from 'lucide-vue-next';
import { Badge } from '/@/components/ui';
import { formatCurrency, formatDate } from '/@/utils/format';
import type { CreditBillRecord, CreditBillStatus } from '/#/b2b-store';

defineProps<{
  bills: CreditBillRecord[];
  billLoading: boolean;
  billStatusLabel: (status: CreditBillStatus) => string;
  billStatusVariant: (status: CreditBillStatus) => 'warning' | 'info' | 'success' | 'destructive' | 'muted';
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'select-bill', row: CreditBillRecord): void;
}>();
</script>

<template>
  <div id="bill-all_bills" class="credit-bill-view-card">
    <div class="credit-bill-view-card__header">
      <button class="credit-back-btn" type="button" @click="emit('back')">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <h2>全部账单</h2>
    </div>

    <div v-if="billLoading" class="credit-empty-card">账单加载中...</div>
    <div v-else-if="!bills.length" class="credit-empty-card">暂无账单数据</div>
    <div v-else class="credit-bill-list">
      <button
        v-for="row in bills"
        :key="row.id"
        type="button"
        class="credit-bill-item"
        @click="emit('select-bill', row)"
      >
        <div class="credit-bill-item__left">
          <div class="credit-bill-item__icon">
            <FileText class="h-6 w-6" />
          </div>
          <div>
            <h4>{{ row.billCycle }} 账单</h4>
            <p>最后还款日：{{ formatDate(row.dueDate) || '-' }}</p>
          </div>
        </div>
        <div class="credit-bill-item__right">
          <div class="credit-bill-item__amount">{{ formatCurrency(row.unpaidAmount || row.billAmount || 0) }}</div>
          <div class="credit-bill-item__status">
            <Badge :variant="billStatusVariant(row.billStatus)">
              {{ row.billStatusLabel || billStatusLabel(row.billStatus) }}
            </Badge>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.credit-bill-view-card {
  position: relative;
  overflow: hidden;
  padding: 32px;
  border: 1px solid #f1f5f9;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
}

.credit-bill-view-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.credit-bill-view-card__header h2 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.credit-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  background: #fff;
}

.credit-empty-card {
  padding: 32px 24px;
  color: #9ca3af;
  text-align: center;
}

.credit-bill-list {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.credit-bill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  padding: 24px;
  text-align: left;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  background: #fff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.credit-bill-item:hover {
  border-color: rgb(199 210 254 / 0.9);
  box-shadow: 0 12px 24px rgb(99 102 241 / 0.08);
  transform: translateY(-1px);
}

.credit-bill-item__left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.credit-bill-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  color: #6b7280;
  border-radius: 18px;
  background: #f9fafb;
}

.credit-bill-item h4 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.credit-bill-item p {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.credit-bill-item__right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.credit-bill-item__amount {
  color: #111827;
  font-size: 24px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .credit-bill-view-card,
  .credit-bill-item {
    padding: 24px;
  }

  .credit-bill-item,
  .credit-bill-item__right {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
