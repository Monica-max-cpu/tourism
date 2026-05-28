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
import { useUserStore } from '/@/stores/modules/user';

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

const userStore = useUserStore();

const loading = ref(false);
const gridRef = ref<any>();
const dataRef = ref<any[]>([]);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(props.pageSize);
const selectedRows = ref<any[]>([]);

const visibleColumns = computed(() =>
  props.columns.filter((c) => !c.authCode || userStore.getPermissions.includes(c.authCode)),
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
  <div class="basic-table backdrop-blur-sm rounded-lg border border-border">
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
  :deep(.vxe-table) {
    --vxe-font-color: hsl(var(--foreground));
    --vxe-table-border-color: hsl(var(--border));
    --vxe-table-row-hover-background-color: hsl(var(--accent) / 0.3);
  }
  :deep(.vxe-header--column) {
    background: hsl(var(--muted));
    font-weight: 600;
    font-size: 13px;
    color: hsl(var(--foreground));
    text-align: center;
    padding: 6px 12px;
    border-bottom: 2px solid hsl(var(--border));
  }
  :deep(.vxe-body--column) {
    padding: 6px 12px;
    font-size: 14px;
  }
  :deep(.vxe-pager) {
    border-top: 1px solid hsl(var(--border));
  }
}
</style>
