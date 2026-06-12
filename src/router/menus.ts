/**
 * 角色菜单数据
 * 阶段 1 仅工作台落地；其它菜单为占位路径，待后续阶段实现页面。
 */
import type { MenuItem } from '/#/menu';
import { ROUTE_PATHS } from '/@/constants/routePaths';

export const adminMenus: MenuItem[] = [
  { name: 'AdminWorkbench', path: ROUTE_PATHS.ADMIN_WORKBENCH, title: 'B2B 工作台', icon: 'LayoutDashboard' },
  {
    name: 'AdminEntry',
    path: '/b2b/admin/entry',
    title: '入驻管理',
    icon: 'UserCheck',
    children: [
      { name: 'AdminSuppliers', path: ROUTE_PATHS.ADMIN_SUPPLIERS, title: '供应商审核' },
      { name: 'AdminStores', path: ROUTE_PATHS.ADMIN_STORES, title: '门店审核' },
    ],
  },
  {
    name: 'AdminGoods',
    path: '/b2b/admin/goods',
    title: '商品与报价',
    icon: 'Package',
    children: [
      { name: 'AdminQuotes', path: ROUTE_PATHS.ADMIN_QUOTES, title: '供应商报价审核' },
      { name: 'AdminCatalogs', path: ROUTE_PATHS.ADMIN_CATALOGS, title: '平台商品目录' },
    ],
  },
  {
    name: 'AdminStockManage',
    path: ROUTE_PATHS.ADMIN_STOCK_MANAGE,
    title: '库存管理',
    icon: 'Boxes',
    children: [
      { name: 'AdminStocks', path: ROUTE_PATHS.ADMIN_STOCKS, title: '库存列表' },
      { name: 'AdminStockLogs', path: ROUTE_PATHS.ADMIN_STOCK_LOGS, title: '库存流水' },
    ],
  },
  { name: 'AdminStoreOrders', path: ROUTE_PATHS.ADMIN_STORE_ORDERS, title: '门店采购订单', icon: 'ShoppingCart' },
  { name: 'AdminPayments', path: ROUTE_PATHS.ADMIN_PAYMENTS_PENDING, title: '支付管理', icon: 'CreditCard' },
  {
    name: 'AdminCollective',
    path: '/b2b/admin/collective',
    title: '集采管理',
    icon: 'GitMerge',
    children: [
      { name: 'AdminCollectivePending', path: ROUTE_PATHS.ADMIN_COLLECTIVE_PENDING, title: '待集采订单' },
      { name: 'AdminCollectiveOrders', path: ROUTE_PATHS.ADMIN_COLLECTIVE_ORDERS, title: '集采单列表' },
      { name: 'AdminCollectiveConfig', path: ROUTE_PATHS.ADMIN_COLLECTIVE_CONFIG, title: '触发配置' },
    ],
  },
  { name: 'AdminDeliveries', path: ROUTE_PATHS.ADMIN_DELIVERIES, title: '履约管理', icon: 'Truck' },
  {
    name: 'AdminSettlement',
    path: '/b2b/admin/settlement',
    title: '结算管理',
    icon: 'Wallet',
    children: [
      { name: 'AdminSettlementsStores', path: ROUTE_PATHS.ADMIN_SETTLEMENTS_STORES, title: '门店结算' },
      { name: 'AdminSettlementsSuppliers', path: ROUTE_PATHS.ADMIN_SETTLEMENTS_SUPPLIERS, title: '供应商结算' },
      { name: 'AdminProfits', path: ROUTE_PATHS.ADMIN_PROFITS, title: '利润记录' },
    ],
  },
  {
    name: 'AdminSystem',
    path: '/b2b/admin/system',
    title: '系统管理',
    icon: 'Settings',
    children: [
      { name: 'AdminSystemUsers', path: ROUTE_PATHS.ADMIN_SYSTEM_USERS, title: '用户管理', authCode: 'system:user:list' },
      { name: 'AdminSystemRoles', path: ROUTE_PATHS.ADMIN_SYSTEM_ROLES, title: '角色管理', authCode: 'system:role:list' },
      { name: 'AdminSystemMenus', path: ROUTE_PATHS.ADMIN_SYSTEM_MENUS, title: '菜单管理', authCode: 'system:menu:list' },
      { name: 'AdminSystemDicts', path: ROUTE_PATHS.ADMIN_SYSTEM_DICTS, title: '数据字典', authCode: 'system:dict:list' },
    ],
  },
];

// update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商菜单 9 模块
export const supplierMenus: MenuItem[] = [
  { name: 'SupplierWorkbench', path: ROUTE_PATHS.SUPPLIER_WORKBENCH, title: '供应商工作台', icon: 'LayoutDashboard' },
  { name: 'SupplierProducts', path: ROUTE_PATHS.SUPPLIER_PRODUCTS, title: '商品库', icon: 'Package' },
  {
    name: 'SupplierQuoteEntry',
    path: '/b2b/supplier/quotes',
    title: '报价管理',
    icon: 'Tags',
    children: [
      { name: 'SupplierQuoteManage', path: ROUTE_PATHS.SUPPLIER_QUOTES_MANAGE, title: '报价管理' },
      { name: 'SupplierQuoteHistory', path: ROUTE_PATHS.SUPPLIER_QUOTES_HISTORY, title: '报价历史' },
    ],
  },
  {
    name: 'SupplierOrderEntry',
    path: '/b2b/supplier/orders',
    title: '集采订单',
    icon: 'GitMerge',
    children: [
      { name: 'SupplierOrderPending', path: ROUTE_PATHS.SUPPLIER_ORDERS_PENDING, title: '待确认集采单' },
    ],
  },
  { name: 'SupplierWarehouses', path: ROUTE_PATHS.SUPPLIER_WAREHOUSES, title: '仓库管理', icon: 'Warehouse' },
  { name: 'SupplierInventory', path: ROUTE_PATHS.SUPPLIER_INVENTORY, title: '我的库存', icon: 'Boxes' },
  { name: 'SupplierShipments', path: ROUTE_PATHS.SUPPLIER_SHIPMENTS, title: '发货管理', icon: 'Truck' },
  { name: 'SupplierSettlements', path: ROUTE_PATHS.SUPPLIER_SETTLEMENTS, title: '我的结算', icon: 'Wallet' },
  { name: 'SupplierProfile', path: ROUTE_PATHS.SUPPLIER_PROFILE, title: '企业资料', icon: 'User' },
];
// update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商菜单 9 模块

// update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店菜单 7 模块
export const storeMenus: MenuItem[] = [
  { name: 'StoreWorkbench', path: ROUTE_PATHS.STORE_WORKBENCH, title: '门店工作台', icon: 'LayoutDashboard' },
  { name: 'StoreProcurement', path: ROUTE_PATHS.STORE_CATALOG, title: '商品采购', icon: 'ShoppingBag' },
  { name: 'StoreCart', path: ROUTE_PATHS.STORE_CART, title: '购物车', icon: 'ShoppingCart' },
  { name: 'StoreCredit', path: ROUTE_PATHS.STORE_CREDIT, title: '授信账户', icon: 'Wallet' },
  { name: 'StoreOrders', path: ROUTE_PATHS.STORE_ORDERS, title: '我的采购订单', icon: 'ClipboardList' },
  { name: 'StorePayments', path: ROUTE_PATHS.STORE_PAYMENT, title: '我的付款记录', icon: 'CreditCard' },
  { name: 'StoreProfile', path: ROUTE_PATHS.STORE_PROFILE, title: '门店资料', icon: 'Building2' },
];
// update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店菜单 7 模块
