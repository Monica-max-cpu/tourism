<script setup lang="ts">
/**
 * 平台管理员 - 门店入驻审核
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
} from '/@/api/admin';
import {
  APPLY_STATUS_LABEL, APPLY_STATUS_VARIANT, APPLY_STATUS_OPTIONS,
  STORE_TYPE_LABEL, STORE_TYPE_OPTIONS,
} from '/@/constants/b2bStatus';
import { formatDateTime } from '/@/utils/format';
import type { StoreApply } from '/#/b2b';

const router = useRouter();
const search = reactive({ keyword: '', status: '', storeType: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listStoreApplyApi({ ...params, searchInfo: { ...search } });
}

const columns: BasicColumn[] = [
  { field: 'applyNo', title: '申请编号', width: 160 },
  { field: 'storeName', title: '门店名称', minWidth: 220 },
  { field: 'storeType', title: '类型', width: 110, formatter: ({ cellValue }) => STORE_TYPE_LABEL[cellValue as keyof typeof STORE_TYPE_LABEL] || '-' },
  { field: 'contactPerson', title: '负责人', width: 100 },
  { field: 'contactPhone', title: '联系电话', width: 130 },
  { field: 'province', title: '省份', width: 90 },
  { field: 'status', title: '状态', width: 110, slots: { default: 'status' } },
  { field: 'createdAt', title: '提交时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 200, fixed: 'right', slots: { default: 'action' } },
];

const detailModal = useModal<StoreApply>();
const rejectModal = useModal<StoreApply>();
const rejectReason = ref('');
const submitting = ref(false);

function openDetail(row: StoreApply) {
  detailModal.open(row);
}
async function approve(row: StoreApply) {
  submitting.value = true;
  try {
    await approveStoreApplyApi(row.id);
    detailModal.close();
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
    detailModal.close();
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
  <PageWrapper title="门店入驻审核" subtitle="审核门店提交的入驻申请" variant="hero">
    <template #extra>
      <Button class="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-6 rounded-xl" @click="router.push(ROUTE_PATHS.APPLY_STORE)">
        <Plus class="mr-2 h-5 w-5" />
        邀请新门店
      </Button>
    </template>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="门店 / 编号 / 电话" class="w-60" @keyup.enter="onSearch" />
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
            <SelectItem v-for="o in APPLY_STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #status="{ row }">
        <Badge :variant="APPLY_STATUS_VARIANT[row.status]">{{ APPLY_STATUS_LABEL[row.status] }}</Badge>
      </template>
      <template #action="{ row }">
        <TableAction
          :actions="[
            { label: '查看', onClick: () => openDetail(row) },
            { label: '通过', authCode: 'b2b:store:review', hidden: row.status !== 'PENDING', onClick: () => approve(row) },
            { label: '驳回', authCode: 'b2b:store:review', hidden: row.status !== 'PENDING', onClick: () => openReject(row) },
          ]"
        />
      </template>
    </BasicTable>

    <BasicModal v-model:open="detailModal.visible.value" title="门店入驻详情" width="640px" hide-footer>
      <div v-if="detailModal.data.value" class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <div><span class="text-muted-foreground">申请编号：</span>{{ detailModal.data.value.applyNo }}</div>
          <div>
            <span class="text-muted-foreground">状态：</span>
            <Badge :variant="APPLY_STATUS_VARIANT[detailModal.data.value.status]">{{ APPLY_STATUS_LABEL[detailModal.data.value.status] }}</Badge>
          </div>
          <div class="col-span-2"><span class="text-muted-foreground">门店名称：</span>{{ detailModal.data.value.storeName }}</div>
          <div><span class="text-muted-foreground">门店类型：</span>{{ STORE_TYPE_LABEL[detailModal.data.value.storeType] }}</div>
          <div><span class="text-muted-foreground">负责人：</span>{{ detailModal.data.value.contactPerson }}</div>
          <div><span class="text-muted-foreground">电话：</span>{{ detailModal.data.value.contactPhone }}</div>
          <div><span class="text-muted-foreground">邮箱：</span>{{ detailModal.data.value.contactEmail || '-' }}</div>
          <div><span class="text-muted-foreground">所在地：</span>{{ detailModal.data.value.province }} {{ detailModal.data.value.city }}</div>
          <div><span class="text-muted-foreground">提交时间：</span>{{ formatDateTime(detailModal.data.value.createdAt) }}</div>
          <div class="col-span-2"><span class="text-muted-foreground">详细地址：</span>{{ detailModal.data.value.address || '-' }}</div>
          <div v-if="detailModal.data.value.rejectReason" class="col-span-2 text-destructive">
            <span class="text-muted-foreground">驳回原因：</span>{{ detailModal.data.value.rejectReason }}
          </div>
        </div>
        <div v-if="detailModal.data.value.status === 'PENDING'" v-auth="'b2b:store:review'" class="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" :disabled="submitting" @click="openReject(detailModal.data.value)">驳回</Button>
          <Button :disabled="submitting" @click="approve(detailModal.data.value)">通过审核</Button>
        </div>
      </div>
    </BasicModal>

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
  </PageWrapper>
</template>
