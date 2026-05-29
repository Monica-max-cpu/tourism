# 项目页面路径清单

## 平台管理员 Admin

### 一级菜单（menu_type=0，parent_id 为空）

| 层级 | 菜单名 | URL | Component | Icon |
|---|---|---|---|---|
| 一级 | B2B 工作台 | /admin/workbench | workbench/AdminDashboard | LayoutDashboard |
| 一级 | 入驻管理 | /admin/entry | layouts/default/index | UserCheck |
| 一级 | 商品与报价 | /admin/goods | layouts/default/index | Package |
| 一级 | 库存管理 | /admin/stocks | admin/StockManage | Boxes |
| 一级 | 门店采购订单 | /admin/store-orders | admin/StoreOrderManage | ShoppingCart |
| 一级 | 支付管理 | /admin/payments/pending | admin/PaymentManage | CreditCard |
| 一级 | 集采管理 | /admin/collective | layouts/default/index | GitMerge |
| 一级 | 履约管理 | /admin/deliveries | admin/DeliveryManage | Truck |
| 一级 | 结算管理 | /admin/settlement | layouts/default/index | Wallet |
| 一级 | 系统管理 | /admin/system | layouts/default/index | Settings |

### 二级菜单（menu_type=1，parent_id 指向上级）

| 父级 | 菜单名 | URL | Component |
|---|---|---|---|
| 入驻管理 | 供应商审核 | /admin/suppliers | admin/SupplierReview |
| 入驻管理 | 门店审核 | /admin/stores | admin/StoreReview |
| 商品与报价 | 供应商报价审核 | /admin/quotes | admin/QuoteReview |
| 商品与报价 | 平台商品目录 | /admin/catalogs | admin/CatalogManage |
| 集采管理 | 待集采订单 | /admin/collective/pending-orders | admin/CollectivePending |
| 集采管理 | 集采单列表 | /admin/collective/orders | admin/CollectiveOrders |
| 集采管理 | 触发配置 | /admin/collective/config | admin/CollectiveConfig |
| 结算管理 | 门店结算 | /admin/settlements/stores | admin/SettlementStores |
| 结算管理 | 供应商结算 | /admin/settlements/suppliers | admin/SettlementSuppliers |
| 结算管理 | 利润记录 | /admin/profits | admin/ProfitRecords |
| 系统管理 | 用户管理 | /admin/system/users | system/user/UserManage |
| 系统管理 | 角色管理 | /admin/system/roles | system/role/RoleManage |
| 系统管理 | 菜单管理 | /admin/system/menus | system/menu/MenuManage |

### 隐藏路由（hidden=true，不显示在菜单，但路由需要）

| URL | Component |
|---|---|
| /admin/catalog/create | admin/CatalogForm |
| /admin/catalog/:id/edit | admin/CatalogForm |

---

## 供应商 Supplier

| 层级 | 菜单名 | URL | Component | Icon |
|---|---|---|---|---|
| 一级 | 供应商工作台 | /supplier/workbench | workbench/SupplierDashboard | LayoutDashboard |
| 一级 | 商品库 | /supplier/products | supplier/ProductLibrary | Package |
| 一级 | 报价管理 | /supplier/quotes | layouts/default/index | Tags |
| 一级 | 集采订单 | /supplier/orders | layouts/default/index | GitMerge |
| 一级 | 仓库管理 | /supplier/warehouses | supplier/WarehouseManage | Warehouse |
| 一级 | 我的库存 | /supplier/inventory | supplier/MyInventory | Boxes |
| 一级 | 发货管理 | /supplier/shipments | supplier/ShipmentManage | Truck |
| 一级 | 我的结算 | /supplier/settlements | supplier/MySettlement | Wallet |
| 一级 | 企业资料 | /supplier/profile | supplier/Profile | User |
| 二级 | 报价管理（子） | /supplier/quotes/manage | supplier/QuoteManage |
| 二级 | 报价历史 | /supplier/quotes/history | supplier/QuoteHistory |
| 二级 | 待确认 | /supplier/orders/pending | supplier/OrderPending |
| 二级 | 进行中 | /supplier/orders/active | supplier/OrderActive |

### 隐藏路由

| URL | Component |
|---|---|
| /supplier/quote/create | supplier/QuoteForm |
| /supplier/quote/:id/edit | supplier/QuoteForm |
| /supplier/product/create | supplier/ProductForm |
| /supplier/product/:id/edit | supplier/ProductForm |

---

## 门店 Store

| 层级 | 菜单名 | URL | Component | Icon |
|---|---|---|---|---|
| 一级 | 门店工作台 | /store/workbench | workbench/StoreDashboard | LayoutDashboard |
| 一级 | 商品采购 | /store/procurement | store/Procurement | ShoppingBag |
| 一级 | 购物车 | /store/cart | store/Cart | ShoppingCart |
| 一级 | 我的采购订单 | /store/orders | store/MyOrders | ClipboardList |
| 一级 | 我的付款记录 | /store/payments | store/MyPayments | CreditCard |
| 一级 | 门店资料 | /store/profile | store/Profile | Building2 |

### 隐藏路由

| URL | Component |
|---|---|
| /store/orders/:id | store/OrderDetail |
| /store/catalog/:id | store/ProductDetail |
