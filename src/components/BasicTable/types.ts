/**
 * BasicTable 类型定义
 */
import type { VxeGridProps } from 'vxe-table';
import type { VxeTablePropTypes } from 'vxe-table';

export interface BasicColumn {
  field?: string;
  title?: string;
  width?: number | string;
  minWidth?: number | string;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  showOverflow?: boolean | 'tooltip' | 'ellipsis' | 'title';
  formatter?: (params: { cellValue: any; row: any; column: any }) => string;
  slots?: { default?: string; header?: string };
  /** 业务自定义：列上的权限码（无权限则不渲染） */
  authCode?: string;
  type?: 'seq' | 'checkbox' | 'radio' | 'expand';
  treeNode?: boolean;
}

export interface FetchParams {
  pageNo: number;
  pageSize: number;
  searchInfo?: Recordable;
  [key: string]: any;
}

export type FetchFn = (params: FetchParams) => Promise<{ records: any[]; total: number }>;

export interface BasicTableProps {
  columns: BasicColumn[];
  api?: FetchFn;
  dataSource?: any[];
  rowKey?: string;
  /** 默认每页大小 */
  pageSize?: number;
  /** 是否显示分页 */
  pagination?: boolean;
  /** 是否显示斑马纹 */
  stripe?: boolean;
  /** 是否显示边框 */
  border?: boolean;
  /** 表格高度 */
  height?: number | string;
  /** 是否自适应高度 */
  autoHeight?: boolean;
  /** 额外的 vxe-grid 配置覆盖 */
  gridProps?: Partial<VxeGridProps>;
  /** 树表配置，传入后启用 vxe-grid 树形数据 */
  treeConfig?: VxeTablePropTypes.TreeConfig;
  /** 行选中类型 */
  rowSelection?: 'checkbox' | 'radio';
}

export interface TableActionType {
  reload: (params?: Partial<FetchParams>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  getDataSource: () => any[];
  getSelected: () => any[];
  clearSelection: () => void;
  expandAll: () => Promise<void>;
  collapseAll: () => Promise<void>;
}

declare global {
  type Recordable<T = any> = Record<string, T>;
}
