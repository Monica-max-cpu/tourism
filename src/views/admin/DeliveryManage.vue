<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Badge, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listDeliveriesApi, handleDeliveryExceptionApi } from '/@/api/admin/fulfillment';
import {
  DELIVERY_RECORD_STATUS_LABEL,
  DELIVERY_RECORD_STATUS_VARIANT,
  DELIVERY_RECORD_STATUS_OPTIONS,
} from '/@/constants/b2b2cStatus';
import { formatDateTime } from '/@/utils/format';
import type { DeliveryRecord } from '/#/b2b-2c';

const router = useRouter();
const search = reactive({ deliveryNo: '', collectiveOrderId: '', storeId: '', supplierId: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const query: any = { ...params };
  Object.entries(search).forEach(([key, value]) => {
    if (value !== '') query[key] = key === 'status' ? Number(value) : value;
  });
  return await listDeliveriesApi(query);
}

const columns: BasicColumn[] = [
  { field: 'deliveryNo', title: '发货单号', width: 160 },
  { field: 'collectiveOrderId', title: '集采单ID', width: 180, showOverflow: 'tooltip' },
  // { field: 'collectiveItemId', title: '集采明细ID', width: 180, showOverflow: 'tooltip' },
  { field: 'supplierName', title: '供应商', minWidth: 160, formatter: ({ row }) => row.supplierName || row.supplierId || '-' },
  { field: 'storeName', title: '门店', width: 170, showOverflow: 'tooltip', formatter: ({ row }) => row.storeName || row.storeId || '-' },
  { field: 'productName', title: '商品', minWidth: 160, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'deliveryQty', title: '发货数量', width: 100, align: 'right' },
  // { field: 'receivedQty', title: '收货数量', width: 100, align: 'right', formatter: ({ cellValue }) => cellValue ?? '-' },
  { field: 'logisticsCompany', title: '物流公司', width: 120, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'trackingNo', title: '物流单号', width: 160, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'shippedTime', title: '发货时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'receivedTime', title: '收货时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 150, fixed: 'right', slots: { default: 'action' } },
];

const exceptionModal = useModal<DeliveryRecord>();
const exceptionRemark = ref('');
const submitting = ref(false);

function openDetail(row: DeliveryRecord) {
  router.push(`/b2b/admin/deliveries/${row.id}`);
}

function openException(row: DeliveryRecord) {
  exceptionRemark.value = row.receiveRemark || '';
  exceptionModal.open(row);
}

async function confirmException() {
  if (!exceptionModal.data.value || !exceptionRemark.value.trim()) return;
  submitting.value = true;
  try {
    await handleDeliveryExceptionApi(exceptionModal.data.value.id, exceptionRemark.value.trim());
    exceptionModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  Object.assign(search, { deliveryNo: '', collectiveOrderId: '', storeId: '', supplierId: '', status: '' });
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="履约管理" subtitle="按后端发货单记录跟踪供应商直发门店流程">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">发货单号</Label>
        <Input v-model="search.deliveryNo" placeholder="发货单号" class="w-48" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">集采单ID</Label>
        <Input v-model="search.collectiveOrderId" placeholder="集采单ID" class="w-52" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">门店ID</Label>
        <Input v-model="search.storeId" placeholder="门店ID" class="w-48" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-36"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in DELIVERY_RECORD_STATUS_OPTIONS" :key="String(o.value)" :value="String(o.value)">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="DELIVERY_RECORD_STATUS_VARIANT[row.status] || 'warning'">
          {{ DELIVERY_RECORD_STATUS_LABEL[row.status] || '-' }}
        </Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '详情', onClick: () => openDetail(row) },
            { label: '标记异常', authCode: 'b2b:delivery:exception', hidden: row.status === 2 || row.status === 3, onClick: () => openException(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="exceptionModal.visible.value"
      title="标记发货异常"
      :description="exceptionModal.data.value ? `发货单 ${exceptionModal.data.value.deliveryNo}` : ''"
      confirm-text="确认标记"
      confirm-variant="destructive"
      :confirm-loading="submitting"
      :confirm-disabled="!exceptionRemark.trim()"
      @confirm="confirmException"
    >
      <div class="space-y-2">
        <Label>异常说明 <span class="text-destructive">*</span></Label>
        <Input v-model="exceptionRemark" placeholder="请输入异常说明" />
      </div>
    </BasicModal>
  </PageWrapper>
</template>
