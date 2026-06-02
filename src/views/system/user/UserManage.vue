<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Upload, Download, Plus } from 'lucide-vue-next';
import { message, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue';
import { Badge, Button, Input, Label } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { SearchBar } from '/@/components/SearchBar';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { usePermissionStore } from '/@/stores/modules/permission';
import {
  deleteUserApi,
  downloadUserExportApi,
  importUsersApi,
  listUsersApi,
  queryAllRolesApi,
  queryUserRoleApi,
  saveUserApi,
} from '/@/api/system/user';
import type { SystemRole, SystemUser } from '/#/system';

const search = reactive({
  username: '',
  realname: '',
  phone: '',
  status: '',
});

const form = reactive<Partial<SystemUser> & { password?: string; selectedroles: string[] }>({
  selectedroles: [],
  status: '1',
});
const roles = ref<SystemRole[]>([]);
const submitting = ref(false);
const importing = ref(false);
const fileInputRef = ref<HTMLInputElement>();
const userModal = useModal<SystemUser & { mode: 'create' | 'edit' }>();
const [registerTable, { reload }] = useTable();
const permissionStore = usePermissionStore();

const isEdit = computed(() => userModal.data.value?.mode === 'edit');
const hasPerm = (code: string) => permissionStore.getPermCodeList.includes(code);

const columns: BasicColumn[] = [
  { field: 'username', title: '用户账号', minWidth: 120 },
  { field: 'realname', title: '用户姓名', minWidth: 120 },
  { field: 'phone', title: '手机号', width: 140 },
  { field: 'email', title: '邮箱', minWidth: 180 },
  { field: 'orgCodeTxt', title: '部门', minWidth: 160 },
  { field: 'status', title: '状态', width: 110, slots: { default: 'status' } },
  { field: 'createTime', title: '创建时间', width: 180 },
  { field: 'action', title: '操作', width: 150, fixed: 'right', slots: { default: 'action' } },
];

async function loadData(params: Recordable) {
  return listUsersApi({ ...params, ...search });
}

function resetForm() {
  Object.keys(form).forEach((key) => delete (form as Recordable)[key]);
  form.selectedroles = [];
  form.status = '1';
}

async function ensureRoles() {
  if (roles.value.length > 0) return;
  roles.value = await queryAllRolesApi();
}

async function openCreate() {
  resetForm();
  await ensureRoles();
  userModal.open({ mode: 'create' } as SystemUser & { mode: 'create' });
}

async function openEdit(row: SystemUser) {
  resetForm();
  await ensureRoles();
  Object.assign(form, row);
  form.selectedroles = await queryUserRoleApi(row.id);
  userModal.open({ ...row, mode: 'edit' });
}

async function submitUser() {
  if (!form.username || !form.realname) {
    message.warning('请填写用户账号和用户姓名');
    return;
  }
  if (!isEdit.value && !form.password) {
    message.warning('新增用户需要填写登录密码');
    return;
  }
  submitting.value = true;
  try {
    await saveUserApi(form, isEdit.value);
    message.success(isEdit.value ? '用户已更新' : '用户已新增');
    userModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

async function deleteUser(row: SystemUser) {
  if (row.username === 'admin') {
    message.warning('管理员账号不允许删除');
    return;
  }
  if (!window.confirm(`确认删除用户 ${row.username}？`)) return;
  await deleteUserApi(row.id);
  message.success('用户已删除');
  reload();
}

function onSearch() {
  reload({ pageNo: 1 });
}

function onReset() {
  search.username = '';
  search.realname = '';
  search.phone = '';
  search.status = '';
  reload({ pageNo: 1 });
}

async function exportUsers() {
  const blob = await downloadUserExportApi(search);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `用户列表_${Date.now()}.xls`;
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
    await importUsersApi(file);
    message.success('用户导入成功');
    reload({ pageNo: 1 });
  } finally {
    importing.value = false;
    target.value = '';
  }
}
</script>

<template>
  <PageWrapper title="用户管理" subtitle="维护平台用户账号和用户角色">
    <template #extra>
      <div class="flex items-center gap-2">
        <input ref="fileInputRef" type="file" class="hidden" accept=".xls,.xlsx" @change="onImportFile" />
        <Button v-if="hasPerm('system:user:import')" variant="outline" :disabled="importing" @click="chooseImportFile">
          <Upload class="mr-2 h-4 w-4" />
          {{ importing ? '导入中...' : '导入' }}
        </Button>
        <Button v-if="hasPerm('system:user:export')" variant="outline" @click="exportUsers">
          <Download class="mr-2 h-4 w-4" />
          导出
        </Button>
        <Button v-if="hasPerm('system:user:add')" @click="openCreate">
          <Plus class="mr-2 h-4 w-4" />
          新增用户
        </Button>
      </div>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">账号</Label>
        <Input v-model="search.username" placeholder="用户账号" class="w-44" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">姓名</Label>
        <Input v-model="search.realname" placeholder="用户姓名" class="w-44" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">手机</Label>
        <Input v-model="search.phone" placeholder="手机号" class="w-44" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <ASelect v-model:value="search.status" class="w-36" placeholder="全部" allow-clear>
          <ASelectOption value="1">正常</ASelectOption>
          <ASelectOption value="2">冻结</ASelectOption>
        </ASelect>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="String(row.status) === '1' ? 'default' : 'secondary'">
          {{ row.status_dictText || (String(row.status) === '1' ? '正常' : '冻结') }}
        </Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '编辑', authCode: 'system:user:edit', onClick: () => openEdit(row) },
            { label: '删除', authCode: 'system:user:delete', variant: 'destructive', onClick: () => deleteUser(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="userModal.visible.value"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="720px"
      :confirm-loading="submitting"
      @confirm="submitUser"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>用户账号 <span class="text-destructive">*</span></Label>
          <Input v-model="form.username" :disabled="isEdit" placeholder="请输入用户账号" />
        </div>
        <div v-if="!isEdit" class="space-y-2">
          <Label>登录密码 <span class="text-destructive">*</span></Label>
          <Input v-model="form.password" type="password" placeholder="请输入登录密码" />
        </div>
        <div class="space-y-2">
          <Label>用户姓名 <span class="text-destructive">*</span></Label>
          <Input v-model="form.realname" placeholder="请输入用户姓名" />
        </div>
        <div class="space-y-2">
          <Label>工号</Label>
          <Input v-model="form.workNo" placeholder="请输入工号" />
        </div>
        <div class="space-y-2">
          <Label>手机号</Label>
          <Input v-model="form.phone" placeholder="请输入手机号" />
        </div>
        <div class="space-y-2">
          <Label>邮箱</Label>
          <Input v-model="form.email" placeholder="请输入邮箱" />
        </div>
        <div class="space-y-2">
          <Label>状态</Label>
          <ASelect v-model:value="form.status" class="w-full">
            <ASelectOption value="1">正常</ASelectOption>
            <ASelectOption value="2">冻结</ASelectOption>
          </ASelect>
        </div>
        <div class="space-y-2">
          <Label>角色</Label>
          <ASelect v-model:value="form.selectedroles" mode="multiple" class="w-full" placeholder="请选择角色">
            <ASelectOption v-for="role in roles" :key="role.id" :value="role.id">{{ role.roleName }}</ASelectOption>
          </ASelect>
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
