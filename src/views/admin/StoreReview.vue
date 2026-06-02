<script setup lang="ts">
/**
 * 平台管理员 - 门店入驻审核
 * 对齐 b2b-api-contract.md v1.0
 */
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Plus } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { TableAction } from '/@/components/TableAction';
import { SearchBar } from '/@/components/SearchBar';
import {
  listStoreApplyApi,
  approveStoreApplyApi,
  rejectStoreApplyApi,
  toggleStoreStatusApi,
} from '/@/api/admin';
import {
  OPERATION_STATUS_LABEL,
  OPERATION_STATUS_VARIANT,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_OPTIONS,
  REVIEW_STATUS_VARIANT,
  STORE_TYPE_LABEL,
  STORE_TYPE_OPTIONS,
  isOperationDisabled,
  isOperationEnabled,
  isPendingReview,
  isReviewApproved,
  normalizeOperationStatus,
  normalizeReviewStatus,
} from '/@/constants/b2bStatus';
import { formatDateTime } from '/@/utils/format';
import type { StoreApply } from '/#/b2b';

const router = useRouter();
const search = reactive({ keyword: '', status: '', storeType: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listStoreApplyApi({ ...params, ...search });
}

const columns: BasicColumn[] = [
  { field: 'storeName', title: '门店名称', minWidth: 180 },
  { field: 'storeType', title: '类型', width: 160, formatter: ({ cellValue }) => STORE_TYPE_LABEL[cellValue as keyof typeof STORE_TYPE_LABEL] || '-' },
  { field: 'contactPerson', title: '负责人', width: 160 },
  { field: 'contactPhone', title: '联系电话', width: 180 },
  { field: 'province', title: '省份', width: 120 },
  { field: 'reviewStatus', title: '审核状态', width: 150, align: 'center', slots: { default: 'reviewStatus' } },
  { field: 'operationStatus', title: '运营状态', width: 100, align: 'center', slots: { default: 'operationStatus' } },
  { field: 'createTime', title: '提交时间', width: 200, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 200, fixed: 'right', slots: { default: 'action' } },
];

// 驳回 / 停启用弹窗
const rejectModal = useModal<StoreApply>();
const toggleModal = useModal<StoreApply>();
const rejectReason = ref('');
const submitting = ref(false);

function openDetail(row: StoreApply) {
  router.push(`/b2b/admin/store/${row.id}`);
}
async function approve(row: StoreApply) {
  submitting.value = true;
  try {
    await approveStoreApplyApi(row.id);
    reload();
  } finally {
    submitting.value = false;
  }
}
function openReject(row: StoreApply) {
  rejectReason.value = '';
  rejectModal.open(row);
}
async function confirmReject() {
  if (!rejectReason.value.trim() || !rejectModal.data.value) return;
  submitting.value = true;
  try {
    await rejectStoreApplyApi(rejectModal.data.value.id, rejectReason.value.trim());
    rejectModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function openToggle(row: StoreApply) {
  toggleModal.open(row);
}
async function confirmToggle() {
  if (!toggleModal.data.value) return;
  submitting.value = true;
  try {
    const cur = toggleModal.data.value;
    const target = normalizeOperationStatus(cur) === 1 ? 3 : 1;
    await toggleStoreStatusApi(cur.id, target);
    toggleModal.close();
    reload();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = ''; search.status = ''; search.storeType = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="门店入驻审核" subtitle="审核门店提交的入驻申请">
    <template #extra>
      <Button class="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-6 rounded-xl" @click="router.push(ROUTE_PATHS.APPLY_STORE)">
        <Plus class="mr-2 h-5 w-5" />
        邀请新门店
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="门店 / 电话" class="w-60" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">门店类型</Label>
        <Select v-model="search.storeType">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in STORE_TYPE_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">状态</Label>
        <Select v-model="search.status">
          <SelectTrigger class="w-40"><SelectValue placeholder="全部" /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="o in REVIEW_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #reviewStatus="{ row }">
        <Badge :variant="REVIEW_STATUS_VARIANT[normalizeReviewStatus(row)]">{{ REVIEW_STATUS_LABEL[normalizeReviewStatus(row)] }}</Badge>
      </template>
      <template #operationStatus="{ row }">
        <Badge :variant="OPERATION_STATUS_VARIANT[normalizeOperationStatus(row)]">{{ OPERATION_STATUS_LABEL[normalizeOperationStatus(row)] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '查看', onClick: () => openDetail(row) },
            { label: '通过', authCode: 'b2b:store:review', hidden: !isPendingReview(normalizeReviewStatus(row)), onClick: () => approve(row) },
            { label: '驳回', authCode: 'b2b:store:review', hidden: !isPendingReview(normalizeReviewStatus(row)), onClick: () => openReject(row) },
            { label: '停用', authCode: 'b2b:store:review', hidden: !isReviewApproved(normalizeReviewStatus(row)) || !isOperationEnabled(normalizeOperationStatus(row)), onClick: () => openToggle(row) },
            { label: '启用', authCode: 'b2b:store:review', hidden: !isReviewApproved(normalizeReviewStatus(row)) || !isOperationDisabled(normalizeOperationStatus(row)), onClick: () => openToggle(row) },
          ]"
        />
      </template>
    </BasicTable>

    <!-- 驳回弹窗 -->
    <BasicModal
      v-model:open="rejectModal.visible.value"
      title="驳回入驻申请"
      :description="`将驳回 ${rejectModal.data.value?.storeName || ''} 的入驻申请`"
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
      :title="normalizeOperationStatus(toggleModal.data.value || {}) === 1 ? '停用门店' : '启用门店'"
      :description="`确认${normalizeOperationStatus(toggleModal.data.value || {}) === 1 ? '停用' : '启用'} ${toggleModal.data.value?.storeName || ''}？`"
      :confirm-text="normalizeOperationStatus(toggleModal.data.value || {}) === 1 ? '确认停用' : '确认启用'"
      :confirm-variant="normalizeOperationStatus(toggleModal.data.value || {}) === 1 ? 'destructive' : 'default'"
      :confirm-loading="submitting"
      @confirm="confirmToggle"
    />
  </PageWrapper>
</template>
