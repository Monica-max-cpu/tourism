<script setup lang="ts">
/**
 * 供应- 自营商品名 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商自营商品
 * - 维护本供应商SKU 主数据，作为新建报价时的来源
 * - 草稿/上架/下架三态切 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商自营商品
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
import { listSupplierProductsApi, saveSupplierProductApi, toggleSupplierProductShelfApi } from '/@/api/supplier/quote';
import {
  SUPPLIER_PRODUCT_STATUS_LABEL, SUPPLIER_PRODUCT_STATUS_VARIANT, SUPPLIER_PRODUCT_STATUS_OPTIONS,
} from '/@/constants/supplierStatus';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import { useUserStore } from '/@/stores/modules/user';
import type { SupplierProduct } from '/#/b2b-supplier';

const userStore = useUserStore();
const supplierId = computed(() => userStore.getUserInfo?.supplierId || '');

const search = reactive({ keyword: '', status: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listSupplierProductsApi({ ...params, searchInfo: { ...search, supplierId: supplierId.value } });
}

const columns: BasicColumn[] = [
  { field: 'productSku', title: 'SKU', width: 130 },
  { field: 'productName', title: '商品名称', minWidth: 180 },
  { field: 'category', title: '品类', width: 100 },
  { field: 'unit', title: '单位', width: 70 },
  { field: 'defaultCost', title: '默认成本价', width: 120, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'status', title: '状态', width: 100, slots: { default: 'status' } },
  { field: 'updatedAt', title: '更新时间', width: 160, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 180, fixed: 'right', slots: { default: 'action' } },
];

const editModal = useModal<SupplierProduct | null>();
const submitting = ref(false);
const form = reactive({
  id: '', productSku: '', productName: '', category: '', unit: '个', defaultCost: 0, description: '',
});
const isEdit = computed(() => !!form.id);
const formValid = computed(() => !!form.productSku && !!form.productName && !!form.category && form.defaultCost > 0);

const CATEGORY_OPTIONS = ['生鲜', '乳制品', '调味料', '饮品', '海鲜', '菌菇', '水果', '冻品'];
const UNIT_OPTIONS = ['个', '斤', '箱', '克', '升'];

function resetForm() {
  Object.assign(form, { id: '', productSku: '', productName: '', category: '', unit: '个', defaultCost: 0, description: '' });
}
function openCreate() { resetForm(); editModal.open(null); }
function openEdit(row: SupplierProduct) {
  resetForm();
  Object.assign(form, {
    id: row.id, productSku: row.productSku, productName: row.productName,
    category: row.category, unit: row.unit, defaultCost: row.defaultCost, description: row.description || '',
  });
  editModal.open(row);
}

async function confirmSave() {
  if (!formValid.value) return;
  submitting.value = true;
  try {
    await saveSupplierProductApi({ ...form });
    editModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

async function onShelf(row: SupplierProduct) {
  await toggleSupplierProductShelfApi(row.id, 'ON_SHELF');
  reload();
}
async function offShelf(row: SupplierProduct) {
  await toggleSupplierProductShelfApi(row.id, 'OFF_SHELF');
  reload();
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.keyword = ''; search.status = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="商品库" subtitle="维护您的自营 SKU；上架商品才能创建报价">

    <template #extra>
      <Button v-auth="'b2b:supplier:product'" @click="openCreate">
        <Plus class="w-4 h-4 mr-1.5" />
        新建商品
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="名称 / SKU" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in SUPPLIER_PRODUCT_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="SUPPLIER_PRODUCT_STATUS_VARIANT[row.status]">{{ SUPPLIER_PRODUCT_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '编辑', authCode: 'b2b:supplier:product', onClick: () => openEdit(row) },
            { label: '上架', authCode: 'b2b:supplier:product', hidden: row.status === 'ON_SHELF', onClick: () => onShelf(row) },
            { label: '下架', authCode: 'b2b:supplier:product', hidden: row.status !== 'ON_SHELF', onClick: () => offShelf(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="editModal.visible.value"
      :title="isEdit ? '编辑商品' : '新建商品'"
      :confirm-loading="submitting"
      :confirm-disabled="!formValid"
      width="560px"
      @confirm="confirmSave"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-2">
          <Label>SKU <span class="text-destructive">*</span></Label>
          <Input v-model="form.productSku" :disabled="isEdit" placeholder="如：SKU060001" />
        </div>
        <div class="flex items-center gap-2">
          <Label>商品名称 <span class="text-destructive">*</span></Label>
          <Input v-model="form.productName" placeholder="商品名称" />
        </div>
        <div class="flex items-center gap-2">
          <Label>品类 <span class="text-destructive">*</span></Label>
          <Select v-model="form.category">
            <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in CATEGORY_OPTIONS" :key="c" :value="c">{{ c }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex items-center gap-2">
          <Label>单位</Label>
          <Select v-model="form.unit">
            <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="u in UNIT_OPTIONS" :key="u" :value="u">{{ u }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="col-span-2 space-y-1.5">
          <Label>默认成本价<span class="text-destructive">*</span></Label>
          <Input v-model.number="form.defaultCost" type="number" min="0" step="0.01" placeholder="0.00" />
        </div>
        <div class="col-span-2 space-y-1.5">
          <Label>备注</Label>
          <Input v-model="form.description" placeholder="规格、产地等" />
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
