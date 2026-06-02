<script setup lang="ts">
/**
 * 平台管理员 - 集采单列表 */
import { reactive } from 'vue';
import {
  Badge, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listCollectiveOrdersApi, getCollectiveOrderApi } from '/@/api/admin/fulfillment';
import { COLLECTIVE_STATUS_LABEL, COLLECTIVE_STATUS_VARIANT, COLLECTIVE_STATUS_OPTIONS } from '/@/constants/b2b2cStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { CollectiveOrder } from '/#/b2b-2c';

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listCollectiveOrdersApi({ ...params, searchInfo: { ...search } });
}

const columns: BasicColumn[] = [
  { field: 'collectiveNo', title: '集采单号', width: 160 },
  { field: 'supplierName', title: '供应商', minWidth: 200 },
  { field: 'storeOrderCount', title: '关联门店订单', width: 120, align: 'right', formatter: ({ cellValue }) => `${cellValue} 笔` },
  { field: 'purchaseAmount', title: '采购金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue), authCode: 'b2b:settlement:profitList' },
  { field: 'saleAmount', title: '销售金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'profit', title: '毛利', width: 130, align: 'right', slots: { default: 'profit' }, authCode: 'b2b:settlement:profitList' },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'triggeredAt', title: '触发时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 100, fixed: 'right', slots: { default: 'action' } },
];

const detailModal = useModal<CollectiveOrder>();

async function openDetail(row: CollectiveOrder) {
  detailModal.open(row);
  const fresh = await getCollectiveOrderApi(row.id);
  if (fresh) detailModal.data.value = fresh;
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = ''; search.status = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="集采单列表" subtitle="平台向供应商发出的所有集采订单">

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="集采单号 / 供应商" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in COLLECTIVE_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="COLLECTIVE_STATUS_VARIANT[row.status]">{{ COLLECTIVE_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #profit="{ row }">
        <span class="text-[hsl(var(--status-success))] font-medium">{{ formatCurrency(row.profit) }}</span>
      </template>
      <template #action="{ row }">
        <TableAction :actions="[{ label: '详情', onClick: () => openDetail(row) }]" />
      </template>
    </BasicTable>

    <BasicModal v-model:open="detailModal.visible.value" title="集采单详情" width="780px" hide-footer>
      <div v-if="detailModal.data.value" class="space-y-4 text-sm">
        <div class="grid grid-cols-3 gap-x-6 gap-y-3 pb-4 border-b border-border">
          <div><span class="text-muted-foreground">集采单号：</span><span class="font-mono">{{ detailModal.data.value.collectiveNo }}</span></div>
          <div>
            <span class="text-muted-foreground">状态：</span>
            <Badge :variant="COLLECTIVE_STATUS_VARIANT[detailModal.data.value.status]">{{ COLLECTIVE_STATUS_LABEL[detailModal.data.value.status] }}</Badge>
          </div>
          <div><span class="text-muted-foreground">供应商：</span>{{ detailModal.data.value.supplierName }}</div>
          <div><span class="text-muted-foreground">关联门店订单：</span>{{ detailModal.data.value.storeOrderCount }} 笔</div>
          <div><span class="text-muted-foreground">触发时间：</span>{{ formatDateTime(detailModal.data.value.triggeredAt) }}</div>
          <div><span class="text-muted-foreground">完成时间：</span>{{ formatDateTime(detailModal.data.value.completedAt) || '-' }}</div>
        </div>

        <div>
          <h4 class="font-medium mb-2">商品明细（成本价）</h4>
          <div class="border border-border rounded-md overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-muted/50">
                <tr class="text-left">
                  <th class="px-3 py-2 font-medium text-muted-foreground">SKU</th>
                  <th class="px-3 py-2 font-medium text-muted-foreground">商品名称</th>
                  <th class="px-3 py-2 font-medium text-muted-foreground text-right">成本价</th>
                  <th class="px-3 py-2 font-medium text-muted-foreground text-right">数量</th>
                  <th class="px-3 py-2 font-medium text-muted-foreground text-right">小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, idx) in detailModal.data.value.items" :key="idx" class="border-t border-border">
                  <td class="px-3 py-2 font-mono text-xs">{{ it.productSku }}</td>
                  <td class="px-3 py-2">{{ it.productName }}</td>
                  <td class="px-3 py-2 text-right">{{ formatCurrency(it.costPrice) }}</td>
                  <td class="px-3 py-2 text-right">{{ it.qty }} {{ it.unit }}</td>
                  <td class="px-3 py-2 text-right font-medium">{{ formatCurrency(it.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-auth="'b2b:settlement:profitList'" class="grid grid-cols-3 gap-4 bg-muted/30 rounded-md p-4">
          <div>
            <div class="text-xs text-muted-foreground">采购金额</div>
            <div class="text-lg font-semibold mt-1">{{ formatCurrency(detailModal.data.value.purchaseAmount) }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">销售金额</div>
            <div class="text-lg font-semibold mt-1">{{ formatCurrency(detailModal.data.value.saleAmount) }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">毛利</div>
            <div class="text-lg font-semibold mt-1 text-[hsl(var(--status-success))]">{{ formatCurrency(detailModal.data.value.profit) }}</div>
          </div>
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
