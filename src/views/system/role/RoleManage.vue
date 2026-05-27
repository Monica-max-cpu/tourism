<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { KeyRound, Plus } from 'lucide-vue-next';
import { message, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue';
import { Button, Input, Label } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { SearchBar } from '/@/components/SearchBar';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import RolePermissionModal from './components/RolePermissionModal.vue';
import { deleteRoleApi, listRolesApi, saveRoleApi } from '/@/api/system/role';
import type { SystemRole } from '/#/system';

const search = reactive({
  roleName: '',
  roleCode: '',
});
const form = reactive<Partial<SystemRole>>({
  isAppConfig: '0',
});
const submitting = ref(false);
const roleModal = useModal<SystemRole & { mode: 'create' | 'edit' }>();
const permissionModalRef = ref<InstanceType<typeof RolePermissionModal>>();
const [registerTable, { reload }] = useTable();
const isEdit = computed(() => roleModal.data.value?.mode === 'edit');

const columns: BasicColumn[] = [
  { field: 'roleName', title: '角色名称', minWidth: 160 },
  { field: 'roleCode', title: '角色编码', minWidth: 160 },
  { field: 'description', title: '备注', minWidth: 220 },
  { field: 'createTime', title: '创建时间', width: 180 },
  { field: 'action', title: '操作', width: 220, fixed: 'right', slots: { default: 'action' } },
];

function resetForm() {
  Object.keys(form).forEach((key) => delete (form as Recordable)[key]);
  form.isAppConfig = '0';
}

async function loadData(params: Recordable) {
  return listRolesApi({ ...params, ...search, column: 'id', order: 'desc' });
}

function openCreate() {
  resetForm();
  roleModal.open({ mode: 'create' } as SystemRole & { mode: 'create' });
}

function openEdit(row: SystemRole) {
  resetForm();
  Object.assign(form, row);
  roleModal.open({ ...row, mode: 'edit' });
}

async function submitRole() {
  if (!form.roleName || !form.roleCode) {
    message.warning('请填写角色名称和角色编码');
    return;
  }
  submitting.value = true;
  try {
    await saveRoleApi(form, isEdit.value);
    message.success(isEdit.value ? '角色已更新' : '角色已新增');
    roleModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

async function deleteRole(row: SystemRole) {
  if (!window.confirm(`确认删除角色 ${row.roleName}？`)) return;
  await deleteRoleApi(row.id);
  message.success('角色已删除');
  reload();
}

function onSearch() {
  reload({ pageNo: 1 });
}

function onReset() {
  search.roleName = '';
  search.roleCode = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="角色管理" subtitle="维护角色信息并配置菜单与按钮权限">
    <template #extra>
      <Button @click="openCreate">
        <Plus class="mr-2 h-4 w-4" />
        新增角色
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">角色名称</Label>
        <Input v-model="search.roleName" placeholder="角色名称" class="w-48" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">角色编码</Label>
        <Input v-model="search.roleCode" placeholder="角色编码" class="w-48" @keyup.enter="onSearch" />
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '授权', onClick: () => permissionModalRef?.open(row.id) },
            { label: '编辑', onClick: () => openEdit(row) },
            { label: '删除', variant: 'destructive', onClick: () => deleteRole(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="roleModal.visible.value"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="620px"
      :confirm-loading="submitting"
      @confirm="submitRole"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>角色名称 <span class="text-destructive">*</span></Label>
          <Input v-model="form.roleName" placeholder="请输入角色名称" />
        </div>
        <div class="space-y-2">
          <Label>角色编码 <span class="text-destructive">*</span></Label>
          <Input v-model="form.roleCode" :disabled="isEdit" placeholder="请输入角色编码" />
        </div>
        <div class="space-y-2">
          <Label>应用配置</Label>
          <ASelect v-model:value="form.isAppConfig" class="w-full">
            <ASelectOption value="1">是</ASelectOption>
            <ASelectOption value="0">否</ASelectOption>
          </ASelect>
        </div>
        <div class="space-y-2 col-span-2">
          <Label>备注</Label>
          <textarea
            v-model="form.description"
            class="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="请输入备注"
          />
        </div>
      </div>
    </BasicModal>

    <RolePermissionModal ref="permissionModalRef">
      <template #icon>
        <KeyRound />
      </template>
    </RolePermissionModal>
  </PageWrapper>
</template>
