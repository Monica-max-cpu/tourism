/**
 * 路由路径常量
 */
export const ROUTE_PATHS = {
  // 公开
  LOGIN: '/login',
  REGISTER: '/register',
  FORGET_PASSWORD: '/forget-password',
  APPLY_SUPPLIER: '/apply/supplier',
  APPLY_STORE: '/apply/store',
  APPLY_RESULT: '/apply/result',

  // 登录后入驻入口
  ENTRY: '/entry',
  ENTRY_B2B: '/entry/b2b',
  ENTRY_B2C: '/entry/b2c',
  ENTRY_APPLY_SUPPLIER: '/entry/apply/supplier',
  ENTRY_APPLY_STORE: '/entry/apply/store',

  // 平台管理员
  ADMIN_WORKBENCH: '/admin/workbench',
  ADMIN_SUPPLIERS: '/admin/suppliers',
  ADMIN_STORES: '/admin/stores',
  ADMIN_QUOTES: '/admin/quotes',
  ADMIN_CATALOGS: '/admin/catalogs',
  ADMIN_CATALOG_CREATE: '/admin/catalog/create',
  ADMIN_CATALOG_EDIT: '/admin/catalog/:id/edit',
  ADMIN_STOCKS: '/admin/stocks',
  ADMIN_STORE_ORDERS: '/admin/store-orders',
  ADMIN_PAYMENTS_PENDING: '/admin/payments/pending',
  ADMIN_COLLECTIVE_PENDING: '/admin/collective/pending-orders',
  ADMIN_COLLECTIVE_ORDERS: '/admin/collective/orders',
  ADMIN_COLLECTIVE_CONFIG: '/admin/collective/config',
  ADMIN_DELIVERIES: '/admin/deliveries',
  ADMIN_SETTLEMENTS_STORES: '/admin/settlements/stores',
  ADMIN_SETTLEMENTS_SUPPLIERS: '/admin/settlements/suppliers',
  ADMIN_PROFITS: '/admin/profits',
  ADMIN_SYSTEM_USERS: '/admin/system/users',
  ADMIN_SYSTEM_ROLES: '/admin/system/roles',
  ADMIN_SYSTEM_MENUS: '/admin/system/menus',
  ADMIN_SYSTEM_DICTS: '/admin/system/dicts',

  // 供应商（阶段 3 替换）
  // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商路由路径
  SUPPLIER_WORKBENCH: '/supplier/workbench',
  SUPPLIER_QUOTES_MANAGE: '/supplier/quotes/manage',
  SUPPLIER_QUOTE_CREATE: '/supplier/quote/create',
  SUPPLIER_QUOTE_EDIT: '/supplier/quote/:id/edit',
  SUPPLIER_QUOTES_HISTORY: '/supplier/quotes/history',
  SUPPLIER_PRODUCTS: '/supplier/products',
  SUPPLIER_PRODUCT_CREATE: '/supplier/product/create',
  SUPPLIER_PRODUCT_EDIT: '/supplier/product/:id/edit',
  SUPPLIER_ORDERS_PENDING: '/supplier/orders/pending',
  SUPPLIER_ORDERS_ACTIVE: '/supplier/orders/active',
  SUPPLIER_WAREHOUSES: '/supplier/warehouses',
  SUPPLIER_INVENTORY: '/supplier/inventory',
  SUPPLIER_SHIPMENTS: '/supplier/shipments',
  SUPPLIER_SETTLEMENTS: '/supplier/settlements',
  SUPPLIER_PROFILE: '/supplier/profile',
  // update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商路由路径

  // 门店
  STORE_WORKBENCH: '/store/workbench',
  // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端路由路径
  STORE_CATALOG: '/store/procurement',
  STORE_CART: '/store/cart',
  STORE_ORDERS: '/store/orders',
  STORE_ORDER_DETAIL: '/store/orders/:id',
  STORE_PAYMENT: '/store/payments',
  STORE_PROFILE: '/store/profile',
  // update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端路由路径

  // 异常
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
