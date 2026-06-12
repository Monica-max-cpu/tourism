<script setup lang="ts">
import { reactive } from 'vue';
import { Badge, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { SearchBar } from '/@/components/SearchBar';
import { listCreditBillsApi } from '/@/api/admin/credit';
import { CREDIT_BILL_STATUS_LABEL, CREDIT_BILL_STATUS_OPTIONS, CREDIT_BILL_STATUS_VARIANT } from '/@/constants/creditStatus';
import { formatCurrency, formatDate, formatDateTime } from '/@/utils/format';
import type { CreditBillStatus } from '/#/b2b-store';

const search = reactive({ storeId: '', billStatus: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listCreditBillsApi({ ...params, ...search });
}

function statusLabel(status: CreditBillStatus) {
  return CREDIT_BILL_STATUS_LABEL[status] || '-';
}

function statusVariant(status: CreditBillStatus) {
  return CREDIT_BILL_STATUS_VARIANT[status] || 'warning';
}

const columns: BasicColumn[] = [
  { field: 'billNo', title: '账单号', width: 180 },
  { field: 'storeName', title: '门店', minWidth: 180, showOverflow: 'tooltip', formatter: ({ row }) => row.storeName || row.storeId || '-' },
  { field: 'billCycle', title: '账单周期', width: 110 },
  { field: 'billAmount', title: '应还金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'paidAmount', title: '已还金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'unpaidAmount', title: '未还金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'dueDate', title: '到期日', width: 130, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'overdueDays', title: '逾期天数', width: 100, align: 'right' },
  { field: 'billStatus', title: '状态', width: 110, slots: { default: 'status' } },
  { field: 'createTime', title: '生成时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
];

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.storeId = '';
  search.billStatus = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="授信账单查看" subtitle="查看门店授信账单周期、应还与还款状态">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">门店ID</Label>
        <Input v-model="search.storeId" placeholder="输入门店ID" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.billStatus">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in CREDIT_BILL_STATUS_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="statusVariant(row.billStatus)">{{ row.billStatusLabel || statusLabel(row.billStatus) }}</Badge>
      </template>
    </BasicTable>
  </PageWrapper>
</template>
