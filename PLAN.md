# 商家入驻与角色体系前端改造计划

## 背景

后端已完成入驻改造（`b2b-merchant-onboarding-permission-delivery.md`），需要前端配合：

1. 审核通过后不再创建新账号，改为给现有 `sys_user` 加 `b2b_supplier`/`b2b_store` 角色
2. 入驻字段扩展（银行、资质、店铺类别等）
3. 状态拆分为 `reviewStatus`（审核）和 `operationStatus`（运营）
4. 入驻需要登录用户身份提交

同时项目刚迁移到 BACK 权限模式，需要处理无 B2B 角色用户的入口问题。

---

## 总体架构

```
公开入驻页 (/apply/*)          登录后入驻 (/entry/b2b)
      ↓                              ↓
  收集意向线索                   正式申请（绑定角色）
      ↓                              ↓
  管理员审核 ←─────────────────── 管理员审核
      ↓                              ↓
  无后续操作                    后端自动加角色 → 重新登录 → 供应商/门店菜单
```

**用户角色流**：
```
无角色用户 → BASIC_USER → /entry/b2b
  → 申请供应商 → 审核通过 → 下次登录 → SUPPLIER → /supplier/workbench
  → 申请门店   → 审核通过 → 下次登录 → STORE    → /store/workbench
```

**Entry 页结构**：
```
/entry → BasicLayout
  ├── /entry/b2b → EntryPage（B2B 入驻审核进度 + 申请入口）
  └── /entry/b2c → B2CPage（占位，后续实现）
```

---

## 执行步骤

### Step 1: 类型系统改造

**改 `types/user.d.ts`**：加 `BASIC_USER`
```typescript
type UserRole = 'ADMIN' | 'SUPPLIER' | 'STORE' | 'BASIC_USER';
```

**改 `types/b2b.d.ts`**：加新类型、更新接口
- 新增类型：`ReviewStatus`(0/1/2)、`OperationStatus`(0/1)、`SupplierStoreType`(1/2/3)、`MerchantType`、`BindStatus`
- `SupplierApply` 加：`authType`、`logoId`、`storeType`(supplier)、`mainCategory`、`bankAccount`、`bankName`、`bankNo`、`description`、`storePhotos`、`mapAddress`、`coordinate`、`reviewStatus`、`operationStatus`
- `StoreApply` 加：相同字段（去除 storeType，已有）
- 加 `UserApplicationStatus` 接口：查询当前用户申请状态

**改 `src/constants/userRoles.ts`**：加 `BASIC_USER` 的 label 和 option

### Step 2: 登录逻辑修复

**改 `src/api/login/api.ts` — `resolveRole()`**：
```typescript
// 兜底从 'ADMIN' 改为 'BASIC_USER'
return 'BASIC_USER';  // was 'ADMIN'
```

**改 `src/api/login/api.ts` — `resolvePermissions()`**：
```typescript
// BASIC_USER 权限为空
if (role === 'ADMIN') return [...];
return [];  // BASIC_USER gets empty permissions
```

**改 `src/router/guard.ts` — `ROLE_HOME`**：加 `BASIC_USER: '/entry/b2b'`

**改 `src/views/login/Login.vue` — `ROLE_HOME`**：同上

**改 `src/views/exception/403.vue` — `ROLE_HOME`**：同上

**改 `src/constants/routePaths.ts`**：加 `ENTRY: '/entry'`、`ENTRY_B2B: '/entry/b2b'`、`ENTRY_B2C: '/entry/b2c'`、`ENTRY_APPLY_SUPPLIER: '/entry/apply/supplier'`、`ENTRY_APPLY_STORE: '/entry/apply/store'`

### Step 3: 登录页加注册入口

**改 `src/views/login/Login.vue`**：在登录按钮下方、演示账号文字上方，加"还没有账号？注册账号"链接

```
登录按钮
  ↓
还没有账号？注册账号 ← 新增
  ↓
演示账号：admin / supplier / store
  ↓
还不是合作伙伴？申请供应商入驻 · 申请门店入驻
```

注册链接点击后跳转到注册页面（需后端配合实现注册流程，前期可先跳公开展入驻页或占位提示）。

### Step 4: 创建 Entry 入口页（带侧边栏 B2B + B2C）

**新建 `src/router/routes/entry.ts`**：entry 路由，BasicLayout 包裹两个子路由
```typescript
{
  path: '/entry',
  component: Layout,
  redirect: '/entry/b2b',
  children: [
    { path: 'b2b', name: 'EntryB2B', component: EntryPage, meta: { title: 'B2B 入驻' } },
    { path: 'b2c', name: 'EntryB2C', component: B2CPage, meta: { title: 'B2C 入驻' } },
  ],
}
```

**新建 `src/views/entry/EntryPage.vue`**：B2B 入驻页
- **审核进度条**：Supplier 和 Store 各一条
  - 阶段：未申请 → 已提交 → 审核中 → 通过/拒绝
  - 当前阶段高亮，已完成阶段打勾
  - 审核中显示加载动画，通过显示绿色，拒绝显示红色+原因
- 未申请 → "申请成为供应商/门店"按钮
- 已通过 → "审核通过，请重新登录"提示按钮
- 已拒绝 → 显示拒绝原因 + "重新申请"按钮

**新建 `src/views/entry/B2CPage.vue`**：占位页（B2C 入驻后续实现）

**新建 `src/api/b2b/entry.ts`**：`getUserApplicationStatusApi()` 查询当前用户绑定状态

**改 `src/router/routes/basic.ts`**：引入并注册 entryRoutes

### Step 5: 入驻表单双模式改造

**改 `src/views/apply/SupplierApply.vue`**：
- 引入 `useUserStore`，判断 `isLoggedIn`
- 公开模式和登录模式**使用相同的完整字段**（银行信息、店铺类别、企业描述、照片、地图位置）
- 唯一区别：提交后的跳转路径不同
  - 已登录 → 跳回 `/entry/b2b`
  - 未登录 → 跳 `/apply/result`

**改 `src/views/apply/StoreApply.vue`**：同上逻辑

**改 `src/mocks/apply.mock.ts`**：更新参数类型和 mock 数据

### Step 6: 审核页面适配

**改 `src/views/admin/SupplierReview.vue`**：
- 状态列替换为 `reviewStatus` + `operationStatus` 双徽章
- 详情弹窗新增字段分区展示（基础信息、银行信息、经营信息）
- 停用/启用改为操作 `operationStatus`，不影响 `reviewStatus`

**改 `src/views/admin/StoreReview.vue`**：同上

**改 `src/constants/b2bStatus.ts`**（或新建）：加 `ReviewStatus` 和 `OperationStatus` 的 label/variant 映射

### Step 7: 路由收尾

- WHITE_LIST 不变（公开入驻仍可访问）
- entry 路由有 `meta.roles` 限制 → 守卫会拦截非 BASIC_USER 角色访问

### Step 8: 数据库菜单（配合后端）

后端 `sys_permission` 表加入口页菜单 + `PAGES.md` 中的全部菜单数据，`sys_role_permission` 关联角色。

---

## 修改文件清单

| 文件 | 操作 | 步骤 |
|---|---|---|
| `types/user.d.ts` | 改 | 1 |
| `types/b2b.d.ts` | 改 | 1 |
| `src/constants/userRoles.ts` | 改 | 1 |
| `src/constants/routePaths.ts` | 改 | 2 |
| `src/constants/b2bStatus.ts` | 改 | 6 |
| `src/api/login/api.ts` | 改 | 2 |
| `src/api/b2b/apply.ts` | 改 | 5 |
| `src/api/b2b/entry.ts` | 新建 | 4 |
| `src/router/guard.ts` | 改 | 2 |
| `src/router/routes/basic.ts` | 改 | 4 |
| `src/router/routes/entry.ts` | 新建 | 4 |
| `src/views/login/Login.vue` | 改 | 2,3 |
| `src/views/exception/403.vue` | 改 | 2 |
| `src/views/apply/SupplierApply.vue` | 改 | 5 |
| `src/views/apply/StoreApply.vue` | 改 | 5 |
| `src/views/entry/EntryPage.vue` | 新建 | 4 |
| `src/views/entry/B2CPage.vue` | 新建 | 4 |
| `src/views/admin/SupplierReview.vue` | 改 | 6 |
| `src/views/admin/StoreReview.vue` | 改 | 6 |
| `src/mocks/login.mock.ts` | 改 | 2 |
| `src/mocks/apply.mock.ts` | 改 | 5 |
| `src/mocks/entry.mock.ts` | 新建 | 4 |

---

## 验证方法

1. 登录页能看到注册入口 + 底部入驻链接
2. 公开入驻 → 未登录访问 `/apply/supplier` → 完整表单 → 提交成功 → 跳转结果页
3. 无角色用户登录 → 跳转 `/entry/b2b` → 进度条未申请 → 点申请 → 填完整表单 → 提交 → 回到 entry 进度条更新为"审核中"
4. admin 审核通过 → 用户重新登录 → 跳转 `/supplier/workbench` → 侧边栏显示供应商菜单
5. admin 审核页查看详情 → 显示 reviewStatus + operationStatus 双徽章 + 新增字段
