export type UserRole = 'ADMIN' | 'SUPPLIER' | 'STORE' | 'BASIC_USER';

export interface UserInfo {
  id: string;
  username: string;
  realName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  /** 角色码（逗号分隔，如 "b2b_supplier,b2b_store"），用于前端角色判定 */
  roleCode?: string;
  /** 供应商 ID（角色为 SUPPLIER 时有效） */
  supplierId?: string;
  /** 门店 ID（角色为 STORE 时有效） */
  storeId?: string;
  /** 权限码集合（v-auth 指令 / usePermission 使用） */
  permissions: string[];
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: UserInfo;
}
