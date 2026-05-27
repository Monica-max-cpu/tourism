<script setup lang="ts">
/**
 * 平台管理员 - 供应商入驻审核
 * 对齐 b2b-api-contract.md v1.0
 */
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
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
  listSupplierApplyApi,
  getSupplierApplyApi,
  approveSupplierApplyApi,
  rejectSupplierApplyApi,
  toggleSupplierStatusApi,
} from '/@/api/admin';
import { APPLY_STATUS_LABEL, APPLY_STATUS_VARIANT, APPLY_STATUS_OPTIONS, isPendingStatus, isApprovedStatus, isDisabledStatus } from '/@/constants/b2bStatus';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatDateTime } from '/@/utils/format';
import type { SupplierApply, ApplyStatus } from '/#/b2b';

const search = reactive({ keyword: '', status: '' });
const router = useRouter();

const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listSupplierApplyApi({ ...params, ...search });
}

const columns: BasicColumn[] = [
  { field: 'supplierName', title: '供应商名称', minWidth: 160, align: 'center' },
  { field: 'contactPerson', title: '联系人', width: 150 },
  { field: 'contactPhone', title: '联系电话', width: 200 },
  { field: 'province', title: '省份', width: 150 },
  { field: 'status', title: '状态', width: 180, slots: { default: 'status' } },
  { field: 'createTime', title: '提交时间', width: 200, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 280, fixed: 'right', slots: { default: 'action' } },
];

// 详情/审核弹窗
const detailModal = useModal<SupplierApply>();
const rejectModal = useModal<SupplierApply>();
const toggleModal = useModal<SupplierApply>();
const rejectReason = ref('');
const submitting = ref(false);

async function openDetail(row: SupplierApply) {
  detailModal.open(row);
  const fresh = await getSupplierApplyApi(row.id);
  if (fresh) detailModal.data.value = fresh;
}

async function approve(row: SupplierApply) {
  submitting.value = true;
  try {
    await approveSupplierApplyApi(row.id);
    detailModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function openReject(row: SupplierApply) {
  rejectReason.value = '';
  rejectModal.open(row);
}

async function confirmReject() {
  if (!rejectReason.value.trim() || !rejectModal.data.value) return;
  submitting.value = true;
  try {
    await rejectSupplierApplyApi(rejectModal.data.value.id, rejectReason.value.trim());
    rejectModal.close();
    detailModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function openToggle(row: SupplierApply) {
  toggleModal.open(row);
}

async function confirmToggle() {
  if (!toggleModal.data.value) return;
  submitting.value = true;
  try {
    const cur = toggleModal.data.value;
    const target: ApplyStatus = cur.status === 1 ? 3 : 1;
    await toggleSupplierStatusApi(cur.id, target);
    toggleModal.close();
    detailModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() {
  reload({ pageNo: 1 });
}
function onReset() {
  search.keyword = '';
  search.status = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="供应商入驻审核" subtitle="审核供应商提交的入驻申请" variant="hero">
    <template #extra>
      <Button class="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-6 rounded-xl" @click="router.push(ROUTE_PATHS.APPLY_SUPPLIER)">
        <Plus class="mr-2 h-5 w-5" />
        邀请新供应商
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="供应商名 / 电话" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in APPLY_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="APPLY_STATUS_VARIANT[row.status]">{{ APPLY_STATUS_LABEL[row.status] ?? row.statusLabel }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '查看', onClick: () => openDetail(row) },
            { label: '通过', authCode: 'b2b:supplier:review', hidden: !isPendingStatus(row.status), onClick: () => approve(row) },
            { label: '驳回', authCode: 'b2b:supplier:review', hidden: !isPendingStatus(row.status), onClick: () => openReject(row) },
            { label: '停用', authCode: 'b2b:supplier:review', hidden: !isApprovedStatus(row.status), onClick: () => openToggle(row) },
            { label: '启用', authCode: 'b2b:supplier:review', hidden: !isDisabledStatus(row.status), onClick: () => openToggle(row) },
          ]"
        />
      </template>
    </BasicTable>

    <!-- 详情弹窗 -->
    <BasicModal
      v-model:open="detailModal.visible.value"
      title="供应商入驻详情"
      width="640px"
      hide-footer
    >
      <div v-if="detailModal.data.value" class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <div><span class="text-muted-foreground">供应商ID：</span>{{ detailModal.data.value.id }}</div>
          <div>
            <span class="text-muted-foreground">状态：</span>
            <Badge :variant="APPLY_STATUS_VARIANT[detailModal.data.value.status]">
              {{ APPLY_STATUS_LABEL[detailModal.data.value.status] ?? detailModal.data.value.statusLabel }}
            </Badge>
          </div>
          <div class="col-span-2"><span class="text-muted-foreground">供应商名称：</span>{{ detailModal.data.value.supplierName }}</div>
          <div><span class="text-muted-foreground">联系人：</span>{{ detailModal.data.value.contactPerson }}</div>
          <div><span class="text-muted-foreground">联系电话：</span>{{ detailModal.data.value.contactPhone }}</div>
          <div class="col-span-2"><span class="text-muted-foreground">联系邮箱：</span>{{ detailModal.data.value.contactEmail || '-' }}</div>
          <div><span class="text-muted-foreground">所在地：</span>{{ detailModal.data.value.province }} {{ detailModal.data.value.city }}</div>
          <div><span class="text-muted-foreground">提交时间：</span>{{ formatDateTime(detailModal.data.value.createTime) }}</div>
          <div v-if="detailModal.data.value.reviewTime"><span class="text-muted-foreground">审核时间：</span>{{ formatDateTime(detailModal.data.value.reviewTime) }}</div>
          <div v-if="detailModal.data.value.loginAccount"><span class="text-muted-foreground">登录账号：</span>{{ detailModal.data.value.loginAccount }}</div>
          <div class="col-span-2"><span class="text-muted-foreground">详细地址：</span>{{ detailModal.data.value.address || '-' }}</div>
          <div class="col-span-2"><span class="text-muted-foreground">备注：</span>{{ detailModal.data.value.remark || '-' }}</div>
          <div v-if="detailModal.data.value.reviewRemark" class="col-span-2 text-destructive">
            <span class="text-muted-foreground">审核备注：</span>{{ detailModal.data.value.reviewRemark }}
          </div>
        </div>
        <div v-if="isPendingStatus(detailModal.data.value.status)" v-auth="'b2b:supplier:review'" class="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" :disabled="submitting" @click="openReject(detailModal.data.value)">驳回</Button>
          <Button :disabled="submitting" @click="approve(detailModal.data.value)">通过审核</Button>
        </div>
        <div v-if="isApprovedStatus(detailModal.data.value.status) || isDisabledStatus(detailModal.data.value.status)" v-auth="'b2b:supplier:review'" class="flex justify-end gap-2 pt-4 border-t border-border">
          <Button v-if="isApprovedStatus(detailModal.data.value.status)" variant="outline" :disabled="submitting" @click="openToggle(detailModal.data.value)">停用</Button>
          <Button v-if="isDisabledStatus(detailModal.data.value.status)" :disabled="submitting" @click="openToggle(detailModal.data.value)">启用</Button>
        </div>
      </div>
    </BasicModal>

    <!-- 驳回弹窗 -->
    <BasicModal
      v-model:open="rejectModal.visible.value"
      title="驳回入驻申请"
      :description="`将驳回 ${rejectModal.data.value?.supplierName || ''} 的入驻申请`"
      confirm-text="确认驳回"
      confirm-variant="destructive"
      :confirm-loading="submitting"
      :confirm-disabled="!rejectReason.trim()"
      @confirm="confirmReject"
    >
      <div class="space-y-2">
        <Label>驳回原因 <span class="text-destructive">*</span></Label>
        <Input v-model="rejectReason" placeholder="请输入驳回原因" />
      </div>
    </BasicModal>

    <!-- 启用/停用确认弹窗 -->
    <BasicModal
      v-model:open="toggleModal.visible.value"
      :title="toggleModal.data.value?.status === 1 ? '停用供应商' : '启用供应商'"
      :description="`确认${toggleModal.data.value?.status === 1 ? '停用' : '启用'} ${toggleModal.data.value?.supplierName || ''}？`"
      :confirm-text="toggleModal.data.value?.status === 1 ? '确认停用' : '确认启用'"
      :confirm-variant="toggleModal.data.value?.status === 1 ? 'destructive' : 'default'"
      :confirm-loading="submitting"
      @confirm="confirmToggle"
    />
  </PageWrapper>
</template>
