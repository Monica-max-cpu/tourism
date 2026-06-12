<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { CircleAlert, RefreshCw } from 'lucide-vue-next';
import { Button, Input, Label } from '/@/components/ui';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { PageWrapper } from '/@/components/PageWrapper';
import { useUserStore } from '/@/stores/modules/user';
import { getStoreProfileApi } from '/@/api/store/sales';
import {
  applyCreditBillRepayApi,
  applyStoreCreditApi,
  getStoreCreditBillDetailApi,
  getStoreCreditAccountApi,
  listStoreCreditBillsApi,
  syncStoreCreditStatusApi,
} from '/@/api/store/credit';
import { formatCurrency } from '/@/utils/format';
import {
  CREDIT_BILL_STATUS_LABEL,
  CREDIT_BILL_STATUS_VARIANT,
  CREDIT_STATUS_LABEL,
} from '/@/constants/creditStatus';
import type { CreditBillDetail, CreditBillDetailItem, CreditBillRecord, CreditBillStatus, StoreCreditAccount, StoreCreditStatus } from '/#/b2b-store';
import CreditUnappliedView from './components/credit/CreditUnappliedView.vue';
import CreditApplyFormView from './components/credit/CreditApplyFormView.vue';
import CreditApplyingView from './components/credit/CreditApplyingView.vue';
import CreditOverviewView from './components/credit/CreditOverviewView.vue';
import CreditBillListView from './components/credit/CreditBillListView.vue';
import CreditBillDetailView from './components/credit/CreditBillDetailView.vue';

type BillView = 'overview' | 'all_bills' | 'bill_detail';
type ApplyView = 'landing' | 'form';

const userStore = useUserStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');
const loading = ref(false);
const applying = ref(false);
const syncing = ref(false);
const repaying = ref(false);
const billLoading = ref(false);
const billDetailLoading = ref(false);
const accountLoaded = ref(false);
const account = ref<StoreCreditAccount | null>(null);
const repayModal = useModal<CreditBillRecord>();
const repayAmount = ref<number>(0);
const repayRemark = ref('');
const billView = ref<BillView>('overview');
const applyView = ref<ApplyView>('landing');
const billRecords = ref<CreditBillRecord[]>([]);
const selectedBillId = ref('');
const selectedBillDetail = ref<CreditBillDetail | null>(null);

const form = reactive({
  contactName: '',
  contactPhone: '',
  agreementChecked: false,
});

const status = computed<StoreCreditStatus>(() => account.value?.creditStatus ?? 0);
const isEnabled = computed(() => status.value === 2);
const canApply = computed(() => !!form.contactName && !!form.contactPhone && form.agreementChecked);
const canRepay = computed(() => repayAmount.value > 0 && repayAmount.value <= Number(repayModal.data.value?.unpaidAmount || 0));
const totalCreditAmount = computed(() => Number(account.value?.totalCreditAmount || 0));
const availableCreditAmount = computed(() => Number(account.value?.availableCreditAmount || 0));
const availablePercent = computed(() => {
  if (totalCreditAmount.value <= 0) return 0;
  return Math.min(100, Math.max(0, (availableCreditAmount.value / totalCreditAmount.value) * 100));
});
const sortedBills = computed(() =>
  [...billRecords.value].sort((a, b) => {
    const dateA = new Date(a.dueDate || a.createTime || 0).getTime();
    const dateB = new Date(b.dueDate || b.createTime || 0).getTime();
    return dateB - dateA;
  }),
);
const currentBill = computed(() => sortedBills.value[0] || null);
const selectedBill = computed(() => sortedBills.value.find((item) => item.id === selectedBillId.value) || currentBill.value);
const currentBillItems = computed<CreditBillDetailItem[]>(() => {
  const bill = selectedBill.value || currentBill.value;
  if (!bill || selectedBillDetail.value?.id !== bill.id) return [];
  return selectedBillDetail.value.items || [];
});
const canRepaySelectedBill = computed(
  () => !!selectedBill.value && Number(selectedBill.value.unpaidAmount || 0) > 0 && selectedBill.value.billStatus !== 2 && selectedBill.value.billStatus !== 4,
);
const shouldShowHeader = computed(() => isEnabled.value || status.value >= 4);
const rejectMessage = computed(() => account.value?.auditRemark || '银行暂未返回具体原因，可核对门店资料后重新申请。');
const showApplyForm = computed(() => status.value === 3 || applyView.value === 'form');

async function loadAccount() {
  loading.value = true;
  try {
    account.value = await getStoreCreditAccountApi(storeId.value);
    if (account.value?.creditStatus === 2) {
      await loadBillRecords();
    } else {
      billRecords.value = [];
      selectedBillId.value = '';
      selectedBillDetail.value = null;
    }
  } finally {
    loading.value = false;
    accountLoaded.value = true;
  }
}

async function loadProfileDefaults() {
  if (!storeId.value) return;
  const profile = await getStoreProfileApi(storeId.value);
  form.contactName = profile?.contactPerson || profile?.receiver || '';
  form.contactPhone = profile?.contactPhone || profile?.receiverPhone || '';
}

async function loadBillRecords() {
  if (!isEnabled.value) {
    billRecords.value = [];
    selectedBillId.value = '';
    selectedBillDetail.value = null;
    return;
  }
  billLoading.value = true;
  try {
    const resolvedStoreId = storeId.value || account.value?.storeId || undefined;
    const result = await listStoreCreditBillsApi({ storeId: resolvedStoreId, pageNo: 1, pageSize: 100 });
    billRecords.value = result.records || [];
    if (!billRecords.value.length) {
      selectedBillId.value = '';
      selectedBillDetail.value = null;
      return;
    }
    if (!selectedBillId.value || !billRecords.value.some((item) => item.id === selectedBillId.value)) {
      selectedBillId.value = billRecords.value[0].id;
    }
    await loadBillDetail(selectedBillId.value);
  } finally {
    billLoading.value = false;
  }
}

async function loadBillDetail(billId: string) {
  billDetailLoading.value = true;
  try {
    const fallbackBill = billRecords.value.find((item) => item.id === billId) || null;
    const result = await getStoreCreditBillDetailApi(billId);
    selectedBillDetail.value = {
      ...fallbackBill,
      ...result,
      items: result?.items || [],
    };
  } finally {
    billDetailLoading.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadAccount(), loadProfileDefaults()]);
});

watch(
  () => isEnabled.value,
  async (enabled) => {
    if (!enabled) {
      billView.value = 'overview';
      billRecords.value = [];
      selectedBillId.value = '';
      selectedBillDetail.value = null;
    }
  },
  { immediate: true },
);

watch(
  () => status.value,
  (currentStatus) => {
    if (currentStatus === 0) {
      applyView.value = 'landing';
      return;
    }
    if (currentStatus === 3) {
      applyView.value = 'form';
    }
  },
  { immediate: true },
);

watch(
  () => sortedBills.value,
  (records) => {
    if (!records.length) {
      selectedBillId.value = '';
      return;
    }
    if (!selectedBillId.value || !records.some((item) => item.id === selectedBillId.value)) {
      selectedBillId.value = records[0].id;
    }
  },
  { deep: true },
);

async function applyCredit() {
  if (!canApply.value) return;
  applying.value = true;
  try {
    const result = await applyStoreCreditApi({
      storeId: storeId.value,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      agreementChecked: form.agreementChecked,
    });
    if (result.account) {
      account.value = result.account;
    } else {
      await loadAccount();
    }
  } finally {
    applying.value = false;
  }
}

async function syncStatus() {
  syncing.value = true;
  try {
    const resolvedStoreId = storeId.value || account.value?.storeId || undefined;
    account.value = await syncStoreCreditStatusApi(resolvedStoreId);
    if (account.value.creditStatus === 2) {
      await loadBillRecords();
    }
  } finally {
    syncing.value = false;
  }
}

function billStatusLabel(statusValue: CreditBillStatus) {
  return CREDIT_BILL_STATUS_LABEL[statusValue] || '-';
}

function billStatusVariant(statusValue: CreditBillStatus) {
  return CREDIT_BILL_STATUS_VARIANT[statusValue] || 'warning';
}

function openRepay(row: CreditBillRecord) {
  repayAmount.value = Number(row.unpaidAmount || 0);
  repayRemark.value = '';
  repayModal.open(row);
}

function repayCurrentBill() {
  if (!selectedBill.value || !canRepaySelectedBill.value) return;
  openRepay(selectedBill.value);
}

function showAllBills() {
  billView.value = 'all_bills';
}

function showOverview() {
  billView.value = 'overview';
}

function showBillDetail(row?: CreditBillRecord | null) {
  const target = row || selectedBill.value;
  if (!target) return;
  selectedBillId.value = target.id;
  billView.value = 'bill_detail';
  void loadBillDetail(target.id);
}

function openApplyForm() {
  applyView.value = 'form';
}

function backToLanding() {
  if (status.value === 3) return;
  applyView.value = 'landing';
}

async function submitRepay() {
  const bill = repayModal.data.value;
  if (!bill || !canRepay.value) return;
  repaying.value = true;
  try {
    await applyCreditBillRepayApi({
      billId: bill.id,
      repayAmount: repayAmount.value,
      remark: repayRemark.value,
    });
    repayModal.close();
    await loadBillRecords();
  } finally {
    repaying.value = false;
  }
}
</script>

<template>
  <div v-if="!accountLoaded" class="credit-page">
    <div class="credit-shell">
      <div class="credit-inline-loading">
        <div class="credit-inline-loading__panel">
          <div class="credit-inline-loading__bar credit-inline-loading__bar--lg" />
          <div class="credit-inline-loading__bar credit-inline-loading__bar--md" />
          <div class="credit-inline-loading__grid">
            <div class="credit-inline-loading__card" />
            <div class="credit-inline-loading__card" />
            <div class="credit-inline-loading__card" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <PageWrapper
    v-else-if="shouldShowHeader"
    title="授信账户"
    subtitle="申请银行授信额度，并在采购下单时使用授信支付"
  >
    <template #extra>
      <Button variant="outline" class="credit-sync-btn" :disabled="loading || syncing || status === 0" @click="syncStatus">
        <RefreshCw class="mr-1.5 h-4 w-4" :class="{ 'animate-spin': syncing }" />
        同步状态
      </Button>
    </template>

    <div class="credit-page">
      <div class="credit-shell">
        <div v-if="loading" class="credit-inline-loading">
          <div class="credit-inline-loading__panel">
            <div class="credit-inline-loading__bar credit-inline-loading__bar--lg" />
            <div class="credit-inline-loading__bar credit-inline-loading__bar--md" />
            <div class="credit-inline-loading__grid">
              <div class="credit-inline-loading__card" />
              <div class="credit-inline-loading__card" />
              <div class="credit-inline-loading__card" />
            </div>
          </div>
        </div>

        <template v-else>
          <section v-if="isEnabled" class="credit-approved">
            <CreditOverviewView
              v-if="billView === 'overview'"
              :current-bill="currentBill"
              :selected-bill="selectedBill"
              :bill-loading="billLoading"
              :bill-detail-loading="billDetailLoading"
              :bill-detail-items="currentBillItems"
              :total-credit-amount="totalCreditAmount"
              :available-credit-amount="availableCreditAmount"
              :available-percent="availablePercent"
              :can-repay-selected-bill="canRepaySelectedBill"
              :bill-status-label="billStatusLabel"
              :bill-status-variant="billStatusVariant"
              @repay-current="repayCurrentBill"
              @show-all="showAllBills"
              @show-detail="showBillDetail()"
            />

            <CreditBillListView
              v-else-if="billView === 'all_bills'"
              :bills="sortedBills"
              :bill-loading="billLoading"
              :bill-status-label="billStatusLabel"
              :bill-status-variant="billStatusVariant"
              @back="showOverview"
              @select-bill="showBillDetail"
            />

            <CreditBillDetailView
              v-else
              :bill="selectedBillDetail"
              :loading="billDetailLoading"
              :can-repay="canRepaySelectedBill"
              :bill-status-label="billStatusLabel"
              :bill-status-variant="billStatusVariant"
              @back="showAllBills"
              @repay="repayCurrentBill"
            />
          </section>

          <section v-else class="credit-unavailable-card">
            <div class="credit-unavailable-card__icon">
              <CircleAlert class="h-5 w-5" />
            </div>
            <div class="credit-unavailable-card__copy">
              <h3>当前授信状态不可用</h3>
              <p>{{ account?.creditStatusLabel || CREDIT_STATUS_LABEL[status] }}：{{ rejectMessage }}</p>
            </div>
            <Button class="credit-primary-btn" :disabled="syncing" @click="syncStatus">
              {{ syncing ? '同步中...' : '同步授信状态' }}
            </Button>
          </section>
        </template>
      </div>
    </div>
  </PageWrapper>

  <div v-else class="credit-page">
    <div class="credit-shell">
      <CreditUnappliedView v-if="status === 0 && !showApplyForm" :applying="applying" @next="openApplyForm" />

      <CreditApplyFormView
        v-else-if="status === 0 || status === 3"
        :applying="applying"
        :can-apply="canApply"
        :show-reject-tip="status === 3"
        :reject-message="rejectMessage"
        :form="form"
        @back="backToLanding"
        @submit="applyCredit"
      />

      <CreditApplyingView
        v-else-if="status === 1"
        :syncing="syncing"
        :apply-no="account?.bankCreditApplyNo || ''"
        @sync="syncStatus"
      />
    </div>
  </div>

    <BasicModal
      v-model:open="repayModal.visible.value"
      title="发起授信还款"
      description="提交后将调用银行还款接口，账单状态以银行回调结果为准。"
      :confirm-loading="repaying"
      :confirm-disabled="!canRepay"
      width="560px"
      @confirm="submitRepay"
    >
      <div v-if="repayModal.data.value" class="credit-repay-modal">
        <div class="credit-repay-summary">
          <div>
            <span>账单周期</span>
            <strong>{{ repayModal.data.value.billCycle }}</strong>
          </div>
          <div>
            <span>本期未还</span>
            <strong class="credit-repay-summary__amount">{{ formatCurrency(repayModal.data.value.unpaidAmount) }}</strong>
          </div>
        </div>

        <div class="credit-repay-form">
          <div class="credit-repay-field">
            <div class="credit-repay-field__head">
              <Label>还款金额</Label>
              <span>最高可还 {{ formatCurrency(repayModal.data.value.unpaidAmount) }}</span>
            </div>
            <div class="credit-repay-amount">
              <span>¥</span>
              <Input
                v-model.number="repayAmount"
                type="number"
                min="0"
                :max="repayModal.data.value.unpaidAmount"
                class="credit-repay-amount__input"
              />
            </div>
          </div>

          <div class="credit-repay-field">
            <div class="credit-repay-field__head">
              <Label>备注</Label>
              <span>选填</span>
            </div>
            <Input v-model="repayRemark" placeholder="可填写本次还款说明" class="credit-repay-remark" />
          </div>
        </div>

        <div class="credit-repay-notice">
          <div class="credit-repay-notice__dot" />
          <p>提交后将发起银行还款申请，实际还款状态以银行回调和后续同步结果为准。</p>
        </div>
      </div>
    </BasicModal>
</template>

<style scoped>
.credit-page {
  min-height: 100%;
  padding: 24px;
}

.credit-shell {
  max-width: 1280px;
  margin: 0 auto;
}

.credit-sync-btn {
  min-width: 108px;
}

.credit-inline-loading,
.credit-unavailable-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 180px);
  padding: 96px 24px;
  border: 1px solid #f1f5f9;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
}

.credit-approved {
  display: grid;
}

.credit-inline-loading__panel {
  width: min(100%, 960px);
}

.credit-inline-loading__bar,
.credit-inline-loading__card {
  background: linear-gradient(90deg, #ffffff 25%, #f3f4f6 37%, #ffffff 63%);
  background-size: 400% 100%;
  animation: credit-shimmer 1.4s ease infinite;
  border: 1px solid #f1f5f9;
}

.credit-inline-loading__bar {
  height: 20px;
  border-radius: 9999px;
}

.credit-inline-loading__bar--lg {
  width: 240px;
}

.credit-inline-loading__bar--md {
  width: 380px;
  margin-top: 16px;
}

.credit-inline-loading__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.credit-inline-loading__card {
  height: 180px;
  border-radius: 24px;
}

.credit-unavailable-card {
  flex-direction: row;
  gap: 18px;
  justify-content: space-between;
  min-height: auto;
  padding: 32px;
}

.credit-unavailable-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: #dc2626;
  border-radius: 9999px;
  background: rgb(220 38 38 / 0.08);
}

.credit-unavailable-card__copy {
  flex: 1;
}

.credit-unavailable-card__copy h3 {
  margin: 0;
  color: #111827;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.credit-unavailable-card__copy p {
  max-width: 560px;
  margin: 16px 0 0;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.8;
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

.credit-repay-modal {
  display: grid;
  gap: 18px;
}

.credit-repay-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.credit-repay-summary > div,
.credit-repay-form,
.credit-repay-notice {
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  background: #fff;
}

.credit-repay-summary > div {
  padding: 18px;
  background: linear-gradient(180deg, #fff, rgb(249 250 251 / 0.78));
}

.credit-repay-summary span,
.credit-repay-field__head span {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.credit-repay-summary strong {
  display: block;
  margin-top: 8px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.credit-repay-summary__amount {
  color: #214fb6 !important;
  font-size: 24px !important;
  letter-spacing: 0;
}

.credit-repay-form {
  display: grid;
  gap: 18px;
  padding: 20px;
  background: rgb(249 250 251 / 0.7);
}

.credit-repay-field {
  display: grid;
  gap: 10px;
}

.credit-repay-field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.credit-repay-amount {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  box-shadow: inset 0 1px 0 rgb(15 23 42 / 0.02);
}

.credit-repay-amount span {
  color: #214fb6;
  font-size: 22px;
  font-weight: 700;
}

.credit-repay-amount__input {
  height: 52px;
  padding: 0;
  border: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  box-shadow: none;
}

.credit-repay-amount__input:focus {
  box-shadow: none;
}

.credit-repay-remark {
  height: 44px;
  border-radius: 14px;
  background: #fff;
}

.credit-repay-notice {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  background: #eff6ff;
}

.credit-repay-notice__dot {
  width: 8px;
  height: 8px;
  margin-top: 7px;
  flex: none;
  border-radius: 9999px;
  background: #214fb6;
}

.credit-repay-notice p {
  margin: 0;
  color: #375985;
  font-size: 13px;
  line-height: 1.7;
}

@keyframes credit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes credit-spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes credit-spin-soft {
  0%,
  100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}

@keyframes credit-pulse {
  0%,
  100% { transform: scale(1); opacity: 0.68; }
  50% { transform: scale(1.04); opacity: 1; }
}

@keyframes credit-ping {
  75%,
  100% { transform: scale(2); opacity: 0; }
}

@keyframes credit-dot {
  0%,
  80%,
  100% { transform: translateY(0); opacity: 0.55; }
  40% { transform: translateY(-2px); opacity: 1; }
}

@keyframes credit-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

@media (max-width: 768px) {
  .credit-page {
    padding: 16px;
  }

  .credit-unavailable-card {
    flex-direction: column;
    align-items: stretch;
  }

  .credit-repay-summary {
    grid-template-columns: 1fr;
  }

  .credit-inline-loading__grid {
    grid-template-columns: 1fr;
  }
}
</style>
