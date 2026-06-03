import type { RouteRecordRaw } from 'vue-router';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { entryRoutes } from './entry';

const Layout = () => import('/@/components/Layout/BasicLayout.vue');

export const basicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    redirect: ROUTE_PATHS.LOGIN,
    meta: { hidden: true },
  },
  {
    path: ROUTE_PATHS.LOGIN,
    name: 'Login',
    component: () => import('/@/views/login/Login.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: ROUTE_PATHS.REGISTER,
    name: 'Register',
    component: () => import('/@/views/register/Register.vue'),
    meta: { title: '注册', hidden: true },
  },
  {
    path: ROUTE_PATHS.FORGET_PASSWORD,
    name: 'ForgetPassword',
    component: () => import('/@/views/forget-password/ForgetPassword.vue'),
    meta: { title: '忘记密码', hidden: true },
  },
  {
    path: ROUTE_PATHS.APPLY_SUPPLIER,
    name: 'SupplierApply',
    component: () => import('/@/views/apply/SupplierApply.vue'),
    meta: { title: '供应商入驻申请', hidden: true },
  },
  {
    path: ROUTE_PATHS.APPLY_STORE,
    name: 'StoreApply',
    component: () => import('/@/views/apply/StoreApply.vue'),
    meta: { title: '门店入驻申请', hidden: true },
  },
  {
    path: ROUTE_PATHS.APPLY_RESULT,
    name: 'ApplyResult',
    component: () => import('/@/views/apply/ApplyResult.vue'),
    meta: { title: '提交成功', hidden: true },
  },
  {
    path: ROUTE_PATHS.CLAIM_ONBOARDING,
    name: 'ClaimOnboarding',
    component: () => import('/@/views/apply/ClaimOnboarding.vue'),
    meta: { title: '认领入驻申请', hidden: true },
  },
  entryRoutes,
  {
    path: '/b2b/admin/supplier/:id',
    name: 'AdminSupplierDetail',
    component: Layout,
    meta: { roles: ['ADMIN'], requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminSupplierDetailContent',
        component: () => import('/@/views/admin/SupplierDetail.vue'),
        meta: { title: '供应商入驻详情', icon: 'UserCheck', hideInMenu: true },
      },
    ],
  },
  {
    path: '/b2b/admin/store/:id',
    name: 'AdminStoreDetail',
    component: Layout,
    meta: { roles: ['ADMIN'], requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminStoreDetailContent',
        component: () => import('/@/views/admin/StoreDetail.vue'),
        meta: { title: '门店入驻详情', icon: 'Store', hideInMenu: true },
      },
    ],
  },
  {
    path: ROUTE_PATHS.ADMIN_STORE_ORDER_DETAIL,
    name: 'AdminStoreOrderDetail',
    component: Layout,
    meta: { roles: ['ADMIN'], requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminStoreOrderDetailContent',
        component: () => import('/@/views/admin/StoreOrderDetail.vue'),
        meta: { title: '订单详情', hideInMenu: true },
      },
    ],
  },
  {
    path: ROUTE_PATHS.ADMIN_COLLECTIVE_DETAIL,
    name: 'AdminCollectiveDetail',
    component: Layout,
    meta: { roles: ['ADMIN'], requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminCollectiveDetailContent',
        component: () => import('/@/views/admin/CollectiveDetail.vue'),
        meta: { title: '集采单详情', hideInMenu: true, authCode: 'b2b:collective:detail' },
      },
    ],
  },
  {
    path: ROUTE_PATHS.ADMIN_DELIVERY_DETAIL,
    name: 'AdminDeliveryDetail',
    component: Layout,
    meta: { roles: ['ADMIN'], requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminDeliveryDetailContent',
        component: () => import('/@/views/delivery/DeliveryDetail.vue'),
        meta: { title: '发货单详情', hideInMenu: true, authCode: 'b2b:delivery:detail' },
      },
    ],
  },
  {
    path: ROUTE_PATHS.SUPPLIER_ORDER_DETAIL,
    name: 'SupplierOrderDetail',
    component: Layout,
    meta: { roles: ['SUPPLIER'], requiresAuth: true },
    children: [
      {
        path: '',
        name: 'SupplierOrderDetailContent',
        component: () => import('/@/views/admin/CollectiveDetail.vue'),
        meta: { title: '集采单详情', hideInMenu: true, authCode: 'b2b:collective:detail' },
      },
    ],
  },
  {
    path: ROUTE_PATHS.SUPPLIER_SHIPMENT_DETAIL,
    name: 'SupplierShipmentDetail',
    component: Layout,
    meta: { roles: ['SUPPLIER'], requiresAuth: true },
    children: [
      {
        path: '',
        name: 'SupplierShipmentDetailContent',
        component: () => import('/@/views/delivery/DeliveryDetail.vue'),
        meta: { title: '发货单详情', hideInMenu: true, authCode: 'b2b:supplier:delivery' },
      },
    ],
  },
  {
    path: '/b2b/store/orders/:id',
    name: 'StoreOrderDetail',
    component: Layout,
    meta: { roles: ['STORE'], requiresAuth: true },
    children: [
      {
        path: '',
        name: 'StoreOrderDetailContent',
        component: () => import('/@/views/store/OrderDetail.vue'),
        meta: { title: '订单详情', hideInMenu: true },
      },
    ],
  },
  {
    path: '/b2b/store/catalog/:id',
    name: 'StoreCatalogDetail',
    component: Layout,
    meta: { roles: ['STORE'], requiresAuth: true },
    children: [
      {
        path: '',
        name: 'StoreCatalogDetailContent',
        component: () => import('/@/views/store/ProductDetail.vue'),
        meta: { title: '商品详情', hideInMenu: true },
      },
    ],
  },
  {
    path: ROUTE_PATHS.NOT_FOUND,
    name: 'NotFound',
    component: () => import('/@/views/exception/404.vue'),
    meta: { title: '页面不存在', hidden: true },
  },
  {
    path: ROUTE_PATHS.FORBIDDEN,
    name: 'Forbidden',
    component: () => import('/@/views/exception/403.vue'),
    meta: { title: '无权访问', hidden: true },
  },
];
