export interface PageResult<T> {
  records: T[];
  total: number;
}

export interface SystemRole {
  id: string;
  roleName: string;
  roleCode: string;
  description?: string;
  isAppConfig?: string;
  createTime?: string;
}

export interface SystemUser {
  id: string;
  username: string;
  realname: string;
  avatar?: string;
  sex?: number | string;
  birthday?: string;
  phone?: string;
  email?: string;
  workNo?: string;
  orgCodeTxt?: string;
  departIds_dictText?: string;
  status?: number | string;
  status_dictText?: string;
  selectedroles?: string[];
  createTime?: string;
}

export interface SystemMenu {
  id: string;
  name: string;
  parentId?: string;
  menuType: 0 | 1 | 2;
  icon?: string;
  component?: string;
  componentName?: string;
  url?: string;
  redirect?: string;
  perms?: string;
  permsType?: string;
  status?: string;
  sortNo?: number;
  route?: boolean;
  hidden?: boolean | number;
  hideTab?: boolean | number;
  keepAlive?: boolean;
  alwaysShow?: boolean;
  internalOrExternal?: boolean;
  children?: SystemMenu[];
}

export interface PermissionTreeNode {
  key: string;
  title?: string;
  slotTitle?: string;
  ruleFlag?: boolean;
  children?: PermissionTreeNode[];
}
