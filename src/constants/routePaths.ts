/**
 * 路由路径常量
 */
export const ROUTE_PATHS = {
  // 公开
  LOGIN: '/login',
  APPLY_SUPPLIER: '/apply/supplier',
  APPLY_STORE: '/apply/store',
  APPLY_RESULT: '/apply/result',

  // 平台管理员
  ADMIN_WORKBENCH: '/admin/workbench',
  ADMIN_SUPPLIERS: '/admin/suppliers',
  ADMIN_STORES: '/admin/stores',
  ADMIN_QUOTES: '/admin/quotes',
  ADMIN_CATALOGS: '/admin/catalogs',
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

  // 供应商（阶段 3 替换）
  // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商路由路径
  SUPPLIER_WORKBENCH: '/supplier/workbench',
  SUPPLIER_QUOTES_MANAGE: '/supplier/quotes/manage',
  SUPPLIER_QUOTES_HISTORY: '/supplier/quotes/history',
  SUPPLIER_PRODUCTS: '/supplier/products',
  SUPPLIER_ORDERS_PENDING: '/supplier/orders/pending',
  SUPPLIER_ORDERS_ACTIVE: '/supplier/orders/active',
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
  STORE_SALES: '/store/sales',
  STORE_PROFILE: '/store/profile',
  // 兼容字段（阶段 4 暂不实现，留作占位 → SalesReport 兜底）
  STORE_INVENTORY: '/store/sales',
  STORE_SETTLEMENTS: '/store/payments',
  // update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端路由路径

  // 异常
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
