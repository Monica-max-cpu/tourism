<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Badge, Input, Label } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listSupplierOrdersApi, confirmSupplierOrderApi } from '/@/api/supplier/order';
import { SUPPLIER_ORDER_STATUS_LABEL, SUPPLIER_ORDER_STATUS_VARIANT } from '/@/constants/supplierStatus';
import { formatCurrency, formatDate, formatDateTime } from '/@/utils/format';

const router = useRouter();
const search = reactive({ collectiveNo: '' });
const [registerTable, { reload }] = useTable();
const submitting = ref(false);

async function loadData(params: any) {
  const query: any = { ...params, orderStatus: 0 };
  if (search.collectiveNo) query.collectiveNo = search.collectiveNo;
  return await listSupplierOrdersApi(query);
}

const columns: BasicColumn[] = [
  { field: 'collectiveNo', title: '集采单号', width: 170 },
  { field: 'supplierName', title: '供应商', minWidth: 180, showOverflow: 'tooltip', formatter: ({ row }) => row.supplierName || '-' },
  { field: 'orderCount', title: '关联订单数', width: 110, align: 'right' },
  { field: 'totalAmount', title: '应收金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'orderStatus', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'expectedDeliveryDate', title: '预计发货日期', width: 130, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'createTime', title: '下达时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'remark', title: '备注', minWidth: 160, showOverflow: 'tooltip', formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'action', title: '操作', width: 180, fixed: 'right', slots: { default: 'action' } },
];

async function confirmOrder(row: any) {
  submitting.value = true;
  try {
    await confirmSupplierOrderApi(row.id);
    reload();
  } finally {
    submitting.value = false;
  }
}

function openDetail(row: any) {
  router.push(`/b2b/supplier/orders/${row.id}`);
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.collectiveNo = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="待确认集采单" subtitle="后端状态 orderStatus=0 的集采单，可确认接单">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">集采单号</Label>
        <Input v-model="search.collectiveNo" placeholder="集采单号" class="w-52" @keyup.enter="onSearch" />
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SUPPLIER_ORDER_STATUS_VARIANT[row.orderStatus] || 'warning'">
          {{ SUPPLIER_ORDER_STATUS_LABEL[row.orderStatus] || '-' }}
        </Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '详情', onClick: () => openDetail(row) },
            { label: '确认接单', authCode: 'b2b:supplier:delivery', onClick: () => confirmOrder(row), disabled: submitting },
          ]"
        />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
