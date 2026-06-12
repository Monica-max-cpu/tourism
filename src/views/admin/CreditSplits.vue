<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Badge, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { SearchBar } from '/@/components/SearchBar';
import { TableAction } from '/@/components/TableAction';
import { listCreditSplitsApi, submitCreditSplitApi } from '/@/api/admin/credit';
import { PAYMENT_METHOD_OPTIONS, paymentMethodLabel } from '/@/constants/b2b2bStatus';
import { CREDIT_SPLIT_STATUS_LABEL, CREDIT_SPLIT_STATUS_OPTIONS, CREDIT_SPLIT_STATUS_VARIANT } from '/@/constants/creditStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { CreditPaymentSplitRecord, CreditSplitStatus } from '/#/b2b-store';

const search = reactive({ orderNo: '', paymentMethod: '', splitStatus: '' });
const submittingId = ref('');
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listCreditSplitsApi({ ...params, ...search });
}

function statusLabel(status: CreditSplitStatus) {
  return CREDIT_SPLIT_STATUS_LABEL[status] || '-';
}

function statusVariant(status: CreditSplitStatus) {
  return CREDIT_SPLIT_STATUS_VARIANT[status] || 'warning';
}

const columns: BasicColumn[] = [
  { field: 'orderNo', title: '订单号', width: 180 },
  { field: 'paymentMethod', title: '支付方式', width: 140, formatter: ({ cellValue }) => paymentMethodLabel(cellValue) },
  { field: 'splitChannel', title: '分账渠道', width: 140, formatter: ({ cellValue }) => paymentMethodLabel(cellValue) },
  { field: 'collectiveOrderId', title: '集采单ID', minWidth: 180 },
  { field: 'supplierId', title: '供应商ID', minWidth: 160 },
  { field: 'settlementId', title: '结算单ID', minWidth: 160 },
  { field: 'orderAmount', title: '订单金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'supplierAmount', title: '供应商应收', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'platformProfitAmount', title: '平台利润', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'splitAmount', title: '分账金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'splitStatus', title: '状态', width: 110, slots: { default: 'status' } },
  { field: 'channelSplitNo', title: '渠道分账单号', width: 180 },
  { field: 'createTime', title: '创建时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 150, fixed: 'right', slots: { default: 'action' } },
];

async function submitSplit(row: CreditPaymentSplitRecord) {
  submittingId.value = row.id;
  try {
    await submitCreditSplitApi(row.id);
    reload();
  } finally {
    submittingId.value = '';
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.orderNo = '';
  search.paymentMethod = '';
  search.splitStatus = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="支付分账管理" subtitle="确认收货结算后，按银联在线支付或授信支付渠道提交供应商分账并查看回调状态">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">订单号</Label>
        <Input v-model="search.orderNo" placeholder="输入订单号" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.splitStatus">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in CREDIT_SPLIT_STATUS_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">支付方式</Label>
        <Select v-model="search.paymentMethod">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in PAYMENT_METHOD_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="statusVariant(row.splitStatus)">{{ row.splitStatusLabel || statusLabel(row.splitStatus) }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            {
              label: submittingId === row.id ? '提交中...' : '提交银联分账',
              authCode: 'b2b:paymentSplit:submit',
              hidden: row.splitStatus !== 1,
              onClick: () => submitSplit(row),
            },
          ]"
        />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
