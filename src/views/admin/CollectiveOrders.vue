<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  Badge,
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
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listCollectiveOrdersApi } from '/@/api/admin/fulfillment';
import {
  COLLECTIVE_ORDER_STATUS_LABEL,
  COLLECTIVE_ORDER_STATUS_OPTIONS,
  COLLECTIVE_ORDER_STATUS_VARIANT,
  collectiveTriggerTypeLabel,
} from '/@/constants/b2b2cStatus';
import { formatCurrency, formatDate, formatDateTime } from '/@/utils/format';

const router = useRouter();
const search = reactive({ collectiveNo: '', supplierId: '', orderStatus: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const query: any = { ...params };
  if (search.collectiveNo) query.collectiveNo = search.collectiveNo;
  if (search.supplierId) query.supplierId = search.supplierId;
  if (search.orderStatus !== '') query.orderStatus = Number(search.orderStatus);
  return await listCollectiveOrdersApi(query);
}

const columns: BasicColumn[] = [
  { field: 'collectiveNo', title: '集采单号', width: 170 },
  { field: 'supplierName', title: '供应商', minWidth: 180, showOverflow: 'tooltip', formatter: ({ row }) => row.supplierName || row.supplierId || '-' },
  { field: 'orderCount', title: '关联订单数', width: 110, align: 'right' },
  { field: 'totalAmount', title: '集采金额', width: 150, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'orderStatus', title: '状态', width: 120, slots: { default: 'status' } },
  { field: 'triggerType', title: '触发方式', width: 130, formatter: ({ cellValue }) => collectiveTriggerTypeLabel(cellValue) },
  { field: 'expectedDeliveryDate', title: '预计发货日期', width: 150, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'createTime', title: '创建时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 130, fixed: 'right', slots: { default: 'action' } },
];

function openDetail(row: any) {
  router.push(`/b2b/admin/collective/orders/${row.id}`);
}

function onSearch() {
  reload({ pageNo: 1 });
}

function onReset() {
  Object.assign(search, { collectiveNo: '', supplierId: '', orderStatus: '' });
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="集采单列表" subtitle="按集采单查看供应商、触发方式、金额和履约状态">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">集采单号</Label>
        <Input v-model="search.collectiveNo" placeholder="集采单号" class="w-48" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">供应商ID</Label>
        <Input v-model="search.supplierId" placeholder="供应商ID" class="w-52" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.orderStatus">
          <SelectTrigger class="w-36"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in COLLECTIVE_ORDER_STATUS_OPTIONS" :key="String(option.value)" :value="String(option.value)">{{ option.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="COLLECTIVE_ORDER_STATUS_VARIANT[row.orderStatus] || 'warning'">
          {{ COLLECTIVE_ORDER_STATUS_LABEL[row.orderStatus] || '-' }}
        </Badge>
      </template>
      <template #action="{ row }">
        <TableAction :actions="[{ label: '详情', onClick: () => openDetail(row) }]" />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
