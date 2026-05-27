<script setup lang="ts">
/**
 * 平台管理员 - 供应商报价审核 */
import { reactive, ref } from 'vue';
import { CheckCheck } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import {
  listQuotesApi, approveQuoteApi, batchApproveQuotesApi, rejectQuoteApi, withdrawApprovedQuoteApi,
} from '/@/api/admin';
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_VARIANT, QUOTE_STATUS_OPTIONS } from '/@/constants/b2bStatus';
import { formatCurrency, formatDate } from '/@/utils/format';
import type { SupplierQuote, QuoteStatus } from '/#/b2b';

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload, getSelected, clearSelection }] = useTable();
const selectedCount = ref(0);

async function loadData(params: any) {
  const res: any = await listQuotesApi({ ...params, ...search });

  // 真实后端返回扁平数组 [{ tiers, quote }]，需要拆平为 { records, total }
  if (Array.isArray(res)) {
    const records = res.map((item: any) => ({
      ...(item.quote || item),
      tiers: item.tiers,
      supplierName: item.quote?.supplierName || '',
      productName: item.quote?.productName || '',
    }));
    return { records, total: records.length };
  }

  // Mock 返回 { records, total }
  return res;
}

const columns: BasicColumn[] = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  // { field: 'id', title: '报价ID', width: 200 },
  { field: 'supplierName', title: '供应商', width: 160 },
  { field: 'productName', title: '商品名称', width: 200 },
   { field: 'minOrderQty', title: '起订量', width: 100, align: 'center' },
  { field: 'basePrice', title: '报价', width: 90, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'minOrderQty', title: '档位', width: 100, align: 'center', formatter: ({ row }) => {
    return row.tiers && row.tiers.length > 0 ? `${row.tiers.length} 档` : '-';
  } },
  { field: 'tiers', title: '档位详情', width: 280, formatter: ({ row }) => {
    if (!row.tiers || row.tiers.length === 0) return `${row.minOrderQty}件起 ${formatCurrency(row.basePrice)}`;
    return row.tiers.map((t: any) => {
      const qty = t.maxQty != null ? `${t.minQty}~${t.maxQty}件` : `${t.minQty}件以上`;
      return `${qty}：${formatCurrency(t.unitPrice)}`;
    }).join('，');
  } },
  { field: 'validFrom', title: '生效日期', width: 120, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'validTo', title: '截止日期', width: 120, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'leadTimeDays', title: '备货天数', width: 100, align: 'center' },
  { field: 'status', title: '状态', width: 180, slots: { default: 'status' } },
  { field: 'action', title: '操作', width: 220, fixed: 'right', slots: { default: 'action' } },
];

const rejectModal = useModal<SupplierQuote>();
const rejectReason = ref('');
const submitting = ref(false);
const batchModal = useModal<{ ids: string[]; count: number }>();

async function approve(row: SupplierQuote) {
  submitting.value = true;
  try {
    await approveQuoteApi(row.id);
    reload();
  } finally {
    submitting.value = false;
  }
}

function openReject(row: SupplierQuote) {
  rejectReason.value = '';
  rejectModal.open(row);
}

async function confirmReject() {
  if (!rejectReason.value.trim() || !rejectModal.data.value) return;
  submitting.value = true;
  try {
    await rejectQuoteApi(rejectModal.data.value.id, rejectReason.value.trim());
    rejectModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

async function withdrawApproved(row: SupplierQuote) {
  submitting.value = true;
  try {
    const res: any = await withdrawApprovedQuoteApi(row.id);
    if (res?.success === false) return;
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSelectionChange(rows: SupplierQuote[]) {
  selectedCount.value = rows.length;
}

function openBatchApprove() {
  const rows = getSelected() as SupplierQuote[];
  const pendings = rows.filter((r) => r.status === 0);
  if (pendings.length === 0) return;
  batchModal.open({ ids: pendings.map((r) => r.id), count: pendings.length });
}

async function confirmBatch() {
  if (!batchModal.data.value) return;
  submitting.value = true;
  try {
    await batchApproveQuotesApi(batchModal.data.value.ids);
    batchModal.close();
    clearSelection();
    selectedCount.value = 0;
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
  <PageWrapper title="供应商报价审核" subtitle="审核供应商提交的商品报价（仅管理员可见成本价）">

    <template #extra>
      <Button v-auth="'b2b:quote:review'" :disabled="selectedCount === 0" @click="openBatchApprove">
        <CheckCheck class="w-4 h-4 mr-1.5" />
        批量通过 <span v-if="selectedCount > 0" class="ml-1">({{ selectedCount }})</span>
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="商品 / 供应商名 / 编号" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in QUOTE_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable
      :columns="columns" :api="loadData" row-key="id"
      row-selection="checkbox"
      @register="registerTable"
      @selection-change="onSelectionChange"
    >
      <template #status="{ row }">
        <Badge :variant="QUOTE_STATUS_VARIANT[row.status as QuoteStatus]">{{ QUOTE_STATUS_LABEL[row.status as QuoteStatus] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '通过', authCode: 'b2b:quote:review', hidden: row.status !== 0, onClick: () => approve(row) },
            { label: '驳回', authCode: 'b2b:quote:review', hidden: row.status !== 0, onClick: () => openReject(row) },
            { label: '撤回', authCode: 'b2b:quote:review', hidden: row.status !== 1, onClick: () => withdrawApproved(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="rejectModal.visible.value"
      title="驳回报价"
      :description="rejectModal.data.value ? `${rejectModal.data.value.supplierName} - ${rejectModal.data.value.productName}` : ''"
      confirm-text="确认驳回" confirm-variant="destructive"
      :confirm-loading="submitting"
      :confirm-disabled="!rejectReason.trim()"
      @confirm="confirmReject"
    >
      <div class="space-y-2">
        <Label>驳回原因 <span class="text-destructive">*</span></Label>
        <Input v-model="rejectReason" placeholder="请输入驳回原因" />
      </div>
    </BasicModal>

    <BasicModal
      v-model:open="batchModal.visible.value"
      title="批量通过报价"
      :description="`将通过 ${batchModal.data.value?.count || 0} 条待审核报价，操作后将立即生效`"
      confirm-text="确认批量通过"
      :confirm-loading="submitting"
      @confirm="confirmBatch"
    />
  </PageWrapper>
</template>
