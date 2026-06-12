<script setup lang="ts">
import { Badge, Button } from '/@/components/ui';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { CreditBillDetail, CreditBillStatus } from '/#/b2b-store';

defineProps<{
  bill: CreditBillDetail | null;
  loading: boolean;
  canRepay: boolean;
  billStatusLabel: (status: CreditBillStatus) => string;
  billStatusVariant: (status: CreditBillStatus) => 'warning' | 'info' | 'success' | 'destructive' | 'muted';
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'repay'): void;
}>();
</script>

<template>
  <div id="bill-bill_detail" class="credit-bill-view-card">
    <div class="credit-bill-detail-head">
      <div class="flex items-center gap-4">
        <button class="credit-back-btn" type="button" @click="emit('back')">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2>{{ bill?.billCycle || '-' }} 账单明细</h2>
      </div>
      <Button class="credit-primary-btn credit-bill-detail-head__btn" :disabled="!canRepay" @click="emit('repay')">
        立即还款
      </Button>
    </div>

    <div class="credit-bill-summary">
      <div>
        <p>本期账单总额 (元)</p>
        <strong>{{ formatCurrency(bill?.billAmount || 0) }}</strong>
      </div>
      <div class="text-right">
        <p>账单状态</p>
        <div class="credit-bill-summary__status">
          <Badge :variant="billStatusVariant(bill?.billStatus || 0)">
            {{ bill?.billStatusLabel || billStatusLabel(bill?.billStatus || 0) }}
          </Badge>
        </div>
      </div>
    </div>

    <div class="credit-detail-table-wrap">
      <table class="credit-detail-table">
        <thead>
          <tr>
            <th>购买时间</th>
            <th>商品</th>
            <th>订单号</th>
            <th class="text-right">扣减额度 (元)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="credit-empty">账单明细加载中...</td>
          </tr>
          <tr v-else-if="!bill?.items?.length">
            <td colspan="4" class="credit-empty">暂无账单明细</td>
          </tr>
          <tr v-for="row in bill?.items || []" :key="row.id" class="credit-detail-table__row">
            <td>{{ formatDateTime(row.detailTime) || '-' }}</td>
            <td>{{ row.productName || '-' }}</td>
            <td>{{ row.orderNo || '-' }}</td>
            <td class="text-right">{{ formatCurrency(row.creditAmount || 0) }}</td>
          </tr>
        </tbody>
      </table>
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

.credit-bill-detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.credit-bill-detail-head h2 {
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

.credit-bill-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 24px 0;
  padding: 24px 32px;
  border: 1px solid #f1f5f9;
  border-radius: 24px;
  background: linear-gradient(90deg, rgb(249 250 251 / 0.9), #fff);
}

.credit-bill-summary p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.credit-bill-summary strong {
  display: block;
  margin-top: 8px;
  color: #111827;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.03em;
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

@media (max-width: 768px) {
  .credit-bill-view-card,
  .credit-bill-summary {
    padding: 24px;
  }

  .credit-bill-detail-head,
  .credit-bill-summary {
    flex-direction: column;
    align-items: stretch;
  }

  .credit-detail-table-wrap {
    overflow-x: auto;
  }
}
</style>
