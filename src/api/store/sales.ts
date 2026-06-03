/**
 * 门店资料 API
 */
import { defHttp } from '/@/api/http';
import type { StoreProfile } from '/#/b2b-store';

enum Api {
  UpdateProfile = '/b2b/store/profile/update',
}

export function getStoreProfileApi(storeId: string): Promise<StoreProfile | null> {
  return Promise.resolve({
    storeId: storeId || 'mock-store',
    storeName: '山西文旅太原旗舰门店',
    storeType: 'CHAIN',
    contactPerson: '王丽',
    contactPhone: '13800001111',
    contactEmail: 'store@example.com',
    province: '山西省',
    city: '太原市',
    address: '小店区文旅示范街 18 号',
    receiveAddress: '山西省太原市小店区文旅示范街 18 号后仓',
    receiver: '王丽',
    receiverPhone: '13800001111',
    description: '面向景区、文创零售和本地特色商品的综合采购门店。',
    updatedAt: '2026-06-03 10:00:00',
  });
}
export function updateStoreProfileApi(patch: Partial<StoreProfile>) {
  return defHttp.post({ url: Api.UpdateProfile, data: patch });
}
