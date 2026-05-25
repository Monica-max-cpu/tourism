<script setup lang="ts">
/**
 * 平台管理员 - 履约管理
 */
import { reactive, ref } from 'vue';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listDeliveriesApi, handleDeliveryExceptionApi } from '/@/api/admin/fulfillment';
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_VARIANT, DELIVERY_STATUS_OPTIONS } from '/@/constants/b2b2cStatus';
import { formatDateTime } from '/@/utils/format';
import type { DeliveryRecord } from '/#/b2b-2c';

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listDeliveriesApi({ ...params, searchInfo: { ...search } });
}

const columns: BasicColumn[] = [
  { field: 'deliveryNo', title: '配送单号', width: 160 },
  { field: 'collectiveNo', title: '集采单号', width: 160 },
  { field: 'supplierName', title: '供应商', minWidth: 180 },
  { field: 'storeName', title: '收货门店', minWidth: 160 },
  { field: 'carrier', title: '承运方', width: 110 },
  { field: 'trackingNo', title: '物流单号', width: 160 },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'shippedAt', title: '发货时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'deliveredAt', title: '送达时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 140, fixed: 'right', slots: { default: 'action' } },
];

const exceptionModal = useModal<DeliveryRecord>();
const exceptionForm = reactive<{ action: 'retry' | 'cancel'; remark: string }>({ action: 'retry', remark: '' });
const submitting = ref(false);

function openException(row: DeliveryRecord) {
  exceptionForm.action = 'retry';
  exceptionForm.remark = '';
  exceptionModal.open(row);
}

async function confirmException() {
  if (!exceptionForm.remark.trim() || !exceptionModal.data.value) return;
  submitting.value = true;
  try {
    await handleDeliveryExceptionApi(exceptionModal.data.value.id, exceptionForm.action, exceptionForm.remark.trim());
    exceptionModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = ''; search.status = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="履约管理" subtitle="集采单的发货与配送跟踪">

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="单号 / 门店 / 供应商" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in DELIVERY_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="DELIVERY_STATUS_VARIANT[row.status]">{{ DELIVERY_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '处理异常', authCode: 'b2b:delivery:exception', hidden: row.status !== 'EXCEPTION', onClick: () => openException(row) },
          ]"
        />
        <span v-if="row.status !== 'EXCEPTION'" class="text-xs text-muted-foreground">-</span>
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="exceptionModal.visible.value"
      title="处理配送异常"
      :description="exceptionModal.data.value ? `配送单 ${exceptionModal.data.value.deliveryNo}` : ''"
      confirm-text="确认处理"
      :confirm-loading="submitting"
      :confirm-disabled="!exceptionForm.remark.trim()"
      @confirm="confirmException"
    >
      <div class="space-y-4 text-sm">
        <div v-if="exceptionModal.data.value?.exceptionReason" class="bg-destructive/5 border border-destructive/20 rounded-md p-3">
          <div class="text-xs text-destructive font-medium mb-1">异常原因</div>
          <div>{{ exceptionModal.data.value.exceptionReason }}</div>
        </div>
        <div class="space-y-2">
          <Label>处理方式 <span class="text-destructive">*</span></Label>
          <Select v-model="exceptionForm.action">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="retry">重新派单</SelectItem>
              <SelectItem value="cancel">取消配送</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>处理说明 <span class="text-destructive">*</span></Label>
          <Input v-model="exceptionForm.remark" placeholder="请输入处理说明" />
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
