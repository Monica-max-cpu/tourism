/**
 * 阶段 7 - 供应商仓库管理 API
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】供应商仓库 CRUD
 * 合约 4.1-4.4: 新增/列表/修改/删除
 * update-end--author:claude---date:2026-05-26---for:【阶段7】供应商仓库 CRUD
 */
import { defHttp } from '/@/api/http';
import * as mock from '/@/mocks/supplier/warehouse.mock';
import type { SupplierWarehouse } from '/#/b2b-supplier';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

enum Api {
  Add = '/b2b/supplier/warehouse/add',
  List = '/b2b/supplier/warehouse/list',
  Edit = '/b2b/supplier/warehouse/edit',
}

export function listWarehousesApi(params: { supplierId?: string; pageNo?: number; pageSize?: number }) {
  return USE_MOCK ? mock.mockListWarehouses(params) : defHttp.get({ url: Api.List, params });
}
export function addWarehouseApi(data: Partial<SupplierWarehouse>) {
  return USE_MOCK ? mock.mockAddWarehouse(data) : defHttp.post({ url: Api.Add, data });
}
export function editWarehouseApi(data: Partial<SupplierWarehouse> & { id: string }) {
  return USE_MOCK ? mock.mockEditWarehouse(data) : defHttp.put({ url: Api.Edit, data });
}
export function deleteWarehouseApi(id: string) {
  return USE_MOCK ? mock.mockDeleteWarehouse(id) : defHttp.delete({ url: `/b2b/supplier/warehouse/${id}` });
}
