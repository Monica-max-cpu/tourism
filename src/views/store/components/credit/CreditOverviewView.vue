<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '/@/components/ui';
import { formatCurrency, formatDate, formatDateTime } from '/@/utils/format';
import type { CreditBillDetailItem, CreditBillRecord, CreditBillStatus } from '/#/b2b-store';

const props = defineProps<{
  currentBill: CreditBillRecord | null;
  selectedBill: CreditBillRecord | null;
  billLoading: boolean;
  billDetailLoading: boolean;
  billDetailItems: CreditBillDetailItem[];
  totalCreditAmount: number;
  availableCreditAmount: number;
  availablePercent: number;
  canRepaySelectedBill: boolean;
  billStatusLabel: (status: CreditBillStatus) => string;
  billStatusVariant: (status: CreditBillStatus) => 'warning' | 'info' | 'success' | 'destructive' | 'muted';
}>();

const emit = defineEmits<{
  (e: 'repay-current'): void;
  (e: 'show-all'): void;
  (e: 'show-detail'): void;
}>();

const ringColors = computed(() => {
  if (ringPercent.value <= 20) {
    return { start: '#F87171', end: '#DC2626' };
  }
  if (ringPercent.value <= 50) {
    return { start: '#FDBA74', end: '#EA580C' };
  }
  return { start: '#6366F1', end: '#4F46E5' };
});

const ringPercent = computed(() => {
  const value = Number(props.availablePercent);
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
});

const ringStyle = computed(() => ({
  '--credit-ring-percent': `${ringPercent.value}%`,
  '--credit-ring-start': ringColors.value.start,
  '--credit-ring-end': ringColors.value.end,
}));
</script>

<template>
  <div id="bill-overview">
    <div class="credit-overview-panel">
      <div class="credit-overview-panel__bg" />
      <div class="credit-overview-panel__main">
        <div class="credit-overview-ring">
          <div class="credit-overview-ring__meter" :style="ringStyle" aria-hidden="true" />
          <div class="credit-overview-ring__center">
            <span>当前可用额度</span>
            <strong>{{ formatCurrency(availableCreditAmount) }}</strong>
            <div>总额度 {{ formatCurrency(totalCreditAmount) }}</div>
          </div>
        </div>

        <div class="credit-overview-side">
          <div>
            <h3>本期待还</h3>
            <div class="credit-overview-side__amount">
              {{ formatCurrency(currentBill?.unpaidAmount || 0) }}
            </div>
            <div v-if="currentBill" class="credit-overview-side__due-tag">
              最后还款日：{{ formatDate(currentBill.dueDate) || '-' }}
            </div>
          </div>

          <div class="credit-overview-side__meta">
            <div>
              <span>账单周期</span>
              <strong>{{ currentBill?.billCycle || '-' }}</strong>
            </div>
            <div>
              <span>账单状态</span>
              <strong>{{ currentBill?.billStatusLabel || (currentBill ? billStatusLabel(currentBill.billStatus) : '-') }}</strong>
            </div>
          </div>

          <div class="credit-overview-side__actions">
            <Button class="credit-primary-btn credit-overview-side__action" :disabled="!canRepaySelectedBill" @click="emit('repay-current')">
              立即还款
            </Button>
            <Button variant="outline" class="credit-secondary-btn credit-overview-side__action" @click="emit('show-all')">
              查看全部账单
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="credit-detail-card">
      <div class="credit-detail-card__header">
        <div class="flex items-center gap-3">
          <h3>本期明细</h3>
          <span class="credit-detail-card__period">{{ selectedBill?.billCycle || currentBill?.billCycle || '-' }}</span>
        </div>
        <Button variant="ghost" class="credit-link-btn" :disabled="!selectedBill && !currentBill" @click="emit('show-detail')">
          查看更多
        </Button>
      </div>

      <div class="credit-detail-table-wrap">
        <table class="credit-detail-table">
          <thead>
            <tr>
              <th>消费时间</th>
              <th>商品</th>
              <th>订单号</th>
              <th class="text-right">扣减额度 (元)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="billLoading || billDetailLoading">
              <td colspan="4" class="credit-empty">账单明细加载中...</td>
            </tr>
            <tr v-else-if="!(selectedBill || currentBill)">
              <td colspan="4" class="credit-empty">暂无账单数据</td>
            </tr>
            <tr v-else-if="!billDetailItems.length">
              <td colspan="4" class="credit-empty">暂无本期消费明细</td>
            </tr>
            <template v-else>
              <tr v-for="row in billDetailItems" :key="row.id" class="credit-detail-table__row">
                <td>{{ formatDateTime(row.detailTime) || '-' }}</td>
                <td>{{ row.productName || '-' }}</td>
                <td>{{ row.orderNo || '-' }}</td>
                <td class="text-right">{{ formatCurrency(row.creditAmount || 0) }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.credit-secondary-btn {
  min-width: 220px;
  height: 52px;
  padding: 0 32px;
  border-color: #e5e7eb;
  border-radius: 9999px;
  color: #374151;
  font-weight: 600;
  background: #fff;
}

.credit-secondary-btn:hover:not(:disabled) {
  border-color: #e5e7eb;
  color: #374151;
  background: #fff;
}

.credit-overview-panel,
.credit-detail-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
}

.credit-overview-panel {
  padding: 40px;
}

.credit-overview-panel__bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(270deg, rgb(238 242 255 / 0.7), transparent);
}

.credit-overview-panel__main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 64px;
}

.credit-overview-ring {
  position: relative;
  width: 288px;
  height: 288px;
  flex: none;
}

.credit-overview-ring__meter {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background:
    conic-gradient(
      from 0deg,
      var(--credit-ring-start) 0,
      var(--credit-ring-end) var(--credit-ring-percent),
      #f1f5f9 var(--credit-ring-percent),
      #f1f5f9 100%
    );
  transition: background 0.3s ease;
}

.credit-overview-ring__meter::after {
  position: absolute;
  inset: 18px;
  content: '';
  border-radius: inherit;
  background: #fff;
}

.credit-overview-ring__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.credit-overview-ring__center span {
  margin-bottom: 4px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.credit-overview-ring__center strong {
  color: #111827;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.credit-overview-ring__center div {
  margin-top: 12px;
  padding: 6px 12px;
  color: #4b5563;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  background: #f9fafb;
}

.credit-overview-side {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
  padding-left: 64px;
  border-left: 1px solid #f1f5f9;
}

.credit-overview-side h3 {
  margin: 0 0 16px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.credit-overview-side__amount {
  color: #111827;
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.credit-overview-side__due-tag {
  display: inline-flex;
  margin-top: 12px;
  padding: 6px 12px;
  color: #ea580c;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgb(253 186 116 / 0.4);
  border-radius: 10px;
  background: #fff7ed;
}

.credit-overview-side__meta {
  display: grid;
  gap: 16px;
  padding: 24px;
  border: 1px solid #f1f5f9;
  border-radius: 24px;
  background: rgb(249 250 251 / 0.8);
}

.credit-overview-side__meta div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.credit-overview-side__meta span {
  color: #6b7280;
  font-size: 14px;
}

.credit-overview-side__meta strong {
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.credit-overview-side__actions {
  display: flex;
  gap: 16px;
}

.credit-overview-side__action {
  flex: 1;
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

.credit-detail-card {
  margin-top: 24px;
  padding: 32px;
}

.credit-detail-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.credit-detail-card__header h3 {
  margin: 0;
  color: #111827;
  font-size: 20px;
  font-weight: 700;
}

.credit-detail-card__period {
  padding: 2px 8px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  background: #f3f4f6;
}

.credit-link-btn {
  color: #214fb6;
  font-weight: 500;
}

.credit-detail-table-wrap {
  overflow: hidden;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
}

.credit-detail-table {
  width: 100%;
  border-collapse: collapse;
  color: #4b5563;
  font-size: 14px;
}

.credit-detail-table thead {
  background: rgb(249 250 251 / 0.9);
  color: #6b7280;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.credit-detail-table th,
.credit-detail-table td {
  padding: 16px 24px;
}

.credit-detail-table__row {
  transition: background-color 0.18s ease;
}

.credit-detail-table__row:hover {
  background: rgb(249 250 251 / 0.6);
}

.credit-empty {
  padding: 32px 24px;
  color: #9ca3af;
  text-align: center;
}

@media (max-width: 1024px) {
  .credit-overview-panel__main {
    flex-direction: column;
    gap: 32px;
  }

  .credit-overview-side {
    width: 100%;
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid #f1f5f9;
    padding-top: 32px;
  }
}

@media (max-width: 768px) {
  .credit-overview-side__actions {
    flex-direction: column;
  }

  .credit-overview-panel,
  .credit-detail-card {
    padding: 24px;
  }

  .credit-overview-ring {
    width: 240px;
    height: 240px;
  }

  .credit-overview-side__amount {
    font-size: 32px;
  }

  .credit-detail-table-wrap {
    overflow-x: auto;
  }
}
</style>
