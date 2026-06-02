<script setup lang="ts">
/**
 * 供应商 - 我的结算（应收）
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商结算
 * - 仅展示自己的结算单（应收金额按成本价聚合 * - 待确认：可点击「确认对账」→ CONFIRMED；CONFIRMED 等待平台付款
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商结算
 */
import { reactive, ref, onMounted } from 'vue';
import {
  Badge, Label, Card, CardContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { Wallet, CheckCircle2, CreditCard } from 'lucide-vue-next';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import { listSupplierSettlementsApi, confirmSupplierSettlementApi, getSupplierSettlementSummaryApi } from '/@/api/supplier/inventory';
import {
  SUPPLIER_SETTLEMENT_STATUS_LABEL, SUPPLIER_SETTLEMENT_STATUS_VARIANT, SUPPLIER_SETTLEMENT_STATUS_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatCurrency, formatDate, formatDateTime } from '/@/utils/format';
import type { SupplierSettlement } from '/#/b2b-supplier';


const search = reactive({ status: '' });
const [registerTable, { reload }] = useTable();
const submitting = ref(false);

async function loadData(params: any) {
  return await listSupplierSettlementsApi({ ...params, searchInfo: { ...search } });
}

const summary = reactive({ pendingAmount: 0, confirmedAmount: 0, paidAmount: 0 });
async function loadSummary() {
  const s = await getSupplierSettlementSummaryApi();
  Object.assign(summary, s);
}
onMounted(() => loadSummary());

const columns: BasicColumn[] = [
  { field: 'settlementNo', title: '结算单号', width: 160 },
  { field: 'periodFrom', title: '周期起', width: 110, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'periodTo', title: '周期起', width: 110, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'orderCount', title: '订单数', width: 80, align: 'right' },
  { field: 'amount', title: '应收金额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'generatedAt', title: '生成时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'paidAt', title: '到账时间', width: 160, formatter: ({ cellValue }) => (cellValue ? formatDateTime(cellValue) : '-') },
  { field: 'remark', title: '备注', minWidth: 120, showOverflow: 'tooltip' },
  { field: 'action', title: '操作', width: 120, fixed: 'right', slots: { default: 'action' } },
];

async function confirmSettle(row: SupplierSettlement) {
  submitting.value = true;
  try {
    await confirmSupplierSettlementApi(row.id);
    await Promise.all([reload(), loadSummary()]);
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.status = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="我的结算" subtitle="平台按周期生成应收账单；确认对账后等待付款">

    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 animate-fade-in-up">
      <Card>
        <CardContent class="p-5 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Wallet class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xs text-muted-foreground">待确认应收</div>
            <div class="text-xl font-bold tracking-tight mt-0.5">{{ formatCurrency(summary.pendingAmount) }}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xs text-muted-foreground">已确认未到账</div>
            <div class="text-xl font-bold tracking-tight mt-0.5">{{ formatCurrency(summary.confirmedAmount) }}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CreditCard class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xs text-muted-foreground">累计已到账</div>
            <div class="text-xl font-bold tracking-tight mt-0.5">{{ formatCurrency(summary.paidAmount) }}</div>
          </div>
        </CardContent>
      </Card>
    </section>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SUPPLIER_SETTLEMENT_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SUPPLIER_SETTLEMENT_STATUS_VARIANT[row.status]">{{ SUPPLIER_SETTLEMENT_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '确认对账', hidden: row.status !== 'PENDING', onClick: () => confirmSettle(row) },
          ]"
        />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
