/**
 * 门店资料 API
 */
import { defHttp } from '/@/api/http';
import { delay, MOCK_DATA } from '/@/mocks/_helpers';
import type { StoreProfile } from '/#/b2b-store';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ===== 内联 Mock：门店资料 =====
const CURRENT_STORE_ID = 'str-001';
const storeProfile: StoreProfile = {
  storeId: CURRENT_STORE_ID,
  storeName: MOCK_DATA.STORE_NAMES[0],
  storeType: 'SCENIC',
  contactPerson: '王经理',
  contactPhone: '13888885678',
  contactEmail: 'store@b2b.example.com',
  province: '安徽',
  city: '黄山市',
  address: '黄山风景区温泉景区温泉路 88 号',
  receiveAddress: '黄山风景区温泉景区温泉路 88 号 1 号库',
  receiver: '王经理',
  receiverPhone: '13888885678',
  description: '景区主入口黄金商圈，年客流量约 200 万。',
  updatedAt: '2026-05-20 10:30:00',
};

function mockGetStoreProfile(storeId: string) {
  if (storeId !== CURRENT_STORE_ID) return delay<StoreProfile | null>(null);
  return delay({ ...storeProfile });
}
function mockUpdateStoreProfile(patch: Partial<StoreProfile>) {
  Object.assign(storeProfile, patch, { updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') });
  return delay({ success: true });
}

enum Api {
  GetProfile = '/b2b/store/profile/get',
  UpdateProfile = '/b2b/store/profile/update',
}

export function getStoreProfileApi(storeId: string) {
  return USE_MOCK ? mockGetStoreProfile(storeId) : Promise.resolve(null);
}
export function updateStoreProfileApi(patch: Partial<StoreProfile>) {
  return USE_MOCK ? mockUpdateStoreProfile(patch) : defHttp.post({ url: Api.UpdateProfile, data: patch });
}
