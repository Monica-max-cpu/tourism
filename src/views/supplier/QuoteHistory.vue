<script setup lang="ts">
/**
 * 供应商 - 报价历史
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价历史
 * - 只读视图，展示已下架/驳回/过期/已通过的所有历史报 * - 仅本供应商数 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价历史
 */
import { reactive } from 'vue';
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

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const res: any = await listSupplierQuotesApi({ ...params, ...search });
  const list = Array.isArray(res) ? res : (res.records || []);
  const records = list.map((item: any) => {
    const q = item.quote || item;
    return {
      ...q,
      tiers: item.tiers,
      status: q.status,
      productName: q.productName || '',
    };
  });
  return { records, total: records.length };
}

const columns: BasicColumn[] = [
  { field: 'productName', title: '商品名称', minWidth: 150 },
  { field: 'basePrice', title: '报价', width: 150, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'validFrom', title: '生效日期', width: 180, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'validTo', title: '有效期至', width: 180, formatter: ({ cellValue }) => formatDate(cellValue) },
 
  { field: 'createTime', title: '提交时间', width: 200, formatter: ({ cellValue }) => formatDateTime(cellValue) },
   { field: 'status', title: '状态', width: 150, slots: { default: 'status' } },
    { field: 'reviewRemark', title: '驳回原因', minWidth: 130, showOverflow: 'tooltip' },
  { field: 'reviewTime', title: '审核时间', width: 200, formatter: ({ cellValue }) => (cellValue ? formatDateTime(cellValue) : '-') },
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
