<script setup lang="ts">
/**
 * 供应商 - 报价历史
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价历史
 * - 只读视图，展示已下架/驳回/过期/已通过的所有历史报 * - 仅本供应商数 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价历史
 */
import { reactive, computed } from 'vue';
import {
  Badge, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { SearchBar } from '/@/components/SearchBar';
import { listSupplierQuotesApi } from '/@/api/supplier/quote';
import {
  SUPPLIER_QUOTE_STATUS_LABEL, SUPPLIER_QUOTE_STATUS_VARIANT, SUPPLIER_QUOTE_STATUS_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatCurrency, formatDate, formatDateTime } from '/@/utils/format';
import { useUserStore } from '/@/stores/modules/user';

const userStore = useUserStore();
const supplierId = computed(() => userStore.getUserInfo?.supplierId || '');

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listSupplierQuotesApi({ ...params, searchInfo: { ...search, supplierId: supplierId.value } });
}

const columns: BasicColumn[] = [
  { field: 'quoteNo', title: '报价编号', width: 150 },
  { field: 'productName', title: '商品名称', minWidth: 180 },
  { field: 'productSku', title: 'SKU', width: 120 },
  { field: 'costPrice', title: '报价', width: 120, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'validFrom', title: '生效日期', width: 110, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'validTo', title: '有效期至', width: 110, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'rejectReason', title: '驳回原因', minWidth: 180, showOverflow: 'tooltip' },
  { field: 'createdAt', title: '提交时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'reviewedAt', title: '审核时间', width: 160, formatter: ({ cellValue }) => (cellValue ? formatDateTime(cellValue) : '-') },
];

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.status = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="报价历史" subtitle="查看历次报价的提交、审核与变更记录">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="商品名/ 报价编号" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SUPPLIER_QUOTE_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SUPPLIER_QUOTE_STATUS_VARIANT[row.status]">{{ SUPPLIER_QUOTE_STATUS_LABEL[row.status] }}</Badge>
      </template>
    </BasicTable>
  </PageWrapper>
</template>
