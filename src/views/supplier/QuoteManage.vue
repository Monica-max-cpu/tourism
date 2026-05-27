<script setup lang="ts">
/**
 * 供应商 - 报价管理
 * update-begin--author:claude---date:2026-05-27---for:【弹窗改页面】新建/编辑移入独立路由页面 QuoteForm
 * update-end--author:claude---date:2026-05-27---for:【弹窗改页面】新建/编辑移入独立路由页面 QuoteForm
 */
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import {
  listSupplierQuotesApi, offSupplierQuoteApi, resubmitSupplierQuoteApi,
} from '/@/api/supplier/quote';
import {
  SUPPLIER_QUOTE_STATUS_LABEL, SUPPLIER_QUOTE_STATUS_VARIANT, SUPPLIER_QUOTE_STATUS_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatCurrency, formatDate } from '/@/utils/format';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { useUserStore } from '/@/stores/modules/user';
import type { SupplierQuoteRecord } from '/#/b2b-supplier';

const router = useRouter();
const userStore = useUserStore();
const supplierId = computed(() => userStore.getUserInfo?.supplierId || '');

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  const res: any = await listSupplierQuotesApi({ ...params, supplierId: supplierId.value, ...search });
  const list = Array.isArray(res) ? res : (res.records || []);
  const records = list.map((item: any) => {
    const q = item.quote || item;
    return { ...q, tiers: item.tiers, status: q.status, productName: q.productName || '' };
  });
  return { records, total: records.length };
}

const columns: BasicColumn[] = [
  { field: 'productName', title: '商品名称', minWidth: 180 },
  { field: 'basePrice', title: '报价', width: 90, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'minOrderQty', title: '起订量', width: 90, align: 'center' },
  { field: 'minOrderQty', title: '档位', width: 90, align: 'center', formatter: ({ row }) => {
    return row.tiers && row.tiers.length > 0 ? `${row.tiers.length} 档` : '-';
  } },
  { field: 'tiers', title: '档位详情', width: 300, formatter: ({ row }) => {
    if (!row.tiers || row.tiers.length === 0) return `${row.minOrderQty}件起 ${formatCurrency(row.basePrice)}`;
    return row.tiers.map((t: any) => {
      const qty = t.maxQty != null ? `${t.minQty}~${t.maxQty}件` : `${t.minQty}件以上`;
      return `${qty}：${formatCurrency(t.unitPrice)}`;
    }).join('，');
  } },
  { field: 'leadTimeDays', title: '备货周期', width: 100, align: 'center' },
  { field: 'validFrom', title: '生效日期', width: 180, align: 'center', formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'validTo', title: '截止日期', width: 180, align: 'center', formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'status', title: '状态', width: 180, align: 'center', slots: { default: 'status' } },
  { field: 'action', title: '操作', width: 240, fixed: 'right', slots: { default: 'action' } },
];

function openCreate() {
  router.push(ROUTE_PATHS.SUPPLIER_QUOTE_CREATE);
}

function openEdit(row: SupplierQuoteRecord) {
  router.push({ path: `/supplier/quote/${row.id}/edit` });
}

async function offShelf(row: SupplierQuoteRecord) {
  const res: any = await offSupplierQuoteApi(row.id);
  if (res?.success === false) return;
  reload();
}
async function resubmit(row: SupplierQuoteRecord) {
  await resubmitSupplierQuoteApi(row.id);
  reload();
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.status = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="报价管理" subtitle="创建并维护您的商品报价（仅展示自有报价，提交后由平台审核）">

    <template #extra>
      <Button v-auth="'b2b:supplier:quote'" @click="openCreate">
        <Plus class="w-4 h-4 mr-1.5" />
        新建报价
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="商品名/ 报价编号" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SUPPLIER_QUOTE_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SUPPLIER_QUOTE_STATUS_VARIANT[row.status]">{{ SUPPLIER_QUOTE_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '编辑', authCode: 'b2b:supplier:quote', hidden: row.status !== 2 && row.status !== 3, onClick: () => openEdit(row) },
            { label: '撤回', authCode: 'b2b:supplier:quote', hidden: row.status !== 0, onClick: () => offShelf(row) },
            { label: '重新提交', authCode: 'b2b:supplier:quote', hidden: row.status !== 3 && row.status !== 2, onClick: () => resubmit(row) },
          ]"
        />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
