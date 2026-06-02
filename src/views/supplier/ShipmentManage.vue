<script setup lang="ts">
/**
 * 供应商 - 发货管理
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商发货
 * - 列出本供应商所有发货任 * - 待发货：登记承运运单号；已发货：可更新运 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商发货
 */
import { reactive, ref, computed } from 'vue';
import {
  Badge, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listShipmentsApi, shipApi, updateTrackingApi } from '/@/api/supplier/shipment';
import {
  SHIPMENT_STATUS_LABEL, SHIPMENT_STATUS_VARIANT, SHIPMENT_STATUS_OPTIONS, CARRIER_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatDateTime } from '/@/utils/format';
import type { ShipmentRecord } from '/#/b2b-supplier';


const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listShipmentsApi({ ...params, searchInfo: { ...search } });
}

const columns: BasicColumn[] = [
  { field: 'shipmentNo', title: '发货单号', width: 150 },
  { field: 'collectiveNo', title: '关联集采单', width: 150 },
  { field: 'productSummary', title: '商品', minWidth: 180, showOverflow: 'tooltip' },
  { field: 'totalQty', title: '总数量', width: 90, align: 'right' },
  { field: 'carrier', title: '承运方', width: 110, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'trackingNo', title: '运单号', width: 160, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'status', title: '状态', width: 90, slots: { default: 'status' } },
  { field: 'shippedAt', title: '发货时间', width: 160, formatter: ({ cellValue }) => (cellValue ? formatDateTime(cellValue) : '-') },
  { field: 'exceptionReason', title: '异常说明', minWidth: 140, showOverflow: 'tooltip' },
  { field: 'action', title: '操作', width: 140, fixed: 'right', slots: { default: 'action' } },
];

// ====== 发货登记 ======
const shipModal = useModal<ShipmentRecord>();
const shipForm = reactive({ carrier: '顺丰速运', trackingNo: '', remark: '' });
const submitting = ref(false);
const shipValid = computed(() => !!shipForm.carrier && !!shipForm.trackingNo.trim());

function openShip(row: ShipmentRecord) {
  shipForm.carrier = row.carrier || '顺丰速运';
  shipForm.trackingNo = row.trackingNo || '';
  shipForm.remark = '';
  shipModal.open(row);
}

async function confirmShip() {
  if (!shipValid.value || !shipModal.data.value) return;
  submitting.value = true;
  try {
    await shipApi({
      collectiveOrderId: shipModal.data.value.collectiveOrderId,
      carrier: shipForm.carrier,
      trackingNo: shipForm.trackingNo.trim(),
      remark: shipForm.remark.trim() || undefined,
    });
    shipModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

// ====== 更新运单 ======
const trackModal = useModal<ShipmentRecord>();
const trackForm = reactive({ carrier: '', trackingNo: '' });
const trackValid = computed(() => !!trackForm.carrier && !!trackForm.trackingNo.trim());

function openTrack(row: ShipmentRecord) {
  trackForm.carrier = row.carrier || '顺丰速运';
  trackForm.trackingNo = row.trackingNo || '';
  trackModal.open(row);
}

async function confirmTrack() {
  if (!trackValid.value || !trackModal.data.value) return;
  submitting.value = true;
  try {
    await updateTrackingApi(trackModal.data.value.id, trackForm.carrier, trackForm.trackingNo.trim());
    trackModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.status = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="发货管理" subtitle="登记发货信息；已发货任务可更新物流运单号">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="发货单号 / 集采单号 / 运单号" class="w-72" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SHIPMENT_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SHIPMENT_STATUS_VARIANT[row.status]">{{ SHIPMENT_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '发货', authCode: 'b2b:supplier:delivery', hidden: row.status !== 'PENDING', onClick: () => openShip(row) },
            { label: '更新运单', authCode: 'b2b:supplier:delivery', hidden: row.status === 'PENDING' || row.status === 'DELIVERED', onClick: () => openTrack(row) },
          ]"
        />
      </template>
    </BasicTable>

    <!-- 发货 -->
    <BasicModal
      v-model:open="shipModal.visible.value"
      title="登记发货"
      :description="shipModal.data.value?.shipmentNo"
      :confirm-loading="submitting"
      :confirm-disabled="!shipValid"
      @confirm="confirmShip"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Label>承运方<span class="text-destructive">*</span></Label>
          <Select v-model="shipForm.carrier">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in CARRIER_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex items-center gap-2">
          <Label>运单号<span class="text-destructive">*</span></Label>
          <Input v-model="shipForm.trackingNo" placeholder="请输入运单号" />
        </div>
        <div class="flex items-center gap-2">
          <Label>备注</Label>
          <Input v-model="shipForm.remark" placeholder="选填" />
        </div>
      </div>
    </BasicModal>

    <!-- 更新运单 -->
    <BasicModal
      v-model:open="trackModal.visible.value"
      title="更新运单"
      :description="trackModal.data.value?.shipmentNo"
      :confirm-loading="submitting"
      :confirm-disabled="!trackValid"
      @confirm="confirmTrack"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Label>承运方<span class="text-destructive">*</span></Label>
          <Select v-model="trackForm.carrier">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in CARRIER_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex items-center gap-2">
          <Label>运单号<span class="text-destructive">*</span></Label>
          <Input v-model="trackForm.trackingNo" placeholder="请输入运单号" />
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
