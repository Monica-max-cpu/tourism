<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Download, Plus, RefreshCcw, Recycle, Upload } from 'lucide-vue-next';
import { Drawer as ADrawer, message, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue';
import { Badge, Button, Input, Label } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { SearchBar } from '/@/components/SearchBar';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import {
  batchDeleteDictApi,
  deleteDictApi,
  deleteDictItemApi,
  deleteDictPhysicallyApi,
  downloadDictExportApi,
  importDictsApi,
  listDictItemsApi,
  listDictRecycleBinApi,
  listDictsApi,
  queryAllDictItemsApi,
  refreshDictCacheApi,
  restoreDictApi,
  saveDictApi,
  saveDictItemApi,
} from '/@/api/system/dict';
import type { SystemDict, SystemDictItem } from '/#/system';

const colorOptions = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#64748b', '#111827'];

const search = reactive({
  dictName: '',
  dictCode: '',
});

const itemSearch = reactive({
  itemText: '',
  status: undefined as string | undefined,
});

const dictForm = reactive<Partial<SystemDict>>({});
const itemForm = reactive<Partial<SystemDictItem>>({ status: 1, sortOrder: 1 });
const activeDict = ref<SystemDict>();
const itemDrawerOpen = ref(false);
const recycleOpen = ref(false);
const submitting = ref(false);
const importing = ref(false);
const fileInputRef = ref<HTMLInputElement>();
const dictModal = useModal<SystemDict & { mode: 'create' | 'edit' }>();
const itemModal = useModal<SystemDictItem & { mode: 'create' | 'edit' }>();
const [registerDictTable, dictTable] = useTable();
const [registerItemTable, itemTable] = useTable();
const [registerRecycleTable, recycleTable] = useTable();

const dictIsEdit = computed(() => dictModal.data.value?.mode === 'edit');
const itemIsEdit = computed(() => itemModal.data.value?.mode === 'edit');

const dictColumns: BasicColumn[] = [
  { field: 'dictName', title: '字典名称', minWidth: 180 },
  { field: 'dictCode', title: '字典编码', minWidth: 180 },
  { field: 'description', title: '描述', minWidth: 220 },
  { field: 'action', title: '操作', width: 220, fixed: 'right', slots: { default: 'action' } },
];

const itemColumns: BasicColumn[] = [
  { field: 'itemText', title: '名称', minWidth: 140 },
  { field: 'itemValue', title: '数据值', minWidth: 140 },
  { field: 'itemColor', title: '颜色', width: 90, slots: { default: 'itemColor' } },
  { field: 'sortOrder', title: '排序', width: 90 },
  { field: 'status', title: '状态', width: 100, slots: { default: 'itemStatus' } },
  { field: 'description', title: '描述', minWidth: 180 },
  { field: 'action', title: '操作', width: 140, fixed: 'right', slots: { default: 'itemAction' } },
];

const recycleColumns: BasicColumn[] = [
  { field: 'dictName', title: '字典名称', minWidth: 180 },
  { field: 'dictCode', title: '字典编码', minWidth: 180 },
  { field: 'description', title: '描述', minWidth: 220 },
  { field: 'action', title: '操作', width: 160, fixed: 'right', slots: { default: 'recycleAction' } },
];

async function loadDicts(params: Recordable) {
  return listDictsApi({ ...params, ...search });
}

async function loadItems(params: Recordable) {
  if (!activeDict.value?.id) return { records: [], total: 0 };
  return listDictItemsApi({ ...params, ...itemSearch, dictId: activeDict.value.id });
}

async function loadRecycleBin(params: Recordable) {
  return listDictRecycleBinApi(params);
}

function resetDictForm() {
  Object.keys(dictForm).forEach((key) => delete (dictForm as Recordable)[key]);
}

function resetItemForm() {
  Object.keys(itemForm).forEach((key) => delete (itemForm as Recordable)[key]);
  itemForm.status = 1;
  itemForm.sortOrder = 1;
}

function openCreateDict() {
  resetDictForm();
  dictModal.open({ mode: 'create' } as SystemDict & { mode: 'create' });
}

function openEditDict(row: SystemDict) {
  resetDictForm();
  Object.assign(dictForm, row);
  dictModal.open({ ...row, mode: 'edit' });
}

async function submitDict() {
  if (!dictForm.dictName || !dictForm.dictCode) {
    message.warning('请填写字典名称和字典编码');
    return;
  }
  submitting.value = true;
  try {
    await saveDictApi(dictForm, dictIsEdit.value);
    message.success(dictIsEdit.value ? '字典已更新' : '字典已新增');
    dictModal.close();
    dictTable.reload();
  } finally {
    submitting.value = false;
  }
}

async function deleteDict(row: SystemDict) {
  if (!window.confirm(`确认删除字典 ${row.dictName}？`)) return;
  await deleteDictApi(row.id);
  message.success('字典已删除');
  dictTable.reload();
}

async function batchDeleteDict() {
  const rows = dictTable.getSelected() as SystemDict[];
  if (!rows.length) {
    message.warning('请选择要删除的字典');
    return;
  }
  if (!window.confirm(`确认删除选中的 ${rows.length} 个字典？`)) return;
  await batchDeleteDictApi(rows.map((row) => row.id));
  message.success('已批量删除');
  dictTable.clearSelection();
  dictTable.reload();
}

function openItemDrawer(row: SystemDict) {
  activeDict.value = row;
  itemSearch.itemText = '';
  itemSearch.status = undefined;
  itemDrawerOpen.value = true;
  setTimeout(() => itemTable.reload({ pageNo: 1 }));
}

function openCreateItem() {
  resetItemForm();
  itemModal.open({ mode: 'create' } as SystemDictItem & { mode: 'create' });
}

function openEditItem(row: SystemDictItem) {
  resetItemForm();
  Object.assign(itemForm, row);
  itemModal.open({ ...row, mode: 'edit' });
}

async function submitItem() {
  if (!activeDict.value?.id) return;
  if (!itemForm.itemText || !itemForm.itemValue) {
    message.warning('请填写名称和数据值');
    return;
  }
  submitting.value = true;
  try {
    await saveDictItemApi(itemForm, activeDict.value.id, itemIsEdit.value);
    message.success(itemIsEdit.value ? '字典项已更新' : '字典项已新增');
    itemModal.close();
    itemTable.reload();
  } finally {
    submitting.value = false;
  }
}

async function deleteItem(row: SystemDictItem) {
  if (!window.confirm(`确认删除字典项 ${row.itemText}？`)) return;
  await deleteDictItemApi(row.id);
  message.success('字典项已删除');
  itemTable.reload();
}

function onSearch() {
  dictTable.reload({ pageNo: 1 });
}

function onReset() {
  search.dictName = '';
  search.dictCode = '';
  dictTable.reload({ pageNo: 1 });
}

function onItemSearch() {
  itemTable.reload({ pageNo: 1 });
}

function onItemReset() {
  itemSearch.itemText = '';
  itemSearch.status = undefined;
  itemTable.reload({ pageNo: 1 });
}

async function refreshCache() {
  await refreshDictCacheApi();
  await queryAllDictItemsApi();
  message.success('字典缓存已刷新');
}

async function exportDicts() {
  const blob = await downloadDictExportApi(search);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `数据字典_${Date.now()}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

function chooseImportFile() {
  fileInputRef.value?.click();
}

async function onImportFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  importing.value = true;
  try {
    await importDictsApi(file);
    message.success('字典导入成功');
    dictTable.reload({ pageNo: 1 });
  } finally {
    importing.value = false;
    target.value = '';
  }
}

function openRecycleBin() {
  recycleOpen.value = true;
  setTimeout(() => recycleTable.reload({ pageNo: 1 }));
}

async function restoreDict(row: SystemDict) {
  await restoreDictApi(row.id);
  message.success('字典已取回');
  recycleTable.reload();
  dictTable.reload();
}

async function deletePhysically(row: SystemDict) {
  if (!window.confirm(`确认彻底删除字典 ${row.dictName}？`)) return;
  await deleteDictPhysicallyApi(row.id);
  message.success('字典已彻底删除');
  recycleTable.reload();
}
</script>

<template>
  <PageWrapper title="数据字典" subtitle="维护平台枚举配置、字典项和缓存">
    <template #extra>
      <div class="flex items-center gap-2">
        <input ref="fileInputRef" type="file" class="hidden" accept=".xls,.xlsx" @change="onImportFile" />
        <Button variant="outline" :disabled="importing" @click="chooseImportFile">
          <Upload class="mr-2 h-4 w-4" />
          {{ importing ? '导入中...' : '导入' }}
        </Button>
        <Button variant="outline" @click="exportDicts">
          <Download class="mr-2 h-4 w-4" />
          导出
        </Button>
        <Button variant="outline" @click="refreshCache">
          <RefreshCcw class="mr-2 h-4 w-4" />
          刷新缓存
        </Button>
        <Button variant="outline" @click="openRecycleBin">
          <Recycle class="mr-2 h-4 w-4" />
          回收站
        </Button>
        <Button @click="openCreateDict">
          <Plus class="mr-2 h-4 w-4" />
          新增字典
        </Button>
      </div>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">名称</Label>
        <Input v-model="search.dictName" placeholder="字典名称" class="w-48" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">编码</Label>
        <Input v-model="search.dictCode" placeholder="字典编码" class="w-48" @keyup.enter="onSearch" />
      </div>
      <Button variant="outline" @click="batchDeleteDict">批量删除</Button>
    </SearchBar>

    <BasicTable :columns="dictColumns" :api="loadDicts" row-key="id" row-selection="checkbox" @register="registerDictTable">
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '配置', onClick: () => openItemDrawer(row) },
            { label: '编辑', onClick: () => openEditDict(row) },
            { label: '删除', variant: 'destructive', onClick: () => deleteDict(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="dictModal.visible.value"
      :title="dictIsEdit ? '编辑字典' : '新增字典'"
      width="620px"
      :confirm-loading="submitting"
      @confirm="submitDict"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>字典名称 <span class="text-destructive">*</span></Label>
          <Input v-model="dictForm.dictName" placeholder="请输入字典名称" />
        </div>
        <div class="space-y-2">
          <Label>字典编码 <span class="text-destructive">*</span></Label>
          <Input v-model="dictForm.dictCode" :disabled="dictIsEdit" placeholder="请输入字典编码" />
        </div>
        <div class="space-y-2 col-span-2">
          <Label>描述</Label>
          <textarea v-model="dictForm.description" class="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="请输入描述" />
        </div>
      </div>
    </BasicModal>

    <ADrawer v-model:open="itemDrawerOpen" width="860" placement="right" :title="activeDict ? `${activeDict.dictName} - 字典配置` : '字典配置'">
      <div class="space-y-4">
        <div class="flex items-center justify-between gap-3">
          <SearchBar class="flex-1" @search="onItemSearch" @reset="onItemReset">
            <div class="flex items-center gap-2">
              <Label class="text-xs text-muted-foreground">名称</Label>
              <Input v-model="itemSearch.itemText" placeholder="字典项名称" class="w-44" @keyup.enter="onItemSearch" />
            </div>
            <div class="flex items-center gap-2">
              <Label class="text-xs text-muted-foreground">状态</Label>
              <ASelect v-model:value="itemSearch.status" class="w-32" placeholder="全部" allow-clear>
                <ASelectOption value="1">启用</ASelectOption>
                <ASelectOption value="0">禁用</ASelectOption>
              </ASelect>
            </div>
          </SearchBar>
          <Button @click="openCreateItem">
            <Plus class="mr-2 h-4 w-4" />
            新增
          </Button>
        </div>

        <BasicTable :columns="itemColumns" :api="loadItems" row-key="id" @register="registerItemTable">
          <template #itemColor="{ row }">
            <span class="mx-auto block h-4 w-4 rounded-full border border-border" :style="{ backgroundColor: row.itemColor || '#e5e7eb' }" />
          </template>
          <template #itemStatus="{ row }">
            <Badge :variant="String(row.status) === '0' ? 'secondary' : 'default'">
              {{ String(row.status) === '0' ? '禁用' : '启用' }}
            </Badge>
          </template>
          <template #itemAction="{ row }">
            <TableAction
              :actions="[
                { label: '编辑', onClick: () => openEditItem(row) },
                { label: '删除', variant: 'destructive', onClick: () => deleteItem(row) },
              ]"
            />
          </template>
        </BasicTable>
      </div>
    </ADrawer>

    <BasicModal
      v-model:open="itemModal.visible.value"
      :title="itemIsEdit ? '编辑字典项' : '新增字典项'"
      width="640px"
      :confirm-loading="submitting"
      @confirm="submitItem"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>名称 <span class="text-destructive">*</span></Label>
          <Input v-model="itemForm.itemText" placeholder="请输入名称" />
        </div>
        <div class="space-y-2">
          <Label>数据值 <span class="text-destructive">*</span></Label>
          <Input v-model="itemForm.itemValue" placeholder="请输入数据值" />
        </div>
        <div class="space-y-2">
          <Label>排序</Label>
          <Input v-model="itemForm.sortOrder" type="number" placeholder="排序" />
        </div>
        <div class="space-y-2">
          <Label>状态</Label>
          <ASelect v-model:value="itemForm.status" class="w-full">
            <ASelectOption :value="1">启用</ASelectOption>
            <ASelectOption :value="0">禁用</ASelectOption>
          </ASelect>
        </div>
        <div class="space-y-2 col-span-2">
          <Label>颜色值</Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              class="h-7 w-7 rounded-full border-2"
              :class="itemForm.itemColor === color ? 'border-foreground' : 'border-transparent'"
              :style="{ backgroundColor: color }"
              @click="itemForm.itemColor = color"
            />
          </div>
        </div>
        <div class="space-y-2 col-span-2">
          <Label>描述</Label>
          <textarea v-model="itemForm.description" class="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="请输入描述" />
        </div>
      </div>
    </BasicModal>

    <ADrawer v-model:open="recycleOpen" width="760" placement="right" title="字典回收站">
      <BasicTable :columns="recycleColumns" :api="loadRecycleBin" row-key="id" @register="registerRecycleTable">
        <template #recycleAction="{ row }">
          <TableAction
            :actions="[
              { label: '取回', onClick: () => restoreDict(row) },
              { label: '彻底删除', variant: 'destructive', onClick: () => deletePhysically(row) },
            ]"
          />
        </template>
      </BasicTable>
    </ADrawer>
  </PageWrapper>
</template>
