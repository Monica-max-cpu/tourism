<script setup lang="ts">
/**
 * 平台管理员 - 门店采购订单
 * 仅展示销售价（门店端价格），不显示成利润
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
import { listStoreOrdersApi, getStoreOrderApi, cancelStoreOrderApi } from '/@/api/admin/operations';
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT, ORDER_STATUS_OPTIONS } from '/@/constants/b2b2bStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { OrderStatus, StoreOrder } from '/#/b2b-2b';

const search = reactive({ keyword: '', orderStatus: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const si: any = {};
  if (search.keyword) si.keyword = search.keyword;
  if (search.orderStatus !== '') si.orderStatus = Number(search.orderStatus);
  return await listStoreOrdersApi({ ...params, searchInfo: si });
}

const columns: BasicColumn[] = [
  { field: 'orderNo', title: '订单号', width: 160 },
  { field: 'storeName', title: '下单门店', minWidth: 180 },
  { field: 'itemCount', title: '商品种类', width: 90, align: 'right' },
  { field: 'totalAmount', title: '订单金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'orderStatus', title: '状态', width: 120, slots: { default: 'status' } },
  { field: 'createdAt', title: '下单时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'paidAt', title: '支付时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'collectiveOrderId', title: '集采单号', width: 130 },
  { field: 'action', title: '操作', width: 160, fixed: 'right', slots: { default: 'action' } },
];

function orderStatusLabel(status: OrderStatus, fallback?: string) {
  return fallback || ORDER_STATUS_LABEL[status] || '-';
}

function orderStatusVariant(status: OrderStatus) {
  return ORDER_STATUS_VARIANT[status] || 'warning';
}

const detailModal = useModal<StoreOrder>();
const cancelModal = useModal<StoreOrder>();
const cancelReason = ref('');
const submitting = ref(false);

async function openDetail(row: StoreOrder) {
  detailModal.open(row);
  const fresh = await getStoreOrderApi(row.id);
  if (fresh) detailModal.data.value = fresh;
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
    detailModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = ''; search.orderStatus = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="门店采购订单" subtitle="管理所有门店发起的采购订单">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="订单号 / 门店名称" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.orderStatus">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in ORDER_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="orderStatusVariant(row.orderStatus)">{{ orderStatusLabel(row.orderStatus, row.statusLabel) }}</Badge>
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
      v-model:open="detailModal.visible.value"
      title="订单详情"
      width="780px"
      hide-footer
    >
      <div v-if="detailModal.data.value" class="space-y-4 text-sm">
        <div class="grid grid-cols-3 gap-x-6 gap-y-3 pb-4 border-b border-border">
          <div><span class="text-muted-foreground">订单号：</span><span class="font-mono">{{ detailModal.data.value.orderNo }}</span></div>
          <div>
            <span class="text-muted-foreground">状态：</span>
            <Badge :variant="orderStatusVariant(detailModal.data.value.orderStatus)">{{ orderStatusLabel(detailModal.data.value.orderStatus, detailModal.data.value.statusLabel) }}</Badge>
          </div>
          <div><span class="text-muted-foreground">门店：</span>{{ detailModal.data.value.storeName }}</div>
          <div><span class="text-muted-foreground">下单时间：</span>{{ formatDateTime(detailModal.data.value.createdAt) }}</div>
          <div><span class="text-muted-foreground">支付时间：</span>{{ formatDateTime(detailModal.data.value.paidAt) || '-' }}</div>
          <div><span class="text-muted-foreground">集采单：</span>{{ detailModal.data.value.collectiveOrderId || '-' }}</div>
        </div>

        <div>
          <h4 class="font-medium mb-2">商品明细</h4>
          <div class="border border-border rounded-md overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-muted/50">
                <tr class="text-left">
                  <th class="px-3 py-2 font-medium text-muted-foreground">SKU</th>
                  <th class="px-3 py-2 font-medium text-muted-foreground">商品名称</th>
                  <th class="px-3 py-2 font-medium text-muted-foreground text-right">单价</th>
                  <th class="px-3 py-2 font-medium text-muted-foreground text-right">数量</th>
                  <th class="px-3 py-2 font-medium text-muted-foreground text-right">小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, idx) in detailModal.data.value.items" :key="idx" class="border-t border-border">
                  <td class="px-3 py-2 font-mono text-xs">{{ it.productSku }}</td>
                  <td class="px-3 py-2">{{ it.productName }}</td>
                  <td class="px-3 py-2 text-right">{{ formatCurrency(it.unitPrice) }}</td>
                  <td class="px-3 py-2 text-right">{{ it.qty }} {{ it.unit }}</td>
                  <td class="px-3 py-2 text-right font-medium">{{ formatCurrency(it.subtotal) }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-muted/30 border-t border-border">
                <tr>
                  <td colspan="4" class="px-3 py-2 text-right text-muted-foreground">订单合计</td>
                  <td class="px-3 py-2 text-right font-semibold text-base">{{ formatCurrency(detailModal.data.value.totalAmount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div v-if="detailModal.data.value.remark" class="text-xs text-muted-foreground">备注：{{ detailModal.data.value.remark }}</div>

        <div v-if="detailModal.data.value.orderStatus === 0" class="flex justify-end pt-3 border-t border-border">
          <Button variant="destructive" :disabled="submitting" @click="openCancel(detailModal.data.value)">取消订单</Button>
        </div>
      </div>
    </BasicModal>

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
