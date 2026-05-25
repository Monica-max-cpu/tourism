<script setup lang="ts">
/**
 * 门店 - 我的付款记录
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款记录
 * - 仅展示当前门店付款（storeId 强制过滤）
 * - 支持查看凭证/ 驳回原因
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店付款记 */
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Badge, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { listStorePaymentsApi } from '/@/api/store/payment';
import {
  STORE_PAYMENT_STATUS_LABEL, STORE_PAYMENT_STATUS_VARIANT, STORE_PAYMENT_STATUS_OPTIONS,
  STORE_PAYMENT_METHOD_LABEL, STORE_PAYMENT_METHOD_OPTIONS,
} from '/@/constants/storeStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import { useUserStore } from '/@/stores/modules/user';
import type { StorePaymentRecord } from '/#/b2b-store';

const router = useRouter();
const userStore = useUserStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');

const search = reactive({ keyword: '', status: '', method: '' });
const [registerTable, { reload }] = useTable();
const detailModal = useModal<StorePaymentRecord | null>();

async function loadData(params: any) {
  return await listStorePaymentsApi({ ...params, searchInfo: { ...search, storeId: storeId.value } });
}

const columns: BasicColumn[] = [
  { field: 'paymentNo', title: '付款编号', width: 160 },
  { field: 'orderNo', title: '关联订单', width: 160 },
  { field: 'amount', title: '付款金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'method', title: '支付方式', width: 110, formatter: ({ cellValue }) => STORE_PAYMENT_METHOD_LABEL[cellValue as keyof typeof STORE_PAYMENT_METHOD_LABEL] || '-' },
  { field: 'status', title: '状态', width: 110, slots: { default: 'status' } },
  { field: 'submittedAt', title: '提交时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'confirmedAt', title: '确认时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 160, fixed: 'right', slots: { default: 'action' } },
];

function viewDetail(row: StorePaymentRecord) { detailModal.open(row); }
function viewOrder(row: StorePaymentRecord) { router.push(`/store/orders/${row.orderId}`); }

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.status = ''; search.method = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="我的付款记录" subtitle="所有由本门店发起的付款及其平台确认状态">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="付款编号 / 订单号" class="w-52" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-36"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in STORE_PAYMENT_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">支付方式</Label>
        <Select v-model="search.method">
          <SelectTrigger class="w-36"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in STORE_PAYMENT_METHOD_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="STORE_PAYMENT_STATUS_VARIANT[row.status]">{{ STORE_PAYMENT_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '查看凭证', onClick: () => viewDetail(row) },
            { label: '查看订单', onClick: () => viewOrder(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal v-model:open="detailModal.visible.value" title="付款凭证详情" hide-footer width="560px">
      <div v-if="detailModal.data.value" class="space-y-3 text-sm">
        <div class="flex justify-between"><span class="text-muted-foreground">付款编号</span><span class="font-mono">{{ detailModal.data.value.paymentNo }}</span></div>
        <div class="flex justify-between"><span class="text-muted-foreground">关联订单</span><span class="font-mono">{{ detailModal.data.value.orderNo }}</span></div>
        <div class="flex justify-between"><span class="text-muted-foreground">付款金额</span><span class="text-primary font-bold tabular-nums">{{ formatCurrency(detailModal.data.value.amount) }}</span></div>
        <div class="flex justify-between"><span class="text-muted-foreground">支付方式</span><span>{{ STORE_PAYMENT_METHOD_LABEL[detailModal.data.value.method] }}</span></div>
        <div class="flex justify-between"><span class="text-muted-foreground">状态</span>
          <Badge :variant="STORE_PAYMENT_STATUS_VARIANT[detailModal.data.value.status]">{{ STORE_PAYMENT_STATUS_LABEL[detailModal.data.value.status] }}</Badge>
        </div>
        <div v-if="detailModal.data.value.transactionNo" class="flex justify-between">
          <span class="text-muted-foreground">流水号：</span><span class="font-mono">{{ detailModal.data.value.transactionNo }}</span>
        </div>
        <div v-if="detailModal.data.value.voucherUrl">
          <div class="text-muted-foreground mb-1.5">凭证图</div>
          <img :src="detailModal.data.value.voucherUrl" class="w-full rounded border border-border" />
        </div>
        <div v-if="detailModal.data.value.rejectReason" class="bg-destructive/10 text-destructive rounded p-3 text-xs">
          驳回原因：{{ detailModal.data.value.rejectReason }}
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
