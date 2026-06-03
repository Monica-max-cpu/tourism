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
import { listStoreOrdersApi, cancelStoreOrderApi } from '/@/api/admin/operations';
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT, ORDER_STATUS_OPTIONS } from '/@/constants/b2b2bStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { OrderStatus, StoreOrder } from '/#/b2b-2b';

const router = useRouter();
const search = reactive({ orderNo: '', storeId: '', orderStatus: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const query: any = { ...params };
  if (search.orderNo) query.orderNo = search.orderNo;
  if (search.storeId) query.storeId = search.storeId;
  if (search.orderStatus !== '') query.orderStatus = Number(search.orderStatus);
  return await listStoreOrdersApi(query);
}

const columns: BasicColumn[] = [
  { field: 'orderNo', title: '订单号', width: 280 },
  { field: 'storeName', title: '门店', width: 250, showOverflow: 'tooltip', formatter: ({ row }) => row.storeName || row.storeId || '-' },
  { field: 'totalAmount', title: '订单金额', width: 180, align: 'center', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  // { field: 'paidAmount', title: '已付金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'orderStatus', title: '状态', minWidth: 130, align: 'center', slots: { default: 'status' } },
  { field: 'paymentMethod', title: '支付方式', width: 200, align: 'center', formatter: ({ cellValue }) => cellValue || '-' },
  // { field: 'paymentTime', title: '支付确认时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  // { field: 'expiredTime', title: '支付超时时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'createTime', title: '下单时间', width: 200, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 240, fixed: 'right', slots: { default: 'action' } },
];

function orderStatusLabel(status: OrderStatus, fallback?: string) {
  return fallback || ORDER_STATUS_LABEL[status] || '-';
}

function orderStatusVariant(status: OrderStatus) {
  return ORDER_STATUS_VARIANT[status] || 'warning';
}

const cancelModal = useModal<StoreOrder>();
const cancelReason = ref('');
const submitting = ref(false);

function openDetail(row: StoreOrder) {
  router.push({ path: ROUTE_PATHS.ADMIN_STORE_ORDER_DETAIL.replace(':id', row.id) });
}

function openCancel(row: StoreOrder) {
  cancelReason.value = '';
  cancelModal.open(row);
}

async function confirmCancel() {
  if (!cancelReason.value.trim() || !cancelModal.data.value) return;
  submitting.value = true;
  try {
    await cancelStoreOrderApi(cancelModal.data.value.id, cancelReason.value.trim());
    cancelModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  Object.assign(search, { orderNo: '', storeId: '', orderStatus: '' });
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="门店采购订单" subtitle="按后端门店订单主表和订单详情字段管理采购订单">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">订单号</Label>
        <Input v-model="search.orderNo" placeholder="订单号" class="w-48" @keyup.enter="onSearch" />
      </div>
      <!-- <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">门店ID</Label>
        <Input v-model="search.storeId" placeholder="门店ID" class="w-52" @keyup.enter="onSearch" />
      </div> -->
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.orderStatus">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in ORDER_STATUS_OPTIONS" :key="String(o.value)" :value="String(o.value)">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="orderStatusVariant(row.orderStatus)">
          {{ orderStatusLabel(row.orderStatus, row.statusLabel) }}
        </Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '详情', onClick: () => openDetail(row) },
            { label: '取消', variant: 'link', hidden: row.orderStatus !== 0, onClick: () => openCancel(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="cancelModal.visible.value"
      title="取消订单"
      :description="`将取消订单 ${cancelModal.data.value?.orderNo || ''}`"
      confirm-text="确认取消"
      confirm-variant="destructive"
      :confirm-loading="submitting"
      :confirm-disabled="!cancelReason.trim()"
      @confirm="confirmCancel"
    >
      <div class="space-y-2">
        <Label>取消原因 <span class="text-destructive">*</span></Label>
        <Input v-model="cancelReason" placeholder="请输入取消原因" />
      </div>
    </BasicModal>
  </PageWrapper>
</template>
