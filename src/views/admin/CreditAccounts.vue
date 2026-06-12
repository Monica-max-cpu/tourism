<script setup lang="ts">
import { reactive } from 'vue';
import { Badge, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { SearchBar } from '/@/components/SearchBar';
import { listCreditAccountsApi } from '/@/api/admin/credit';
import { CREDIT_STATUS_LABEL, CREDIT_STATUS_OPTIONS, CREDIT_STATUS_VARIANT } from '/@/constants/creditStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { StoreCreditStatus } from '/#/b2b-store';

const search = reactive({ storeId: '', creditStatus: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listCreditAccountsApi({ ...params, ...search });
}

function statusLabel(status: StoreCreditStatus) {
  return CREDIT_STATUS_LABEL[status] || '-';
}

function statusVariant(status: StoreCreditStatus) {
  return CREDIT_STATUS_VARIANT[status] || 'muted';
}

const columns: BasicColumn[] = [
  { field: 'storeName', title: '门店', minWidth: 180, showOverflow: 'tooltip', formatter: ({ row }) => row.storeName || row.storeId || '-' },
  { field: 'bankName', title: '银行', width: 150 },
  { field: 'bankCreditApplyNo', title: '申请单号', width: 180 },
  { field: 'bankCreditAccountNo', title: '授信账户号', width: 190 },
  { field: 'totalCreditAmount', title: '总额度', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'availableCreditAmount', title: '可用额度', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'usedCreditAmount', title: '已用额度', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'frozenCreditAmount', title: '冻结额度', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'creditStatus', title: '状态', width: 110, slots: { default: 'status' } },
  { field: 'lastSyncTime', title: '最近同步', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
];

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.storeId = '';
  search.creditStatus = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="授信账户管理" subtitle="查看门店授信账户、额度快照与银行同步状态">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">门店ID</Label>
        <Input v-model="search.storeId" placeholder="输入门店ID" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.creditStatus">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in CREDIT_STATUS_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="creditAccountId" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="statusVariant(row.creditStatus)">{{ row.creditStatusLabel || statusLabel(row.creditStatus) }}</Badge>
      </template>
    </BasicTable>
  </PageWrapper>
</template>
