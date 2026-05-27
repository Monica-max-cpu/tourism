<script setup lang="ts">
/**
 * 门店 - 我的采购订单
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】订单列表对齐 contract 9.2
 * - 状态改为数值 0-8
 * - 搜索: orderNo / orderStatus / startTime / endTime
 * - 列: orderStatus + statusLabel / createTime / storeName / paidAmount
 * update-end--author:claude---date:2026-05-26---for:【阶段7】订单列表对齐 contract 9.2
 */
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { listStoreOrdersApi, cancelStoreOrderApi, confirmReceiveApi } from '/@/api/store/order';
import {
  STORE_ORDER_STATUS_LABEL, STORE_ORDER_STATUS_VARIANT, STORE_ORDER_STATUS_OPTIONS,
} from '/@/constants/storeStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import { useUserStore } from '/@/stores/modules/user';
import type { StoreViewOrder } from '/#/b2b-store';

const router = useRouter();
const userStore = useUserStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');

const search = reactive({ orderNo: '', orderStatus: '', startTime: '', endTime: '' });
const [registerTable, { reload }] = useTable();

const cancelModal = useModal<StoreViewOrder>();
const cancelReason = ref('');
const cancelSubmitting = ref(false);

async function loadData(params: any) {
  return await listStoreOrdersApi({
    ...params,
    storeId: storeId.value,
    orderNo: search.orderNo,
    orderStatus: search.orderStatus,
    startTime: search.startTime,
    endTime: search.endTime,
  });
}

const columns: BasicColumn[] = [
  { field: 'orderNo', title: '订单编号', minWidth: 180 },
  // { field: 'storeName', title: '门店', width: 130 },
  // { field: 'itemCount', title: 'SKU 数', width: 80, align: 'right' },
  { field: 'totalAmount', title: '订单金额', width: 190, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  // { field: 'paidAmount', title: '已付金额', width: 130, align: 'right', formatter: ({ cellValue }) => cellValue ? formatCurrency(cellValue) : '-' },
  { field: 'orderStatus', title: '状态', align: 'center',width: 190, slots: { default: 'status' } },
  { field: 'createTime', title: '下单时间', width: 220, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 280, fixed: 'right', slots: { default: 'action' } },
];

function viewDetail(row: StoreViewOrder) { router.push(`/store/orders/${row.id}`); }
function payNow(row: StoreViewOrder) { router.push(`/store/orders/${row.id}`); }
function cancelOrder(row: StoreViewOrder) {
  cancelReason.value = '';
  cancelModal.open(row);
}
async function confirmCancel() {
  const target = cancelModal.data.value;
  if (!target) return;
  cancelSubmitting.value = true;
  try {
    await cancelStoreOrderApi(target.id, cancelReason.value || '门店主动取消');
    cancelModal.close();
    reload();
  } finally {
    cancelSubmitting.value = false;
  }
}
async function confirmReceive(row: StoreViewOrder) {
  await confirmReceiveApi(row.id);
  reload();
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.orderNo = ''; search.orderStatus = ''; search.startTime = ''; search.endTime = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="我的采购订单" subtitle="仅展示当前门店的订单，按下单时间倒序">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">订单编号</Label>
        <Input v-model="search.orderNo" placeholder="OD..." class="w-44" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.orderStatus">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in STORE_ORDER_STATUS_OPTIONS" :key="o.value" :value="String(o.value)">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">开始</Label>
        <Input v-model="search.startTime" type="date" class="w-36" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">结束</Label>
        <Input v-model="search.endTime" type="date" class="w-36" />
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="STORE_ORDER_STATUS_VARIANT[row.orderStatus] || 'info'">
          {{ row.statusLabel || STORE_ORDER_STATUS_LABEL[row.orderStatus] }}
        </Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '查看', onClick: () => viewDetail(row) },
            { label: '去支付', authCode: 'b2b:store:payment', hidden: row.orderStatus !== 0, onClick: () => payNow(row) },
            { label: '取消订单', variant: 'destructive', hidden: row.orderStatus !== 0, onClick: () => cancelOrder(row) },
            { label: '确认收货', authCode: 'b2b:store:receive', hidden: row.orderStatus !== 3, onClick: () => confirmReceive(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="cancelModal.visible.value"
      title="确认取消订单"
      description="取消后不可恢复，请填写取消原因"
      confirm-text="确认取消"
      :confirm-loading="cancelSubmitting"
      @confirm="confirmCancel"
    >
      <div class="space-y-2">
        <Label>取消原因</Label>
        <Input v-model="cancelReason" placeholder="请输入取消原因" />
      </div>
    </BasicModal>
  </PageWrapper>
</template>
