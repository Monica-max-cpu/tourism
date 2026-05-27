import type { RouteRecordRaw } from 'vue-router';
import { ROUTE_PATHS } from '/@/constants/routePaths';

const Layout = () => import('/@/components/Layout/BasicLayout.vue');

export const adminRoutes: RouteRecordRaw = {
  path: '/admin',
  component: Layout,
  redirect: ROUTE_PATHS.ADMIN_WORKBENCH,
  meta: { roles: ['ADMIN'], requiresAuth: true },
  children: [
    {
      path: 'workbench',
      name: 'AdminWorkbench',
      // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】admin 工作台升级为 Dashboard（含 ECharts 图表）
      component: () => import('/@/views/workbench/AdminDashboard.vue'),
      // update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】admin 工作台升级为 Dashboard
      meta: { title: 'B2B 工作台', icon: 'LayoutDashboard' },
    },
    { path: 'suppliers', name: 'AdminSuppliers', component: () => import('/@/views/admin/SupplierReview.vue'), meta: { title: '供应商审核', authCode: 'b2b:supplier:review' } },
    { path: 'stores', name: 'AdminStores', component: () => import('/@/views/admin/StoreReview.vue'), meta: { title: '门店审核', authCode: 'b2b:store:review' } },
    { path: 'quotes', name: 'AdminQuotes', component: () => import('/@/views/admin/QuoteReview.vue'), meta: { title: '供应商报价审核', authCode: 'b2b:quote:review' } },
    { path: 'catalogs', name: 'AdminCatalogs', component: () => import('/@/views/admin/CatalogManage.vue'), meta: { title: '平台商品目录', authCode: 'b2b:catalog:edit' } },
    { path: 'stocks', name: 'AdminStocks', component: () => import('/@/views/admin/StockManage.vue'), meta: { title: '库存管理' } },
    { path: 'store-orders', name: 'AdminStoreOrders', component: () => import('/@/views/admin/StoreOrderManage.vue'), meta: { title: '门店采购订单' } },
    { path: 'payments/pending', name: 'AdminPaymentsPending', component: () => import('/@/views/admin/PaymentManage.vue'), meta: { title: '待确认收款', authCode: 'b2b:payment:confirm' } },
    { path: 'collective/pending-orders', name: 'AdminCollectivePending', component: () => import('/@/views/admin/CollectivePending.vue'), meta: { title: '待集采订单', authCode: 'b2b:collective:trigger' } },
    { path: 'collective/orders', name: 'AdminCollectiveOrders', component: () => import('/@/views/admin/CollectiveOrders.vue'), meta: { title: '集采单列表' } },
    { path: 'collective/config', name: 'AdminCollectiveConfig', component: () => import('/@/views/admin/CollectiveConfig.vue'), meta: { title: '集采触发配置', authCode: 'b2b:collective:config' } },
    { path: 'deliveries', name: 'AdminDeliveries', component: () => import('/@/views/admin/DeliveryManage.vue'), meta: { title: '履约管理' } },
    { path: 'settlements/stores', name: 'AdminSettlementsStores', component: () => import('/@/views/admin/SettlementStores.vue'), meta: { title: '门店结算' } },
    { path: 'settlements/suppliers', name: 'AdminSettlementsSuppliers', component: () => import('/@/views/admin/SettlementSuppliers.vue'), meta: { title: '供应商结算' } },
    { path: 'profits', name: 'AdminProfits', component: () => import('/@/views/admin/ProfitRecords.vue'), meta: { title: '利润记录', authCode: 'b2b:profit:view' } },
    { path: 'system/users', name: 'AdminSystemUsers', component: () => import('/@/views/system/user/UserManage.vue'), meta: { title: '用户管理', authCode: 'system:user:list' } },
    { path: 'system/roles', name: 'AdminSystemRoles', component: () => import('/@/views/system/role/RoleManage.vue'), meta: { title: '角色管理', authCode: 'system:role:list' } },
    { path: 'system/menus', name: 'AdminSystemMenus', component: () => import('/@/views/system/menu/MenuManage.vue'), meta: { title: '菜单管理', authCode: 'system:menu:list' } },
  ],
};

// update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商端 10 模块路由
export const supplierRoutes: RouteRecordRaw = {
  path: '/supplier',
  component: Layout,
  redirect: ROUTE_PATHS.SUPPLIER_WORKBENCH,
  meta: { roles: ['SUPPLIER'], requiresAuth: true },
  children: [
    {
      path: 'workbench',
      name: 'SupplierWorkbench',
      // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】supplier 工作台升级为 Dashboard
      component: () => import('/@/views/workbench/SupplierDashboard.vue'),
      // update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】supplier 工作台升级为 Dashboard
      meta: { title: '供应商工作台', icon: 'LayoutDashboard' },
    },
    { path: 'quotes/manage', name: 'SupplierQuoteManage', component: () => import('/@/views/supplier/QuoteManage.vue'), meta: { title: '报价管理', authCode: 'b2b:supplier:quote' } },
    { path: 'quotes/history', name: 'SupplierQuoteHistory', component: () => import('/@/views/supplier/QuoteHistory.vue'), meta: { title: '报价历史' } },
    { path: 'products', name: 'SupplierProducts', component: () => import('/@/views/supplier/ProductLibrary.vue'), meta: { title: '商品库', authCode: 'b2b:supplier:product' } },
    { path: 'product/create', name: 'SupplierProductCreate', component: () => import('/@/views/supplier/ProductForm.vue'), meta: { title: '新建商品', hideInMenu: true, authCode: 'b2b:supplier:product' } },
    { path: 'product/:id/edit', name: 'SupplierProductEdit', component: () => import('/@/views/supplier/ProductForm.vue'), meta: { title: '编辑商品', hideInMenu: true, authCode: 'b2b:supplier:product' } },
    { path: 'orders/pending', name: 'SupplierOrderPending', component: () => import('/@/views/supplier/OrderPending.vue'), meta: { title: '待确认集采单' } },
    { path: 'orders/active', name: 'SupplierOrderActive', component: () => import('/@/views/supplier/OrderActive.vue'), meta: { title: '进行中集采单' } },
    { path: 'warehouses', name: 'SupplierWarehouses', component: () => import('/@/views/supplier/WarehouseManage.vue'), meta: { title: '仓库管理' } },
    { path: 'inventory', name: 'SupplierInventory', component: () => import('/@/views/supplier/MyInventory.vue'), meta: { title: '我的库存', authCode: 'b2b:supplier:stock' } },
    { path: 'shipments', name: 'SupplierShipments', component: () => import('/@/views/supplier/ShipmentManage.vue'), meta: { title: '发货管理', authCode: 'b2b:supplier:delivery' } },
    { path: 'settlements', name: 'SupplierSettlements', component: () => import('/@/views/supplier/MySettlement.vue'), meta: { title: '我的结算' } },
    { path: 'profile', name: 'SupplierProfile', component: () => import('/@/views/supplier/Profile.vue'), meta: { title: '企业资料' } },
  ],
};
// update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商端 10 模块路由

export const storeRoutes: RouteRecordRaw = {
  path: '/store',
  component: Layout,
  redirect: ROUTE_PATHS.STORE_WORKBENCH,
  meta: { roles: ['STORE'], requiresAuth: true },
  children: [
    {
      path: 'workbench',
      name: 'StoreWorkbench',
      // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段5】store 工作台升级为 Dashboard
      component: () => import('/@/views/workbench/StoreDashboard.vue'),
      // update-end--author:claude---date:2026-05-24---for:【B2B-阶段5】store 工作台升级为 Dashboard
      meta: { title: '门店工作台', icon: 'LayoutDashboard' },
    },
    // update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端 7 模块路由替换
    { path: 'procurement', name: 'StoreProcurement', component: () => import('/@/views/store/Procurement.vue'), meta: { title: '商品采购', authCode: 'b2b:store:catalog' } },
    { path: 'catalog/:id', name: 'StoreCatalogDetail', component: () => import('/@/views/store/ProductDetail.vue'), meta: { title: '商品详情', hideInMenu: true } },
    { path: 'cart', name: 'StoreCart', component: () => import('/@/views/store/Cart.vue'), meta: { title: '购物车', authCode: 'b2b:store:order' } },
    { path: 'orders', name: 'StoreOrders', component: () => import('/@/views/store/MyOrders.vue'), meta: { title: '我的采购订单' } },
    { path: 'orders/:id', name: 'StoreOrderDetail', component: () => import('/@/views/store/OrderDetail.vue'), meta: { title: '订单详情', hideInMenu: true } },
    { path: 'payments', name: 'StorePayments', component: () => import('/@/views/store/MyPayments.vue'), meta: { title: '我的付款记录', authCode: 'b2b:store:payment' } },
    { path: 'profile', name: 'StoreProfile', component: () => import('/@/views/store/Profile.vue'), meta: { title: '门店资料' } },
    // update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店端 7 模块路由替换
  ],
};
