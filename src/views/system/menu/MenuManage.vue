<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ChevronDown, ChevronRight, Plus } from 'lucide-vue-next';
import {
  message,
  Select as ASelect,
  SelectOption as ASelectOption,
  TreeSelect as ATreeSelect,
  Switch as ASwitch,
} from 'ant-design-vue';
import { Badge, Button, Input, Label } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { SearchBar } from '/@/components/SearchBar';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { deleteMenuApi, listMenusApi, saveMenuApi } from '/@/api/system/menu';
import { usePermissionStore } from '/@/stores/modules/permission';
import type { SystemMenu } from '/#/system';

const search = reactive({ name: '' });
const DEFAULT_FORM: Partial<SystemMenu> = {
  menuType: 0,
  sortNo: 1,
  route: true,
  hidden: false,
  hideTab: false,
  keepAlive: false,
  alwaysShow: false,
  internalOrExternal: false,
  permsType: '1',
  status: '1',
};

const form = reactive<Partial<SystemMenu>>({ ...DEFAULT_FORM });
const menuTree = ref<SystemMenu[]>([]);
const submitting = ref(false);
const menuModal = useModal<SystemMenu & { mode: 'create' | 'edit' }>();
const [registerTable, tableAction] = useTable();
const permissionStore = usePermissionStore();

const isEdit = computed(() => menuModal.data.value?.mode === 'edit');
const isButton = computed(() => Number(form.menuType) === 2);
const isTopMenu = computed(() => Number(form.menuType) === 0);
const hasPerm = (code: string) => permissionStore.getPermCodeList.includes(code);

const columns: BasicColumn[] = [
  { field: 'name', title: '菜单名称', minWidth: 220, treeNode: true },
  { field: 'menuType', title: '菜单类型', width: 120, slots: { default: 'menuType' } },
  { field: 'perms', title: '授权标识', minWidth: 180 },
  { field: 'component', title: '组件', minWidth: 180 },
  { field: 'url', title: '路径', minWidth: 160 },
  { field: 'sortNo', title: '排序', width: 90 },
  { field: 'action', title: '操作', width: 230, fixed: 'right', slots: { default: 'action' } },
];

function toTreeSelect(nodes: SystemMenu[]): any[] {
  return nodes.map((node) => ({
    title: node.name,
    value: node.id,
    key: node.id,
    children: node.children ? toTreeSelect(node.children) : undefined,
  }));
}

const parentOptions = computed(() => toTreeSelect(menuTree.value));

function resetForm() {
  // 不能用 delete 破坏 reactive 的响应式追踪
  // 先将所有可能被 Object.assign 写入的字段清为 undefined，再覆盖默认值
  const clean: Record<string, any> = {};
  Object.keys(form).forEach((key) => {
    clean[key] = undefined;
  });
  Object.assign(form, clean, DEFAULT_FORM);
}

async function loadData() {
  const data = await listMenusApi(search);
  menuTree.value = data || [];
  return { records: menuTree.value, total: menuTree.value.length };
}

async function refreshCurrentUserMenus() {
  permissionStore.resetState();
  await permissionStore.buildRoutesAction();
}

async function openCreate() {
  resetForm();
  await refreshParentTree();
  menuModal.open({ mode: 'create' } as SystemMenu & { mode: 'create' });
}

async function openAddChild(row: SystemMenu) {
  resetForm();
  await refreshParentTree();
  form.parentId = row.id;
  form.menuType = 1;
  menuModal.open({ mode: 'create' } as SystemMenu & { mode: 'create' });
}

async function openEdit(row: SystemMenu) {
  resetForm();
  await refreshParentTree();
  Object.assign(form, row);
  menuModal.open({ ...row, mode: 'edit' });
}

async function refreshParentTree() {
  if (menuTree.value.length > 0) return;
  menuTree.value = await listMenusApi();
}

async function submitMenu() {
  if (!form.name) {
    message.warning(isButton.value ? '请填写按钮/权限名称' : '请填写菜单名称');
    return;
  }
  if (!isTopMenu.value && !form.parentId) {
    message.warning('请选择上级菜单');
    return;
  }
  if (!isButton.value && !form.url) {
    message.warning('请填写访问路径');
    return;
  }
  submitting.value = true;
  try {
    await saveMenuApi(form, isEdit.value);
    message.success(isEdit.value ? '菜单已更新' : '菜单已新增');
    menuModal.close();
    tableAction.reload();
    await refreshCurrentUserMenus();
  } finally {
    submitting.value = false;
  }
}

async function deleteMenu(row: SystemMenu) {
  if (!window.confirm(`确认删除 ${row.name}？`)) return;
  await deleteMenuApi(row.id);
  message.success('菜单已删除');
  tableAction.reload();
  await refreshCurrentUserMenus();
}

function onSearch() {
  tableAction.reload({ pageNo: 1 });
}

function onReset() {
  search.name = '';
  tableAction.reload({ pageNo: 1 });
}

function menuTypeLabel(type: number) {
  if (type === 0) return '一级菜单';
  if (type === 1) return '子菜单';
  return '按钮/权限';
}
</script>

<template>
  <PageWrapper title="菜单管理" subtitle="维护路由菜单、子菜单和按钮权限标识">
    <template #extra>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="tableAction.expandAll">
          <ChevronDown class="mr-2 h-4 w-4" />
          展开全部
        </Button>
        <Button variant="outline" @click="tableAction.collapseAll">
          <ChevronRight class="mr-2 h-4 w-4" />
          折叠全部
        </Button>
        <Button v-if="hasPerm('system:permission:add')" @click="openCreate">
          <Plus class="mr-2 h-4 w-4" />
          新增菜单
        </Button>
      </div>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">菜单名称</Label>
        <Input v-model="search.name" placeholder="菜单名称" class="w-56" @keyup.enter="onSearch" />
      </div>
    </SearchBar>

    <BasicTable
      :columns="columns"
      :api="loadData"
      :pagination="false"
      row-key="id"
      :tree-config="{ children: 'children', expandAll: true, transform: false }"
      @register="registerTable"
    >
      <template #menuType="{ row }">
        <Badge variant="secondary">{{ menuTypeLabel(Number(row.menuType)) }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '编辑', authCode: 'system:permission:edit', onClick: () => openEdit(row) },
            { label: '添加下级', authCode: 'system:permission:add', hidden: Number(row.menuType) === 2, onClick: () => openAddChild(row) },
            { label: '删除', authCode: 'system:permission:delete', variant: 'destructive', onClick: () => deleteMenu(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="menuModal.visible.value"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      width="760px"
      :confirm-loading="submitting"
      @confirm="submitMenu"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>菜单类型</Label>
          <ASelect v-model:value="form.menuType" class="w-full" :getPopupContainer="(trigger) => trigger?.parentNode">
            <ASelectOption :value="0">一级菜单</ASelectOption>
            <ASelectOption :value="1">子菜单</ASelectOption>
            <ASelectOption :value="2">按钮/权限</ASelectOption>
          </ASelect>
        </div>
        <div v-if="!isTopMenu" class="space-y-2">
          <Label>上级菜单 <span class="text-destructive">*</span></Label>
          <ATreeSelect
            v-model:value="form.parentId"
            class="w-full"
            :tree-data="parentOptions"
            :get-popup-container="(trigger) => trigger?.parentNode"
            allow-clear
            tree-default-expand-all
            placeholder="请选择上级菜单"
          />
        </div>
        <div class="space-y-2">
          <Label>{{ isButton ? '按钮/权限' : '菜单名称' }} <span class="text-destructive">*</span></Label>
          <Input v-model="form.name" placeholder="请输入名称" />
        </div>
        <div v-if="!isButton" class="space-y-2">
          <Label>访问路径 <span class="text-destructive">*</span></Label>
          <Input v-model="form.url" placeholder="/system/user" />
        </div>
        <div v-if="!isButton" class="space-y-2">
          <Label>前端组件</Label>
          <Input v-model="form.component" placeholder="system/user/UserManage" />
        </div>
        <div v-if="!isButton" class="space-y-2">
          <Label>组件名称</Label>
          <Input v-model="form.componentName" placeholder="可选，通常与组件 name 对齐" />
        </div>
        <div v-if="isTopMenu" class="space-y-2">
          <Label>默认跳转地址</Label>
          <Input v-model="form.redirect" placeholder="可选" />
        </div>
        <div v-if="isButton" class="space-y-2">
          <Label>授权标识</Label>
          <Input v-model="form.perms" placeholder="system:user:add" />
        </div>
        <div v-if="isButton" class="space-y-2">
          <Label>授权策略</Label>
          <ASelect v-model:value="form.permsType" class="w-full" :getPopupContainer="(trigger) => trigger?.parentNode">
            <ASelectOption value="1">可见/可访问</ASelectOption>
            <ASelectOption value="2">可编辑</ASelectOption>
          </ASelect>
        </div>
        <div v-if="isButton" class="space-y-2">
          <Label>状态</Label>
          <ASelect v-model:value="form.status" class="w-full" :getPopupContainer="(trigger) => trigger?.parentNode">
            <ASelectOption value="1">有效</ASelectOption>
            <ASelectOption value="0">无效</ASelectOption>
          </ASelect>
        </div>
        <div v-if="!isButton" class="space-y-2">
          <Label>菜单图标</Label>
          <Input v-model="form.icon" placeholder="Lucide 图标名，如 Settings" />
        </div>
        <div v-if="!isButton" class="space-y-2">
          <Label>排序</Label>
          <Input v-model="form.sortNo" type="number" />
        </div>
        <div v-if="!isButton" class="col-span-2 grid grid-cols-3 gap-4 rounded-md border border-border p-3">
          <label class="flex items-center justify-between gap-3 text-sm">
            是否路由菜单
            <ASwitch v-model:checked="form.route" />
          </label>
          <label class="flex items-center justify-between gap-3 text-sm">
            隐藏路由
            <ASwitch v-model:checked="form.hidden" />
          </label>
          <label class="flex items-center justify-between gap-3 text-sm">
            隐藏 Tab
            <ASwitch v-model:checked="form.hideTab" />
          </label>
          <label class="flex items-center justify-between gap-3 text-sm">
            缓存路由
            <ASwitch v-model:checked="form.keepAlive" />
          </label>
          <label class="flex items-center justify-between gap-3 text-sm">
            聚合路由
            <ASwitch v-model:checked="form.alwaysShow" />
          </label>
          <label class="flex items-center justify-between gap-3 text-sm">
            外部打开
            <ASwitch v-model:checked="form.internalOrExternal" />
          </label>
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
