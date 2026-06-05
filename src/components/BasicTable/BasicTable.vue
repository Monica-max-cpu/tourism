<script setup lang="ts">
/**
 * BasicTable - vxe-table 二次封装
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2A】通用表格封装
 * - api 模式：传入分页接口，自动管理 loading/分页/数据
 * - dataSource 模式：传入静态数据
 * - 暴露 reload / getSelected / clearSelection 等方法（@register 风格）
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2A】通用表格封装
 */
import { ref, computed, onMounted, watch } from 'vue';
import type { BasicTableProps, TableActionType, FetchParams } from './types';
import { usePermissionStore } from '/@/stores/modules/permission';

const props = withDefaults(defineProps<BasicTableProps>(), {
  pageSize: 10,
  pagination: true,
  stripe: false,
  border: false,
  autoHeight: true,
  rowKey: 'id',
});

const emit = defineEmits<{
  register: [tableAction: TableActionType];
  'selection-change': [rows: any[]];
  'row-click': [row: any];
}>();

const permissionStore = usePermissionStore();

const loading = ref(false);
const gridRef = ref<any>();
const dataRef = ref<any[]>([]);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(props.pageSize);
const selectedRows = ref<any[]>([]);

const visibleColumns = computed(() =>
  props.columns
    .filter((c) => !c.authCode || permissionStore.getPermCodeList.includes(c.authCode))
    .map((c) => {
      if (c.field === 'action' || c.title === '操作') return c;
      return { ...c, align: 'center' as const };
    }),
);

async function fetchData(extraParams: Partial<FetchParams> = {}) {
  if (!props.api) {
    dataRef.value = props.dataSource || [];
    return;
  }
  loading.value = true;
  try {
    const params: FetchParams = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...extraParams,
    };
    const { records, total: t } = await props.api(params);
    dataRef.value = records;
    total.value = t;
  } finally {
    loading.value = false;
  }
}

const tableAction: TableActionType = {
  reload: async (extra = {}) => {
    if (extra.pageNo) pageNo.value = extra.pageNo;
    await fetchData(extra);
  },
  setLoading: (v) => {
    loading.value = v;
  },
  getDataSource: () => dataRef.value,
  getSelected: () => selectedRows.value,
  clearSelection: () => {
    selectedRows.value = [];
  },
  expandAll: async () => {
    await gridRef.value?.setAllTreeExpand?.(true);
  },
  collapseAll: async () => {
    await gridRef.value?.setAllTreeExpand?.(false);
  },
};

function onPageChange({ currentPage, pageSize: ps }: { currentPage: number; pageSize: number }) {
  pageNo.value = currentPage;
  pageSize.value = ps;
  fetchData();
}

function onSelectChange({ records }: { records: any[] }) {
  selectedRows.value = records;
  emit('selection-change', records);
}

function onRowClick({ row }: { row: any }) {
  emit('row-click', row);
}

watch(
  () => props.dataSource,
  (v) => {
    if (!props.api && v) dataRef.value = v;
  },
  { immediate: true },
);

onMounted(() => {
  emit('register', tableAction);
  fetchData();
});

defineExpose(tableAction);
</script>

<template>
  <div class="basic-table">
    <vxe-grid
      ref="gridRef"
      :loading="loading"
      :data="dataRef"
      :columns="visibleColumns"
      :row-config="{ keyField: props.rowKey, isHover: true }"
      :tree-config="props.treeConfig"
      :stripe="props.stripe"
      :border="props.border"
      :checkbox-config="props.rowSelection === 'checkbox' ? { highlight: true } : undefined"
      :radio-config="props.rowSelection === 'radio' ? { highlight: true } : undefined"
      :pager-config="
        props.pagination
          ? {
              currentPage: pageNo,
              pageSize: pageSize,
              total: total,
              pageSizes: [10, 20, 50, 100],
              layouts: ['Total', 'PrevPage', 'JumpNumber', 'NextPage', 'Sizes'],
            }
          : undefined
      "
      v-bind="props.gridProps"
      @page-change="onPageChange"
      @checkbox-change="onSelectChange"
      @checkbox-all="onSelectChange"
      @cell-click="onRowClick"
    >
      <template
        v-for="col in visibleColumns.filter(c => c.slots?.default)"
        :key="`slot-${col.slots!.default}`"
        v-slot:[col.slots!.default]="scope"
      >
        <slot :name="col.slots!.default" v-bind="scope" />
      </template>
    </vxe-grid>
  </div>
</template>

<style lang="less" scoped>
.basic-table {
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);

  :deep(.vxe-table) {
    --vxe-font-color: #334155;
    --vxe-table-border-color: #eef2f7;
    --vxe-table-row-hover-background-color: #fbfdff;
    border-radius: 14px;
    background: #fff;
  }

  :deep(.vxe-header--column) {
    height: 54px;
    padding: 12px 18px;
    border-bottom: 1px solid #e5e7eb;
    background: #f8fafc;
    color: #64748b;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
  }

  :deep(.vxe-body--column) {
    padding: 12px 18px;
    border-bottom: 1px solid #eef2f7;
    color: #334155;
    font-size: 14px;
  }

  :deep(.vxe-body--row) {
    background: #fff;
    transition: background 0.18s ease, box-shadow 0.18s ease;
  }

  :deep(.vxe-body--row:hover) {
    background: #fbfdff;
  }

  :deep(.vxe-cell) {
    line-height: 1.55;
  }

  :deep(.vxe-table--body-wrapper),
  :deep(.vxe-table--fixed-left-wrapper),
  :deep(.vxe-table--fixed-right-wrapper) {
    background: #fff;
  }

  :deep(.vxe-table--fixed-right-wrapper) {
    box-shadow: -10px 0 24px rgba(15, 23, 42, 0.04);
  }

  :deep(.vxe-table--fixed-left-wrapper) {
    box-shadow: 10px 0 24px rgba(15, 23, 42, 0.04);
  }

  :deep(.vxe-table--border-line) {
    border: 0;
  }

  :deep(.vxe-pager) {
    padding: 14px 18px;
    border-top: 1px solid #eef2f7;
    background: #fff;
  }

  :deep(.table-action) {
    justify-content: center;
  }

  :deep(.table-action .text-border) {
    color: #dbe3ee;
  }
}
</style>
