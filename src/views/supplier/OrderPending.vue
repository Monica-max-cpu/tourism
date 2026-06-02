<script setup lang="ts">
/**
 * 供应商 - 待确认集采单
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商待确认订 * - 仅展status=TRIGGERED 的订单（bucket=pending * - 操作：确认接单（CONFIRMED/ 拒绝（→ CANCELLED 并写reason * - 仅展示成本价；不展示销售价/毛利
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商待确认订 */
import { reactive, ref } from 'vue';
import {
  Badge, Input, Label,
  Card, CardContent,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listSupplierOrdersApi, confirmSupplierOrderApi, rejectSupplierOrderApi, getSupplierOrderApi } from '/@/api/supplier/order';
import {
  SUPPLIER_ORDER_STATUS_LABEL, SUPPLIER_ORDER_STATUS_VARIANT,
} from '/@/constants/supplierStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { SupplierOrder } from '/#/b2b-supplier';


const search = reactive({ keyword: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listSupplierOrdersApi({
    ...params,
    searchInfo: { ...search, bucket: 'pending' },
  });
}

const columns: BasicColumn[] = [
  { field: 'collectiveNo', title: '集采单号', width: 150 },
  { field: 'storeOrderCount', title: '汇总门店订单', width: 120, align: 'right' },
  { field: 'itemCount', title: 'SKU 数', width: 80, align: 'right', formatter: ({ row }) => row.items?.length || 0 },
  { field: 'purchaseAmount', title: '应收金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'triggeredAt', title: '下达时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'remark', title: '备注', minWidth: 140, showOverflow: 'tooltip' },
  { field: 'action', title: '操作', width: 220, fixed: 'right', slots: { default: 'action' } },
];

// ====== 详情 ======
const detailModal = useModal<SupplierOrder | null>();
async function openDetail(row: SupplierOrder) {
  const detail = (await getSupplierOrderApi(row.id)) || row;
  detailModal.open(detail);
}

// ====== 拒绝 ======
const rejectModal = useModal<SupplierOrder>();
const rejectReason = ref('');
const submitting = ref(false);

async function confirmOrder(row: SupplierOrder) {
  submitting.value = true;
  try {
    await confirmSupplierOrderApi(row.id);
    reload();
  } finally {
    submitting.value = false;
  }
}
function openReject(row: SupplierOrder) { rejectReason.value = ''; rejectModal.open(row); }
async function confirmReject() {
  if (!rejectReason.value.trim() || !rejectModal.data.value) return;
  submitting.value = true;
  try {
    await rejectSupplierOrderApi(rejectModal.data.value.id, rejectReason.value.trim());
    rejectModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="待确认集采单" subtitle="平台已触发的集采订单，请尽快确认或拒绝">

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">集采单号</Label>
        <Input v-model="search.keyword" placeholder="例如 CO20260500" class="w-60" @keyup.enter="onSearch" />
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
            { label: '确认接单', authCode: 'b2b:supplier:delivery', onClick: () => confirmOrder(row) },
            { label: '拒绝', authCode: 'b2b:supplier:delivery', variant: 'destructive', onClick: () => openReject(row) },
          ]"
        />
      </template>
    </BasicTable>

    <!-- 详情 -->
    <BasicModal
      v-model:open="detailModal.visible.value"
      title="集采单明细"
      :description="detailModal.data.value?.collectiveNo"
      hide-footer
      width="640px"
    >
      <div v-if="detailModal.data.value" class="space-y-3">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-muted-foreground">汇总门店订单：</span>{{ detailModal.data.value.storeOrderCount }}</div>
          <div><span class="text-muted-foreground">应收金额：</span>{{ formatCurrency(detailModal.data.value.purchaseAmount) }}</div>
          <div><span class="text-muted-foreground">下达时间：</span>{{ formatDateTime(detailModal.data.value.triggeredAt) }}</div>
          <div><span class="text-muted-foreground">备注：</span>{{ detailModal.data.value.remark || '-' }}</div>
        </div>
        <Card>
          <CardContent class="p-0">
            <table class="w-full text-sm">
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
          </CardContent>
        </Card>
      </div>
    </BasicModal>

    <!-- 拒绝 -->
    <BasicModal
      v-model:open="rejectModal.visible.value"
      title="拒绝集采单"
      :description="rejectModal.data.value?.collectiveNo"
      confirm-text="确认拒绝"
      confirm-variant="destructive"
      :confirm-loading="submitting"
      :confirm-disabled="!rejectReason.trim()"
      @confirm="confirmReject"
    >
      <div class="space-y-2">
        <Label>拒绝原因 <span class="text-destructive">*</span></Label>
        <Input v-model="rejectReason" placeholder="如：库存不足、价格变动等" />
      </div>
    </BasicModal>
  </PageWrapper>
</template>
