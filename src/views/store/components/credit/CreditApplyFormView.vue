<script setup lang="ts">
import { Button, Input, Label } from '/@/components/ui';

defineProps<{
  applying: boolean;
  canApply: boolean;
  showRejectTip: boolean;
  rejectMessage: string;
  form: {
    contactName: string;
    contactPhone: string;
    agreementChecked: boolean;
  };
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'submit'): void;
}>();
</script>

<template>
  <section class="credit-form-page">
    <div class="credit-form-page__head">
      <button class="credit-back-btn" type="button" @click="emit('back')">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <h2>填写授信申请资料</h2>
    </div>

    <div class="credit-form-page__card">
      <div class="credit-form-page__notice">
        <h3>授信申请须知</h3>
        <p>请如实填写联系人信息并勾选授权协议。提交后银行侧将进行风控审批，审批通过后即可在采购结算时使用授信支付。</p>
      </div>

      <div v-if="showRejectTip" class="credit-reject-tip">
        上次申请未通过：{{ rejectMessage }}
      </div>

      <div class="credit-form-page__section">
        <h4>
          <span>1</span>
          法人及联系人信息
        </h4>
        <div class="credit-form-grid">
          <div>
            <Label class="credit-form-label">业务联系人 <span class="text-destructive">*</span></Label>
            <Input v-model="form.contactName" class="credit-form-input" placeholder="请输入联系人姓名" />
          </div>
          <div>
            <Label class="credit-form-label">联系电话 <span class="text-destructive">*</span></Label>
            <Input v-model="form.contactPhone" class="credit-form-input" placeholder="请输入联系人手机号" />
          </div>
        </div>
      </div>

      <div class="credit-form-page__agreement">
        <input v-model="form.agreementChecked" type="checkbox" class="credit-agreement__checkbox" />
        <label>
          我已阅读并同意 <span>《银行授信授权协议》</span> 及 <span>《企业征信查询授权书》</span>，授权平台向合作银行提交上述资料用于授信审批及风控评估。
        </label>
      </div>

      <div class="credit-form-page__actions">
        <Button class="credit-primary-btn credit-form-page__submit" :disabled="!canApply || applying" @click="emit('submit')">
          {{ applying ? '提交中...' : '提交申请' }}
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.credit-form-page {
  max-width: 1120px;
  margin: 0 auto;
}

.credit-form-page__head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
}

.credit-form-page__head h2 {
  margin: 0;
  color: #111827;
  font-size: 32px;
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

.credit-form-page__card {
  padding: 40px 44px;
  border: 1px solid #f1f5f9;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
}

.credit-form-page__notice {
  margin-bottom: 40px;
  padding: 28px 30px;
  border: 1px solid rgb(226 235 249 / 0.8);
  border-radius: 20px;
  background: rgb(239 244 252 / 0.65);
}

.credit-form-page__notice h3 {
  margin: 0 0 8px;
  color: #1e3a8a;
  font-size: 18px;
  font-weight: 600;
}

.credit-form-page__notice p {
  margin: 0;
  color: rgb(30 58 138 / 0.8);
  font-size: 14px;
  line-height: 1.7;
}

.credit-reject-tip {
  margin-bottom: 28px;
  padding: 18px 20px;
  color: #b91c1c;
  font-size: 14px;
  text-align: left;
  border: 1px solid rgb(220 38 38 / 0.14);
  border-radius: 18px;
  background: rgb(254 242 242 / 0.95);
}

.credit-form-page__section h4 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 28px;
  color: #111827;
  font-size: 20px;
  font-weight: 600;
}

.credit-form-page__section h4 span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #214fb6;
  font-size: 14px;
  border-radius: 9999px;
  background: #dbeafe;
}

.credit-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.credit-form-label {
  display: block;
  margin-bottom: 12px;
  color: #374151;
  font-weight: 500;
}

.credit-form-input {
  height: 58px;
  border-color: #e5e7eb;
  border-radius: 16px;
  background: rgb(249 250 251 / 0.75);
}

.credit-form-page__agreement {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 44px;
  padding: 28px;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.8;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  background: rgb(249 250 251 / 0.75);
}

.credit-form-page__agreement span {
  color: #214fb6;
  font-weight: 500;
}

.credit-agreement__checkbox {
  width: 16px;
  height: 16px;
  margin-top: 4px;
}

.credit-form-page__actions {
  display: flex;
  justify-content: center;
  margin-top: 36px;
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

.credit-form-page__submit {
  width: min(100%, 460px);
}

@media (max-width: 768px) {
  .credit-form-page__card {
    padding: 24px;
  }

  .credit-form-page__head h2 {
    font-size: 24px;
  }

  .credit-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
