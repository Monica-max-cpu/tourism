<script setup lang="ts">
/**
 * 供应商 - 报价管理（创编辑/上下架）
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价管理
 * - 仅展示当前供应商的报价（supplierId 强制过滤 * - 仅展示成本价（自报价价），无销售价/毛利字段
 * - 新建/编辑保存后自动进入「待审核」流（PENDING），由阶2A QuoteReview 处理
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商报价管理
 */
import { reactive, ref, computed } from 'vue';
import { Plus } from 'lucide-vue-next';
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
  listSupplierQuotesApi, createSupplierQuoteApi, updateSupplierQuoteApi,
  offSupplierQuoteApi, resubmitSupplierQuoteApi, listSupplierProductsApi,
} from '/@/api/supplier/quote';
import {
  SUPPLIER_QUOTE_STATUS_LABEL, SUPPLIER_QUOTE_STATUS_VARIANT, SUPPLIER_QUOTE_STATUS_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatCurrency, formatDate } from '/@/utils/format';
import { useUserStore } from '/@/stores/modules/user';
import type { SupplierQuoteRecord, SupplierProduct } from '/#/b2b-supplier';

const userStore = useUserStore();
const supplierId = computed(() => userStore.getUserInfo?.supplierId || '');

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listSupplierQuotesApi({ ...params, searchInfo: { ...search, supplierId: supplierId.value } });
}

const columns: BasicColumn[] = [
  { field: 'quoteNo', title: '报价编号', width: 150 },
  { field: 'productName', title: '商品名称', minWidth: 180 },
  { field: 'productSku', title: 'SKU', width: 120 },
  { field: 'unit', title: '单位', width: 70 },
  { field: 'costPrice', title: '我的报价', width: 120, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'minQty', title: '起订量', width: 80, align: 'right' },
  { field: 'validTo', title: '有效期至', width: 110, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'action', title: '操作', width: 200, fixed: 'right', slots: { default: 'action' } },
];

// ====== 新建/编辑 ======
const editModal = useModal<SupplierQuoteRecord | null>();
const productOptions = ref<SupplierProduct[]>([]);
const submitting = ref(false);

const form = reactive({
  id: '',
  productId: '',
  productSku: '',
  productName: '',
  unit: '',
  costPrice: 0,
  validFrom: '2026-05-24',
  validTo: '2026-12-31',
  minQty: 10,
  remark: '',
});

const isEdit = computed(() => !!form.id);
const formValid = computed(() => !!form.productId && form.costPrice > 0 && !!form.validTo);

async function loadProductOptions() {
  const { records } = await listSupplierProductsApi({
    pageNo: 1, pageSize: 100,
    searchInfo: { supplierId: supplierId.value, status: 'ON_SHELF' },
  });
  productOptions.value = records;
}

function resetForm() {
  Object.assign(form, {
    id: '', productId: '', productSku: '', productName: '', unit: '',
    costPrice: 0, validFrom: '2026-05-24', validTo: '2026-12-31', minQty: 10, remark: '',
  });
}

async function openCreate() {
  resetForm();
  await loadProductOptions();
  editModal.open(null);
}

async function openEdit(row: SupplierQuoteRecord) {
  resetForm();
  await loadProductOptions();
  Object.assign(form, {
    id: row.id, productId: row.productId, productSku: row.productSku, productName: row.productName,
    unit: row.unit, costPrice: row.costPrice, validFrom: row.validFrom, validTo: row.validTo,
    minQty: row.minQty || 10, remark: row.remark || '',
  });
  editModal.open(row);
}

function onProductChange(v: string) {
  const p = productOptions.value.find((x) => x.id === v);
  if (p) {
    form.productId = p.id; form.productSku = p.productSku;
    form.productName = p.productName; form.unit = p.unit;
    if (!isEdit.value) form.costPrice = p.defaultCost;
  }
}

async function confirmSave() {
  if (!formValid.value) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateSupplierQuoteApi(form.id, {
        costPrice: form.costPrice, validFrom: form.validFrom, validTo: form.validTo,
        minQty: form.minQty, remark: form.remark,
      });
    } else {
      await createSupplierQuoteApi({
        productId: form.productId, productSku: form.productSku, productName: form.productName,
        unit: form.unit, costPrice: form.costPrice,
        validFrom: form.validFrom, validTo: form.validTo,
        minQty: form.minQty, remark: form.remark,
      });
    }
    editModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

async function offShelf(row: SupplierQuoteRecord) {
  await offSupplierQuoteApi(row.id);
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
            { label: '编辑', authCode: 'b2b:supplier:quote', hidden: row.status !== 'DRAFT' && row.status !== 'REJECTED' && row.status !== 'OFF', onClick: () => openEdit(row) },
            { label: '下架', authCode: 'b2b:supplier:quote', hidden: row.status !== 'APPROVED', onClick: () => offShelf(row) },
            { label: '重新提交', authCode: 'b2b:supplier:quote', hidden: row.status !== 'OFF' && row.status !== 'REJECTED' && row.status !== 'EXPIRED', onClick: () => resubmit(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="editModal.visible.value"
      :title="isEdit ? '编辑报价' : '新建报价'"
      description="保存后将进入平台审核流程"
      :confirm-loading="submitting"
      :confirm-disabled="!formValid"
      width="560px"
      @confirm="confirmSave"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2 space-y-1.5">
          <Label>关联商品 <span class="text-destructive">*</span></Label>
          <Select :model-value="form.productId" :disabled="isEdit" @update:model-value="onProductChange">
            <SelectTrigger><SelectValue placeholder="请选择商品" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="p in productOptions" :key="p.id" :value="p.id">{{ p.productName }} ({{ p.productSku }})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex items-center gap-2">
          <Label>我的报价（成本价/{{ form.unit || '单位' }}）<span class="text-destructive">*</span></Label>
          <Input v-model.number="form.costPrice" type="number" min="0" step="0.01" placeholder="0.00" />
        </div>
        <div class="flex items-center gap-2">
          <Label>起订量</Label>
          <Input v-model.number="form.minQty" type="number" min="1" placeholder="10" />
        </div>
        <div class="flex items-center gap-2">
          <Label>生效日期</Label>
          <Input v-model="form.validFrom" type="date" />
        </div>
        <div class="flex items-center gap-2">
          <Label>有效期至 <span class="text-destructive">*</span></Label>
          <Input v-model="form.validTo" type="date" />
        </div>
        <div class="col-span-2 space-y-1.5">
          <Label>备注</Label>
          <Input v-model="form.remark" placeholder="量大可议、品质承诺等" />
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
