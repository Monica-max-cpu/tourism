<script setup lang="ts">
/**
 * 平台管理员 - 供应商结算（应付） */
import { reactive, ref } from 'vue';
import {
  Badge, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listSupplierSettlementsApi, paySettlementApi } from '/@/api/admin/fulfillment';
import { SETTLEMENT_STATUS_LABEL, SETTLEMENT_STATUS_VARIANT, SETTLEMENT_STATUS_OPTIONS } from '/@/constants/b2b2cStatus';
import { formatCurrency, formatDate, formatDateTime } from '/@/utils/format';
import type { SettlementRecord } from '/#/b2b-2c';

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();
const submitting = ref(false);

async function loadData(params: any) {
  return await listSupplierSettlementsApi({ ...params, searchInfo: { ...search } });
}

const columns: BasicColumn[] = [
  { field: 'settlementNo', title: '结算单号', width: 170 },
  { field: 'partyName', title: '供应商', minWidth: 200 },
  { field: 'periodFrom', title: '周期', width: 200, formatter: ({ row }) => `${formatDate(row.periodFrom)} ~ ${formatDate(row.periodTo)}` },
  { field: 'orderCount', title: '集采单数', width: 100, align: 'right', formatter: ({ cellValue }) => `${cellValue} 笔` },
  { field: 'amount', title: '应付金额', width: 140, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'generatedAt', title: '生成时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'paidAt', title: '付款时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 130, fixed: 'right', slots: { default: 'action' } },
];

async function pay(row: SettlementRecord) {
  submitting.value = true;
  try {
    await paySettlementApi(row.id);
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = ''; search.status = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="供应商结算（应付）" subtitle="平台向供应商发起的结算单">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="结算单号 / 供应商" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SETTLEMENT_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SETTLEMENT_STATUS_VARIANT[row.status]">{{ SETTLEMENT_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '标记付款', authCode: 'b2b:settlement:pay', hidden: row.status !== 'CONFIRMED', onClick: () => pay(row) },
          ]"
        />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
