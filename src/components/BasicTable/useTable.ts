/**
 * useTable - 表格控制 hook
 * 用法：
 *   const [registerTable, { reload, getSelected }] = useTable({ api, columns });
 *   <BasicTable @register="registerTable" />
 */
import { ref, unref } from 'vue';
import type { BasicTableProps, TableActionType } from './types';

export function useTable(props?: Partial<BasicTableProps>): [
  (action: TableActionType) => void,
  TableActionType & { getProps: () => Partial<BasicTableProps> },
] {
  const tableRef = ref<TableActionType | null>(null);
  const propsRef = ref<Partial<BasicTableProps>>(props || {});

  function register(action: TableActionType) {
    tableRef.value = action;
  }

  const methods: TableActionType & { getProps: () => Partial<BasicTableProps> } = {
    reload: async (params) => {
      await tableRef.value?.reload(params);
    },
    setLoading: (v) => tableRef.value?.setLoading(v),
    getDataSource: () => tableRef.value?.getDataSource() || [],
    getSelected: () => tableRef.value?.getSelected() || [],
    clearSelection: () => tableRef.value?.clearSelection(),
    getProps: () => unref(propsRef),
  };

  return [register, methods];
}
