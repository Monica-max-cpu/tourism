<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
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
import { listShipmentsApi, shipApi } from '/@/api/supplier/shipment';
import {
  SHIPMENT_STATUS_LABEL,
  SHIPMENT_STATUS_VARIANT,
  SHIPMENT_STATUS_OPTIONS,
  CARRIER_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatDateTime } from '/@/utils/format';
import type { ShipmentRecord } from '/#/b2b-supplier';

const router = useRouter();
const search = reactive({ deliveryNo: '', collectiveOrderId: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const query: any = { ...params };
  if (search.deliveryNo) query.deliveryNo = search.deliveryNo;
  if (search.collectiveOrderId) query.collectiveOrderId = search.collectiveOrderId;
  if (search.status !== '') query.status = Number(search.status);
  return await listShipmentsApi(query);
}

const columns: BasicColumn[] = [
  { field: 'deliveryNo', title: '发货单号', width: 160 },
  { field: 'collectiveOrderId', title: '集采单ID', width: 180, showOverflow: 'tooltip' },
  { field: 'collectiveItemId', title: '集采明细ID', width: 180, showOverflow: 'tooltip' },
  { field: 'storeId', title: '门店ID', width: 170, showOverflow: 'tooltip' },
  { field: 'productName', title: '商品', minWidth: 180, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'deliveryQty', title: '发货数量', width: 100, align: 'right' },
  { field: 'receivedQty', title: '收货数量', width: 100, align: 'right', formatter: ({ cellValue }) => cellValue ?? '-' },
  { field: 'logisticsCompany', title: '物流公司', width: 120, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'trackingNo', title: '物流单号', width: 160, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'status', title: '状态', width: 120, slots: { default: 'status' } },
  { field: 'shippedTime', title: '发货时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 150, fixed: 'right', slots: { default: 'action' } },
];

const shipModal = useModal<ShipmentRecord>();
const shipForm = reactive({ logisticsCompany: '顺丰速运', trackingNo: '', remark: '' });
const submitting = ref(false);
const shipValid = computed(() => !!shipForm.logisticsCompany && !!shipForm.trackingNo.trim());

function openDetail(row: ShipmentRecord) {
  router.push(`/b2b/supplier/shipments/${row.id}`);
}

function openShip(row: ShipmentRecord) {
  shipForm.logisticsCompany = row.logisticsCompany || '顺丰速运';
  shipForm.trackingNo = row.trackingNo || '';
  shipForm.remark = row.receiveRemark || '';
  shipModal.open(row);
}

async function confirmShip() {
  if (!shipValid.value || !shipModal.data.value) return;
  submitting.value = true;
  try {
    await shipApi({
      deliveryId: shipModal.data.value.id,
      logisticsCompany: shipForm.logisticsCompany,
      trackingNo: shipForm.trackingNo.trim(),
      remark: shipForm.remark.trim() || undefined,
    });
    shipModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  Object.assign(search, { deliveryNo: '', collectiveOrderId: '', status: '' });
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="发货管理" subtitle="处理后端生成的发货单任务，登记物流公司与物流单号">
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
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-36"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SHIPMENT_STATUS_OPTIONS" :key="String(o.value)" :value="String(o.value)">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SHIPMENT_STATUS_VARIANT[row.status] || 'warning'">
          {{ SHIPMENT_STATUS_LABEL[row.status] || '-' }}
        </Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '详情', onClick: () => openDetail(row) },
            { label: '发货', authCode: 'b2b:supplier:delivery', hidden: row.status !== 0, onClick: () => openShip(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="shipModal.visible.value"
      title="登记发货"
      :description="shipModal.data.value?.deliveryNo"
      :confirm-loading="submitting"
      :confirm-disabled="!shipValid"
      confirm-text="确认发货"
      width="520px"
      @confirm="confirmShip"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>物流公司 <span class="text-destructive">*</span></Label>
          <Select v-model="shipForm.logisticsCompany">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in CARRIER_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>物流单号 <span class="text-destructive">*</span></Label>
          <Input v-model="shipForm.trackingNo" placeholder="请输入物流单号" />
        </div>
        <div class="space-y-2">
          <Label>备注</Label>
          <Input v-model="shipForm.remark" placeholder="选填" />
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
