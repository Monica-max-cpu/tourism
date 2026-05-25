<script setup lang="ts">
/**
 * 平台管理员 - 平台商品目录
 * - 上下架开 * - 编辑销售价（不显示成本价给非管理员，但当前页面本就是管理员页）
 */
import { reactive, ref } from 'vue';
import {
  Badge, Button, Input, Label, Switch,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import {
  listCatalogsApi, updateCatalogApi, toggleShelfApi,
} from '/@/api/admin';
import { CATALOG_STATUS_LABEL, CATALOG_STATUS_VARIANT, CATALOG_STATUS_OPTIONS } from '/@/constants/b2bStatus';
import { formatCurrency, formatDate } from '/@/utils/format';
import type { PlatformCatalog } from '/#/b2b';

const search = reactive({ keyword: '', status: '', category: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listCatalogsApi({ ...params, searchInfo: { ...search } });
}

const columns: BasicColumn[] = [
  { field: 'productSku', title: 'SKU', width: 120 },
  { field: 'productName', title: '商品名称', minWidth: 240 },
  { field: 'category', title: '分类', width: 100 },
  { field: 'unit', title: '单位', width: 70 },
  { field: 'salePrice', title: '销售价', width: 110, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  {
    field: 'bestCostPrice', title: '最优成本价', width: 110, align: 'right',
    formatter: ({ cellValue }) => formatCurrency(cellValue),
    authCode: 'b2b:profit:view',
  },
  { field: 'status', title: '状态', width: 110, slots: { default: 'status' } },
  { field: 'updatedAt', title: '更新时间', width: 110, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'action', title: '操作', width: 220, fixed: 'right', slots: { default: 'action' } },
];

const editModal = useModal<PlatformCatalog>();
const editForm = reactive({ salePrice: 0, description: '' });
const submitting = ref(false);

function openEdit(row: PlatformCatalog) {
  editModal.open(row);
  editForm.salePrice = row.salePrice;
  editForm.description = row.description || '';
}

async function saveEdit() {
  if (!editModal.data.value) return;
  submitting.value = true;
  try {
    await updateCatalogApi(editModal.data.value.id, {
      salePrice: Number(editForm.salePrice),
      description: editForm.description,
    });
    editModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

async function toggleShelf(row: PlatformCatalog) {
  const next = row.status === 'ON_SHELF' ? 'OFF_SHELF' : 'ON_SHELF';
  await toggleShelfApi(row.id, next);
  reload();
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = ''; search.status = ''; search.category = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="平台商品目录" subtitle="管理平台对外销售的商品（销售价 = 门店看到的价格）">
    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="商品名/ SKU" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in CATALOG_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="CATALOG_STATUS_VARIANT[row.status]">{{ CATALOG_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <Switch
              :checked="row.status === 'ON_SHELF'"
              @update:checked="toggleShelf(row)"
            />
            <span class="text-xs text-muted-foreground">{{ row.status === 'ON_SHELF' ? '上架' : '下架' }}</span>
          </div>
          <TableAction
            :actions="[
              { label: '编辑', authCode: 'b2b:catalog:edit', onClick: () => openEdit(row) },
            ]"
          />
        </div>
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="editModal.visible.value"
      title="编辑商品"
      :description="editModal.data.value?.productName"
      width="520px"
      confirm-text="保存"
      :confirm-loading="submitting"
      @confirm="saveEdit"
    >
      <div class="space-y-4 text-sm">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label class="text-xs text-muted-foreground">SKU</Label>
            <div class="font-mono text-foreground mt-1">{{ editModal.data.value?.productSku }}</div>
          </div>
          <div>
            <Label class="text-xs text-muted-foreground">单位</Label>
            <div class="mt-1">{{ editModal.data.value?.unit }}</div>
          </div>
        </div>

        <div class="space-y-2">
          <Label>销售价（¥）<span class="text-destructive">*</span></Label>
          <Input v-model.number="editForm.salePrice" type="number" step="0.01" />
        </div>

        <div class="space-y-2">
          <Label>商品描述</Label>
          <Input v-model="editForm.description" placeholder="可选" />
        </div>

        <div v-auth="'b2b:profit:view'" class="bg-muted/50 rounded-md p-3 text-xs space-y-1">
          <span class="text-muted-foreground">最优成本价</span><span class="text-foreground font-medium">{{ formatCurrency(editModal.data.value?.bestCostPrice) }}</span>
          <div class="text-muted-foreground">
            预估毛利率：
            <span class="text-[hsl(var(--status-success))] font-medium">
              {{ editModal.data.value && editModal.data.value.bestCostPrice
                ? ((editForm.salePrice - editModal.data.value.bestCostPrice) / editForm.salePrice * 100).toFixed(1) + '%'
                : '-' }}
            </span>
          </div>
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
