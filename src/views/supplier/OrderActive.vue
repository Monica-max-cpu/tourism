<script setup lang="ts">
/**
 * 供应商 - 进行中集采单
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商进行中订 * - 展示 CONFIRMED / SHIPPING / COMPLETED / CANCELLED（bucket=active * - 发货操作：CONFIRMED SHIPPING，写carrier/trackingNo
 * - 仅展示成本价
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商进行中订 */
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
import { listSupplierOrdersApi, shipSupplierOrderApi, getSupplierOrderApi } from '/@/api/supplier/order';
import {
  SUPPLIER_ORDER_STATUS_LABEL, SUPPLIER_ORDER_STATUS_VARIANT, SUPPLIER_ORDER_STATUS_OPTIONS,
  CARRIER_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import { useUserStore } from '/@/stores/modules/user';
import type { SupplierOrder } from '/#/b2b-supplier';

const userStore = useUserStore();
const supplierId = computed(() => userStore.getUserInfo?.supplierId || '');

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listSupplierOrdersApi({
    ...params,
    searchInfo: { ...search, supplierId: supplierId.value, bucket: 'active' },
  });
}

const columns: BasicColumn[] = [
  { field: 'collectiveNo', title: '集采单号', width: 150 },
  { field: 'storeOrderCount', title: '汇总门店订单', width: 120, align: 'right' },
  { field: 'purchaseAmount', title: '应收金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'carrier', title: '承运方', width: 110, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'trackingNo', title: '运单号', width: 160, formatter: ({ cellValue }) => cellValue || '-' },
  { field: 'confirmedAt', title: '确认时间', width: 160, formatter: ({ cellValue }) => (cellValue ? formatDateTime(cellValue) : '-') },
  { field: 'shippedAt', title: '发货时间', width: 160, formatter: ({ cellValue }) => (cellValue ? formatDateTime(cellValue) : '-') },
  { field: 'action', title: '操作', width: 160, fixed: 'right', slots: { default: 'action' } },
];

// ====== 发货 ======
const shipModal = useModal<SupplierOrder>();
const shipForm = reactive({ carrier: '顺丰速运', trackingNo: '', remark: '' });
const submitting = ref(false);
const shipFormValid = computed(() => !!shipForm.carrier && !!shipForm.trackingNo.trim());

function openShip(row: SupplierOrder) {
  shipForm.carrier = '顺丰速运'; shipForm.trackingNo = ''; shipForm.remark = '';
  shipModal.open(row);
}

async function confirmShip() {
  if (!shipFormValid.value || !shipModal.data.value) return;
  submitting.value = true;
  try {
    await shipSupplierOrderApi({
      collectiveOrderId: shipModal.data.value.id,
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

// ====== 详情 ======
const detailModal = useModal<SupplierOrder | null>();
async function openDetail(row: SupplierOrder) {
  const detail = (await getSupplierOrderApi(row.id)) || row;
  detailModal.open(detail);
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.status = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="进行中集采单" subtitle="您已确认的集采订单，及时安排发货">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">集采单号</Label>
        <Input v-model="search.keyword" placeholder="例如 CO20260500" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SUPPLIER_ORDER_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SUPPLIER_ORDER_STATUS_VARIANT[row.status]">{{ SUPPLIER_ORDER_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '查看明细', onClick: () => openDetail(row) },
            { label: '发货', authCode: 'b2b:supplier:delivery', hidden: row.status !== 'CONFIRMED', onClick: () => openShip(row) },
          ]"
        />
      </template>
    </BasicTable>

    <!-- 发货 -->
    <BasicModal
      v-model:open="shipModal.visible.value"
      title="登记发货"
      :description="shipModal.data.value?.collectiveNo"
      :confirm-loading="submitting"
      :confirm-disabled="!shipFormValid"
      width="520px"
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
          <Input v-model="shipForm.trackingNo" placeholder="请输入物流运单号" />
        </div>
        <div class="flex items-center gap-2">
          <Label>备注</Label>
          <Input v-model="shipForm.remark" placeholder="选填" />
        </div>
      </div>
    </BasicModal>

    <!-- 详情 -->
    <BasicModal
      v-model:open="detailModal.visible.value"
      title="集采单明细"
      :description="detailModal.data.value?.collectiveNo"
      hide-footer
      width="640px"
    >
      <div v-if="detailModal.data.value" class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div><span class="text-muted-foreground">汇总门店订单：</span>{{ detailModal.data.value.storeOrderCount }}</div>
          <div><span class="text-muted-foreground">应收金额：</span>{{ formatCurrency(detailModal.data.value.purchaseAmount) }}</div>
          <div><span class="text-muted-foreground">承运商：</span>{{ detailModal.data.value.carrier || '-' }}</div>
          <div><span class="text-muted-foreground">运单号：</span>{{ detailModal.data.value.trackingNo || '-' }}</div>
        </div>
        <table class="w-full border border-border rounded-md overflow-hidden">
          <thead class="bg-muted text-muted-foreground">
            <tr>
              <th class="text-left px-3 py-2 font-normal">SKU</th>
              <th class="text-left px-3 py-2 font-normal">商品</th>
              <th class="text-right px-3 py-2 font-normal">数量</th>
              <th class="text-right px-3 py-2 font-normal">单价</th>
              <th class="text-right px-3 py-2 font-normal">小计</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="it in detailModal.data.value.items" :key="it.productSku" class="border-t border-border">
              <td class="px-3 py-2">{{ it.productSku }}</td>
              <td class="px-3 py-2">{{ it.productName }} / {{ it.unit }}</td>
              <td class="px-3 py-2 text-right">{{ it.qty }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(it.costPrice) }}</td>
              <td class="px-3 py-2 text-right">{{ formatCurrency(it.subtotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
