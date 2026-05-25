<script setup lang="ts">
/**
 * 门店 - 我的采购订单
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单列表
 * - 仅展示自有订单（storeId 强制过滤）
 * - 价格列只展示销售价合计；不出现成本/供应商毛利
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店订单列 */
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
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

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listStoreOrdersApi({ ...params, searchInfo: { ...search, storeId: storeId.value } });
}

const columns: BasicColumn[] = [
  { field: 'orderNo', title: '订单编号', width: 160 },
  { field: 'itemCount', title: 'SKU 数', width: 80, align: 'right' },
  { field: 'totalAmount', title: '订单金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'status', title: '状态', width: 110, slots: { default: 'status' } },
  { field: 'createdAt', title: '下单时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'carrier', title: '承运方', width: 110 },
  { field: 'trackingNo', title: '运单号', width: 160 },
  { field: 'action', title: '操作', width: 220, fixed: 'right', slots: { default: 'action' } },
];

function viewDetail(row: StoreViewOrder) { router.push(`/store/orders/${row.id}`); }
async function payNow(row: StoreViewOrder) { router.push(`/store/orders/${row.id}`); }
async function cancelOrder(row: StoreViewOrder) {
  await cancelStoreOrderApi(row.id, '门店主动取消');
  reload();
}
async function confirmReceive(row: StoreViewOrder) {
  await confirmReceiveApi(row.id);
  reload();
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.status = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="我的采购订单" subtitle="仅展示当前门店的订单，按下单时间倒序">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">订单编号</Label>
        <Input v-model="search.keyword" placeholder="OD..." class="w-52" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in STORE_ORDER_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="STORE_ORDER_STATUS_VARIANT[row.status]">{{ STORE_ORDER_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '查看', onClick: () => viewDetail(row) },
            { label: '去支付', authCode: 'b2b:store:payment', hidden: row.status !== 'PENDING_PAYMENT', onClick: () => payNow(row) },
            { label: '取消订单', variant: 'destructive', hidden: row.status !== 'PENDING_PAYMENT', onClick: () => cancelOrder(row) },
            { label: '确认收货', authCode: 'b2b:store:receive', hidden: row.status !== 'DELIVERED', onClick: () => confirmReceive(row) },
          ]"
        />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
