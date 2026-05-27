/**
 * 阶段 7 - 供应商仓库 Mock
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】供应商仓库 Mock
 * 合约 4.1-4.4: 保留最近一次设为默认仓库的语义
 * update-end--author:claude---date:2026-05-26---for:【阶段7】供应商仓库 Mock
 */
import type { SupplierWarehouse } from '/#/b2b-supplier';
import { paginate, delay, randomId } from '../_helpers';

const CURRENT_SUPPLIER_ID = 'sup-001';

const warehouses: SupplierWarehouse[] = [
  { id: 'wh-001', supplierId: 'sup-001', warehouseName: '总仓-华东', province: '上海', city: '上海市', address: '浦东新区新金桥路18号', contactPerson: '张库管', contactPhone: '13900001111', isDefault: 1, createTime: '2026-01-10 09:00:00' },
  { id: 'wh-002', supplierId: 'sup-001', warehouseName: '总仓-华南', province: '广东省', city: '广州市', address: '黄埔区香雪大道100号', contactPerson: '刘库管', contactPhone: '13900002222', isDefault: 0, createTime: '2026-02-15 10:00:00' },
  { id: 'wh-003', supplierId: 'sup-001', warehouseName: '冷链-华北', province: '河北省', city: '石家庄市', address: '鹿泉区物流园区3号库', contactPerson: '赵库管', contactPhone: '13900003333', isDefault: 0, createTime: '2026-03-20 11:00:00' },
];

export function mockListWarehouses(params: { supplierId: string; pageNo?: number; pageSize?: number }) {
  if (!params.supplierId) return delay({ records: [], total: 0 });
  const list = warehouses
    .filter((x) => x.supplierId === params.supplierId)
    .sort((a, b) => (b.isDefault as number) - (a.isDefault as number) || (a.createTime! < b.createTime! ? -1 : 1));
  return delay(paginate(list, params.pageNo || 0, params.pageSize || 50));
}

export function mockAddWarehouse(data: Partial<SupplierWarehouse>) {
  const id = randomId('wh-');
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  // 设为默认时取消其他仓库的默认
  if (data.isDefault === 1) {
    warehouses.forEach((w) => { if (w.supplierId === data.supplierId) w.isDefault = 0; });
  }
  const item: SupplierWarehouse = {
    id,
    supplierId: data.supplierId || CURRENT_SUPPLIER_ID,
    warehouseName: data.warehouseName || '',
    province: data.province,
    city: data.city,
    address: data.address,
    contactPerson: data.contactPerson,
    contactPhone: data.contactPhone,
    isDefault: data.isDefault || 0,
    createTime: now,
  };
  warehouses.push(item);
  return delay({ success: true, id });
}

export function mockEditWarehouse(data: Partial<SupplierWarehouse> & { id: string }) {
  const item = warehouses.find((x) => x.id === data.id);
  if (!item) return delay({ success: false, message: '仓库不存在' });
  // 设为默认时取消其他仓库的默认
  if (data.isDefault === 1) {
    warehouses.forEach((w) => { if (w.supplierId === item.supplierId && w.id !== data.id) w.isDefault = 0; });
  }
  Object.assign(item, data);
  return delay({ success: true });
}

export function mockDeleteWarehouse(id: string) {
  const idx = warehouses.findIndex((x) => x.id === id);
  if (idx >= 0) warehouses.splice(idx, 1);
  return delay({ success: true });
}
