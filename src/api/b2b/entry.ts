import { defHttp } from '/@/api/http';
import { mockGetUserApplicationStatus } from '/@/mocks/entry.mock';
import type { UserApplicationStatus } from '/#/b2b';

enum Api {
  UserApplicationStatus = '/b2b/merchant/user/application-status',
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function getUserApplicationStatusApi(): Promise<UserApplicationStatus> {
  if (USE_MOCK) return mockGetUserApplicationStatus();
  return defHttp.get<UserApplicationStatus>({ url: Api.UserApplicationStatus });
}
