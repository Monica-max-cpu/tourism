import { defHttp } from '/@/api/http';
import type { UserApplicationStatus } from '/#/b2b';

enum Api {
  UserApplicationStatus = '/b2b/merchant/user/application-status',
}

export function getUserApplicationStatusApi(): Promise<UserApplicationStatus> {
  return defHttp.get<UserApplicationStatus>({ url: Api.UserApplicationStatus });
}
