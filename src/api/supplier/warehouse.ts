/**
 * 阶段 7 - 供应商仓库管理 API
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】供应商仓库 CRUD
 * 合约 4.1-4.4: 新增/列表/修改/删除
 * update-end--author:claude---date:2026-05-26---for:【阶段7】供应商仓库 CRUD
 */
import { defHttp } from '/@/api/http';
import type { SupplierWarehouse } from '/#/b2b-supplier';

enum Api {
  Add = '/b2b/supplier/warehouse/add',
  List = '/b2b/supplier/warehouse/list',
  Edit = '/b2b/supplier/warehouse/edit',
}

export function listWarehousesApi(params: { supplierId?: string; pageNo?: number; pageSize?: number }) {
  return defHttp.get({ url: Api.List, params });
}
export function addWarehouseApi(data: Partial<SupplierWarehouse>) {
  return defHttp.post({ url: Api.Add, data });
}
export function editWarehouseApi(data: Partial<SupplierWarehouse> & { id: string }) {
  return defHttp.put({ url: Api.Edit, data });
}
export function deleteWarehouseApi(id: string) {
  return defHttp.delete({ url: `/b2b/supplier/warehouse/${id}` });
}
