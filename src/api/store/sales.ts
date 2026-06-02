/**
 * 门店资料 API
 */
import { defHttp } from '/@/api/http';
import type { StoreProfile } from '/#/b2b-store';

enum Api {
  UpdateProfile = '/b2b/store/profile/update',
}

export function getStoreProfileApi(storeId: string): Promise<StoreProfile | null> {
  void storeId;
  return Promise.resolve(null);
}
export function updateStoreProfileApi(patch: Partial<StoreProfile>) {
  return defHttp.post({ url: Api.UpdateProfile, data: patch });
}
