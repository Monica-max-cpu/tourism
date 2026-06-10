<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Badge, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listSupplierOrdersApi } from '/@/api/supplier/order';
import { SUPPLIER_ORDER_STATUS_LABEL, SUPPLIER_ORDER_STATUS_VARIANT, SUPPLIER_ORDER_STATUS_OPTIONS } from '/@/constants/supplierStatus';
import { formatCurrency, formatDate, formatDateTime } from '/@/utils/format';

const router = useRouter();
const search = reactive({ collectiveNo: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const query: any = { ...params };
  if (search.collectiveNo) query.collectiveNo = search.collectiveNo;
  if (search.status !== '') query.orderStatus = Number(search.status);
  const page = await listSupplierOrdersApi(query);
  if (search.status !== '' || !page?.records) return page;
  const records = page.records.filter((row: any) => row.orderStatus !== 0);
  return { ...page, records, total: records.length };
}

const columns: BasicColumn[] = [
  { field: 'collectiveNo', title: '集采单号', width: 170 },
  { field: 'supplierName', title: '供应商', minWidth: 180, showOverflow: 'tooltip', formatter: ({ row }) => row.supplierName || '-' },
  { field: 'orderCount', title: '关联订单数', width: 110, align: 'right' },
  { field: 'totalAmount', title: '应收金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'orderStatus', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'expectedDeliveryDate', title: '预计发货日期', width: 130, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'confirmTime', title: '接单时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'createTime', title: '创建时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 100, fixed: 'right', slots: { default: 'action' } },
];

function openDetail(row: any) {
  router.push(`/b2b/supplier/orders/${row.id}`);
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  Object.assign(search, { collectiveNo: '', status: '' });
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="进行中集采单" subtitle="已接单及后续状态的集采单；发货请到发货管理处理发货单任务">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">集采单号</Label>
        <Input v-model="search.collectiveNo" placeholder="集采单号" class="w-52" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SUPPLIER_ORDER_STATUS_OPTIONS" :key="String(o.value)" :value="String(o.value)">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SUPPLIER_ORDER_STATUS_VARIANT[row.orderStatus] || 'warning'">
          {{ SUPPLIER_ORDER_STATUS_LABEL[row.orderStatus] || '-' }}
        </Badge>
      </template>
      <template #action="{ row }">
        <TableAction :actions="[{ label: '详情', onClick: () => openDetail(row) }]" />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
