<script setup lang="ts">
import { reactive, ref } from 'vue';
import { CreditCard, FileImage, Wallet } from 'lucide-vue-next';
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { confirmPaymentApi, listPaymentsApi } from '/@/api/admin/operations';
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_STATUS_VARIANT,
  paymentMethodLabel,
} from '/@/constants/b2b2bStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { PaymentMethod, PaymentRecord, PaymentStatus } from '/#/b2b-2b';

const search = reactive({ keyword: '', status: '', method: '' });
const [registerTable, { reload }] = useTable();
const detailModal = useModal<PaymentRecord>();
const submitting = ref(false);

async function loadData(params: any) {
  return await listPaymentsApi({ ...params, searchInfo: { ...search } });
}

function methodIcon(method: PaymentMethod) {
  return method === 'OFFLINE_TRANSFER' ? Wallet : CreditCard;
}

function paymentStatusLabel(status: PaymentStatus) {
  return PAYMENT_STATUS_LABEL[status] || status || '-';
}

function paymentStatusVariant(status: PaymentStatus) {
  return PAYMENT_STATUS_VARIANT[status] || 'warning';
}

const columns: BasicColumn[] = [
  { field: 'paymentNo', title: '支付编号', minWidth: 170 },
  { field: 'orderNo', title: '关联订单号', width: 170 },
  { field: 'storeName', title: '门店', width: 190, showOverflow: 'tooltip' },
  { field: 'amount', title: '金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'method', title: '支付方式', width: 150, slots: { default: 'method' } },
  { field: 'status', title: '状态', width: 110, slots: { default: 'status' } },
  { field: 'submittedAt', title: '提交时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'confirmedAt', title: '确认时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 190, fixed: 'right', slots: { default: 'action' } },
];

function openDetail(row: PaymentRecord) {
  detailModal.open(row);
}

async function confirm(row: PaymentRecord) {
  submitting.value = true;
  try {
    await confirmPaymentApi(row.id, row.amount);
    detailModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() {
  reload({ pageNo: 1 });
}

function onReset() {
  search.keyword = '';
  search.status = '';
  search.method = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="财务管理" subtitle="确认门店提交的付款记录，当前接口未完善时展示模拟数据">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="支付单号 / 订单号 / 门店" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in PAYMENT_STATUS_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">支付方式</Label>
        <Select v-model="search.method">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in PAYMENT_METHOD_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #method="{ row }">
        <div class="flex items-center gap-1.5">
          <component :is="methodIcon(row.method)" class="w-3.5 h-3.5 text-muted-foreground" />
          {{ paymentMethodLabel(row.method) }}
        </div>
      </template>
      <template #status="{ row }">
        <Badge :variant="paymentStatusVariant(row.status)">{{ paymentStatusLabel(row.status) }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '查看', onClick: () => openDetail(row) },
            { label: '确认收款', authCode: 'b2b:payment:manualConfirm', hidden: row.status !== 'PENDING_CONFIRM', onClick: () => confirm(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal v-model:open="detailModal.visible.value" title="支付记录详情" width="640px" hide-footer>
      <div v-if="detailModal.data.value" class="space-y-4 text-sm">
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <div><span class="text-muted-foreground">支付编号：</span><span class="font-mono">{{ detailModal.data.value.paymentNo }}</span></div>
          <div>
            <span class="text-muted-foreground">状态：</span>
            <Badge :variant="paymentStatusVariant(detailModal.data.value.status)">{{ paymentStatusLabel(detailModal.data.value.status) }}</Badge>
          </div>
          <div><span class="text-muted-foreground">关联订单号：</span><span class="font-mono">{{ detailModal.data.value.orderNo }}</span></div>
          <div><span class="text-muted-foreground">门店：</span>{{ detailModal.data.value.storeName }}</div>
          <div class="col-span-2">
            <span class="text-muted-foreground">金额：</span>
            <span class="text-2xl font-semibold text-foreground">{{ formatCurrency(detailModal.data.value.amount) }}</span>
          </div>
          <div><span class="text-muted-foreground">支付方式：</span>{{ paymentMethodLabel(detailModal.data.value.method) }}</div>
          <div v-if="detailModal.data.value.transactionNo">
            <span class="text-muted-foreground">流水号：</span><span class="font-mono text-xs">{{ detailModal.data.value.transactionNo }}</span>
          </div>
          <div><span class="text-muted-foreground">提交时间：</span>{{ formatDateTime(detailModal.data.value.submittedAt) }}</div>
          <div v-if="detailModal.data.value.confirmedAt">
            <span class="text-muted-foreground">确认时间：</span>{{ formatDateTime(detailModal.data.value.confirmedAt) }}
          </div>
          <div v-if="detailModal.data.value.rejectReason" class="col-span-2 text-destructive">
            <span class="text-muted-foreground">驳回原因：</span>{{ detailModal.data.value.rejectReason }}
          </div>
        </div>

        <div v-if="detailModal.data.value.voucherUrl" class="pt-3 border-t border-border">
          <div class="flex items-center gap-2 mb-2">
            <FileImage class="w-4 h-4 text-muted-foreground" />
            <span class="font-medium">转账凭证</span>
          </div>
          <a :href="detailModal.data.value.voucherUrl" target="_blank" class="block">
            <img :src="detailModal.data.value.voucherUrl" alt="凭证" class="max-h-72 w-full object-contain rounded border border-border bg-muted/30" loading="lazy" />
          </a>
        </div>

        <div v-if="detailModal.data.value.status === 'PENDING_CONFIRM'" v-auth="'b2b:payment:manualConfirm'" class="flex justify-end gap-2 pt-3 border-t border-border">
          <Button :disabled="submitting" @click="confirm(detailModal.data.value)">确认收款</Button>
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
