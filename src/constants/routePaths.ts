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
  CLAIM_ONBOARDING: '/claim-onboarding',

  // 登录后入驻入口
  ENTRY: '/entry',
  ENTRY_B2B: '/entry/b2b',
  ENTRY_B2C: '/entry/b2c',
  ENTRY_APPLY_SUPPLIER: '/entry/apply/supplier',
  ENTRY_APPLY_STORE: '/entry/apply/store',

  // 平台管理员
  ADMIN_WORKBENCH: '/b2b/admin/workbench',
  ADMIN_SUPPLIERS: '/b2b/admin/suppliers',
  ADMIN_STORES: '/b2b/admin/stores',
  ADMIN_QUOTES: '/b2b/admin/quotes',
  ADMIN_CATALOGS: '/b2b/admin/catalogs',
  ADMIN_CATALOG_CREATE: '/b2b/admin/catalog/create',
  ADMIN_CATALOG_EDIT: '/b2b/admin/catalog/:id/edit',
  ADMIN_STOCK_MANAGE: '/b2b/admin/stock',
  ADMIN_STOCKS: '/b2b/admin/stocks',
  ADMIN_STOCK_LOGS: '/b2b/admin/stocks/log',
  ADMIN_STORE_ORDERS: '/b2b/admin/store-orders',
  ADMIN_STORE_ORDER_DETAIL: '/b2b/admin/store-orders/:id',
  ADMIN_PAYMENTS_PENDING: '/b2b/admin/payments/pending',
  ADMIN_COLLECTIVE_PENDING: '/b2b/admin/collective/pending-orders',
  ADMIN_COLLECTIVE_ORDERS: '/b2b/admin/collective/orders',
  ADMIN_COLLECTIVE_DETAIL: '/b2b/admin/collective/orders/:id',
  ADMIN_COLLECTIVE_CONFIG: '/b2b/admin/collective/config',
  ADMIN_DELIVERIES: '/b2b/admin/deliveries',
  ADMIN_DELIVERY_DETAIL: '/b2b/admin/deliveries/:id',
  ADMIN_SETTLEMENTS_STORES: '/b2b/admin/settlements/stores',
  ADMIN_SETTLEMENTS_SUPPLIERS: '/b2b/admin/settlements/suppliers',
  ADMIN_PROFITS: '/b2b/admin/profits',
  ADMIN_SYSTEM_USERS: '/b2b/admin/system/users',
  ADMIN_SYSTEM_ROLES: '/b2b/admin/system/roles',
  ADMIN_SYSTEM_MENUS: '/b2b/admin/system/menus',
  ADMIN_SYSTEM_DICTS: '/b2b/admin/system/dicts',

  // 供应商（阶段 3 替换）
  // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商路由路径
  SUPPLIER_WORKBENCH: '/b2b/supplier/workbench',
  SUPPLIER_QUOTES_MANAGE: '/b2b/supplier/quotes/manage',
  SUPPLIER_QUOTE_CREATE: '/b2b/supplier/quote/create',
  SUPPLIER_QUOTE_EDIT: '/b2b/supplier/quote/:id/edit',
  SUPPLIER_QUOTES_HISTORY: '/b2b/supplier/quotes/history',
  SUPPLIER_PRODUCTS: '/b2b/supplier/products',
  SUPPLIER_PRODUCT_CREATE: '/b2b/supplier/product/create',
  SUPPLIER_PRODUCT_EDIT: '/b2b/supplier/product/:id/edit',
  SUPPLIER_ORDERS_PENDING: '/b2b/supplier/orders/pending',
  SUPPLIER_ORDERS_ACTIVE: '/b2b/supplier/orders/active',
  SUPPLIER_ORDER_DETAIL: '/b2b/supplier/orders/:id',
  SUPPLIER_WAREHOUSES: '/b2b/supplier/warehouses',
  SUPPLIER_INVENTORY: '/b2b/supplier/inventory',
  SUPPLIER_SHIPMENTS: '/b2b/supplier/shipments',
  SUPPLIER_SHIPMENT_DETAIL: '/b2b/supplier/shipments/:id',
  SUPPLIER_SETTLEMENTS: '/b2b/supplier/settlements',
  SUPPLIER_PROFILE: '/b2b/supplier/profile',
  // update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商路由路径

  // 门店
  STORE_WORKBENCH: '/b2b/store/workbench',
  // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端路由路径
  STORE_CATALOG: '/b2b/store/procurement',
  STORE_CART: '/b2b/store/cart',
  STORE_ORDERS: '/b2b/store/orders',
  STORE_ORDER_DETAIL: '/b2b/store/orders/:id',
  STORE_PAYMENT: '/b2b/store/payments',
  STORE_PROFILE: '/b2b/store/profile',
  // update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端路由路径

  // 异常
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
