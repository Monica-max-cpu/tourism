<script setup lang="ts">
/**
 * 供应商 - 仓库管理
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】供应商仓库 CRUD
 * 合约 4.1-4.4: 新增/列表/修改/删除仓库
 * update-end--author:claude---date:2026-05-26---for:【阶段7】供应商仓库 CRUD
 */
import { reactive, ref, computed } from 'vue';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Card, CardContent,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { listWarehousesApi, addWarehouseApi, editWarehouseApi, deleteWarehouseApi } from '/@/api/supplier/warehouse';
import type { SupplierWarehouse } from '/#/b2b-supplier';

const [registerTable, { reload }] = useTable();

const columns: BasicColumn[] = [
  { field: 'warehouseName', title: '仓库名称', minWidth: 100 },
  { field: 'contactPerson', title: '联系人', width: 180 },
  { field: 'contactPhone', title: '联系电话', width: 200 },
  { field: 'province', title: '省份', width: 150 },
  { field: 'city', title: '城市', width: 150 },
  { field: 'address', title: '详细地址', minWidth: 200 },
  { field: 'isDefault', title: '是否默认', width: 120, slots: { default: 'isDefault' } },
  { field: 'action', title: '操作', width: 240, fixed: 'right', slots: { default: 'action' } },
];

async function loadData(params: any) {
  return await listWarehousesApi({ ...params });
}

// 新增 / 编辑弹窗
const formModal = useModal<SupplierWarehouse | null>();
const form = reactive({
  warehouseName: '',
  contactPerson: '',
  contactPhone: '',
  province: '',
  city: '',
  address: '',
  isDefault: 0 as 0 | 1,
});
const formSubmitting = ref(false);
const isEdit = computed(() => !!formModal.data.value);

function openCreate() {
  Object.assign(form, {
    warehouseName: '', contactPerson: '', contactPhone: '',
    province: '', city: '', address: '', isDefault: 0 as 0 | 1,
  });
  formModal.open(null);
}
function openEdit(row: SupplierWarehouse) {
  form.warehouseName = row.warehouseName;
  form.contactPerson = row.contactPerson || '';
  form.contactPhone = row.contactPhone || '';
  form.province = row.province || '';
  form.city = row.city || '';
  form.address = row.address || '';
  form.isDefault = row.isDefault;
  formModal.open(row);
}

async function submitForm() {
  if (!form.warehouseName) return;
  formSubmitting.value = true;
  try {
    const target = formModal.data.value;
    if (target) {
      await editWarehouseApi({ id: target.id, ...form });
    } else {
      await addWarehouseApi({ ...form });
    }
    formModal.close();
    reload();
  } finally {
    formSubmitting.value = false;
  }
}

async function onDelete(row: SupplierWarehouse) {
  await deleteWarehouseApi(row.id);
  reload();
}
</script>

<template>
  <PageWrapper title="仓库管理" subtitle="维护供应商发货仓库，新建报价时将关联仓库">
    <template #extra>
      <Button v-auth="'b2b:supplier:warehouse'" @click="openCreate">
        <Plus class="w-4 h-4 mr-1.5" />新增仓库
      </Button>
    </template>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #isDefault="{ row }">
        <span>{{ row.isDefault === 1 ? '是' : '否' }}</span>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '编辑', authCode: 'b2b:supplier:warehouse', onClick: () => openEdit(row) },
            { label: '删除', authCode: 'b2b:supplier:warehouse', variant: 'destructive', onClick: () => onDelete(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal
      v-model:open="formModal.visible.value"
      :title="isEdit ? '编辑仓库' : '新增仓库'"
      :confirm-loading="formSubmitting"
      :confirm-disabled="!form.warehouseName"
      @confirm="submitForm"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5 col-span-2">
          <Label>仓库名称 <span class="text-destructive">*</span></Label>
          <Input v-model="form.warehouseName" placeholder="例如 总仓-华东" />
        </div>
        <div class="space-y-1.5">
          <Label>联系人</Label>
          <Input v-model="form.contactPerson" placeholder="负责人姓名" />
        </div>
        <div class="space-y-1.5">
          <Label>联系电话</Label>
          <Input v-model="form.contactPhone" placeholder="手机号" />
        </div>
        <div class="space-y-1.5">
          <Label>省份</Label>
          <Input v-model="form.province" placeholder="省" />
        </div>
        <div class="space-y-1.5">
          <Label>城市</Label>
          <Input v-model="form.city" placeholder="市" />
        </div>
        <div class="space-y-1.5 col-span-2">
          <Label>详细地址</Label>
          <Input v-model="form.address" placeholder="区/街道/门牌号" />
        </div>
        <div class="flex items-center gap-2 col-span-2">
          <Label>设为默认仓库</Label>
          <Select v-model="form.isDefault">
            <SelectTrigger class="w-32"><SelectValue :placeholder="form.isDefault === 1 ? '是' : '否'" /></SelectTrigger>
            <SelectContent>
              <SelectItem :value="1">是</SelectItem>
              <SelectItem :value="0">否</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
