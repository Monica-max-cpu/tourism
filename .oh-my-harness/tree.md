# Tree

Use this file for navigation only. Verify implementation details by reading source files directly.

- Source: `git ls-files --cached --others --exclude-standard`
- Entries: 254

```text
./
├── .agents/
│   └── skills/
│       ├── harness/
│       │   ├── agents/
│       │   │   └── openai.yaml
│       │   ├── refs/
│       │   │   ├── local-review.md
│       │   │   ├── visual-display.md
│       │   │   └── writing-plan.md
│       │   └── SKILL.md
│       ├── receiving-code-review/
│       │   └── SKILL.md
│       ├── systematic-debugging/
│       │   ├── condition-based-waiting-example.ts
│       │   ├── condition-based-waiting.md
│       │   ├── CREATION-LOG.md
│       │   ├── defense-in-depth.md
│       │   ├── find-polluter.sh
│       │   ├── LICENSE.upstream
│       │   ├── root-cause-tracing.md
│       │   ├── SKILL.md
│       │   ├── test-academic.md
│       │   ├── test-pressure-1.md
│       │   ├── test-pressure-2.md
│       │   └── test-pressure-3.md
│       └── tdd/
│           ├── LICENSE.upstream
│           ├── mocking.md
│           ├── SKILL.md
│           └── tests.md
├── .codex/
│   ├── hooks/
│   │   └── tree.mjs
│   └── hooks.json
├── .github/
│   ├── PULL_REQUEST_TEMPLATE/
│   │   ├── implementation.md
│   │   └── research.md
│   ├── codex-review-comment.md
│   └── writing-plan.md
├── docs/
│   └── specs/
│       ├── agent-workflow.md
│       └── review-guidelines.md
├── src/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── dashboard.ts
│   │   │   ├── fulfillment.ts
│   │   │   ├── index.ts
│   │   │   └── operations.ts
│   │   ├── b2b/
│   │   │   ├── apply.ts
│   │   │   └── entry.ts
│   │   ├── common/
│   │   │   └── dict.ts
│   │   ├── login/
│   │   │   ├── api.ts
│   │   │   └── model.ts
│   │   ├── store/
│   │   │   ├── catalog.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── order.ts
│   │   │   ├── payment.ts
│   │   │   └── sales.ts
│   │   ├── supplier/
│   │   │   ├── dashboard.ts
│   │   │   ├── inventory.ts
│   │   │   ├── order.ts
│   │   │   ├── quote.ts
│   │   │   ├── shipment.ts
│   │   │   └── warehouse.ts
│   │   ├── sys/
│   │   │   └── menu.ts
│   │   ├── system/
│   │   │   ├── _helpers.ts
│   │   │   ├── dict.ts
│   │   │   ├── menu.ts
│   │   │   ├── role.ts
│   │   │   └── user.ts
│   │   └── http.ts
│   ├── components/
│   │   ├── BasicModal/
│   │   │   ├── BasicModal.vue
│   │   │   ├── index.ts
│   │   │   └── useModal.ts
│   │   ├── BasicTable/
│   │   │   ├── BasicTable.vue
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── useTable.ts
│   │   ├── ECharts/
│   │   │   ├── themes/
│   │   │   │   └── light.ts
│   │   │   ├── BasicChart.vue
│   │   │   ├── index.ts
│   │   │   └── useChart.ts
│   │   ├── Layout/
│   │   │   ├── BasicLayout.vue
│   │   │   ├── Header.vue
│   │   │   ├── MenuItemRenderer.vue
│   │   │   └── Sider.vue
│   │   ├── PageWrapper/
│   │   │   ├── index.ts
│   │   │   └── PageWrapper.vue
│   │   ├── SearchBar/
│   │   │   ├── index.ts
│   │   │   └── SearchBar.vue
│   │   ├── TableAction/
│   │   │   ├── index.ts
│   │   │   └── TableAction.vue
│   │   ├── ui/
│   │   │   ├── Avatar/
│   │   │   │   ├── Avatar.vue
│   │   │   │   ├── AvatarFallback.vue
│   │   │   │   ├── AvatarImage.vue
│   │   │   │   └── index.ts
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.vue
│   │   │   │   └── index.ts
│   │   │   ├── Button/
│   │   │   │   ├── Button.vue
│   │   │   │   └── index.ts
│   │   │   ├── Card/
│   │   │   │   ├── Card.vue
│   │   │   │   ├── CardContent.vue
│   │   │   │   ├── CardDescription.vue
│   │   │   │   ├── CardFooter.vue
│   │   │   │   ├── CardHeader.vue
│   │   │   │   ├── CardTitle.vue
│   │   │   │   └── index.ts
│   │   │   ├── Dialog/
│   │   │   │   ├── Dialog.vue
│   │   │   │   ├── DialogContent.vue
│   │   │   │   ├── DialogDescription.vue
│   │   │   │   ├── DialogFooter.vue
│   │   │   │   ├── DialogHeader.vue
│   │   │   │   ├── DialogTitle.vue
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   │   ├── index.ts
│   │   │   │   └── Input.vue
│   │   │   ├── Label/
│   │   │   │   ├── index.ts
│   │   │   │   └── Label.vue
│   │   │   ├── Select/
│   │   │   │   ├── constants.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── Select.vue
│   │   │   │   ├── SelectContent.vue
│   │   │   │   ├── SelectItem.vue
│   │   │   │   ├── SelectTrigger.vue
│   │   │   │   └── SelectValue.vue
│   │   │   ├── Separator/
│   │   │   │   ├── index.ts
│   │   │   │   └── Separator.vue
│   │   │   ├── Switch/
│   │   │   │   ├── index.ts
│   │   │   │   └── Switch.vue
│   │   │   ├── Tabs/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Tabs.vue
│   │   │   │   ├── TabsContent.vue
│   │   │   │   ├── TabsList.vue
│   │   │   │   └── TabsTrigger.vue
│   │   │   └── index.ts
│   │   └── MapLocationPicker.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   └── usePermission.ts
│   ├── constants/
│   │   ├── b2b2bStatus.ts
│   │   ├── b2b2cStatus.ts
│   │   ├── b2bStatus.ts
│   │   ├── routePaths.ts
│   │   ├── storeStatus.ts
│   │   ├── supplierStatus.ts
│   │   └── userRoles.ts
│   ├── directives/
│   │   └── auth.ts
│   ├── enums/
│   │   └── appEnum.ts
│   ├── mocks/
│   │   └── _helpers.ts
│   ├── router/
│   │   ├── helper/
│   │   │   ├── menuHelper.ts
│   │   │   ├── routeHelper.ts
│   │   │   └── types.ts
│   │   ├── routes/
│   │   │   ├── basic.ts
│   │   │   ├── business.ts
│   │   │   └── entry.ts
│   │   ├── constant.ts
│   │   ├── guard.ts
│   │   ├── index.ts
│   │   └── menus.ts
│   ├── stores/
│   │   ├── modules/
│   │   │   ├── app.ts
│   │   │   ├── cart.ts
│   │   │   ├── permission.ts
│   │   │   └── user.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── index.less
│   │   └── theme.less
│   ├── utils/
│   │   ├── helper/
│   │   │   └── treeHelper.ts
│   │   ├── auth.ts
│   │   ├── cn.ts
│   │   └── format.ts
│   ├── views/
│   │   ├── _placeholder/
│   │   │   └── Placeholder.vue
│   │   ├── admin/
│   │   │   ├── CatalogForm.vue
│   │   │   ├── CatalogManage.vue
│   │   │   ├── CollectiveConfig.vue
│   │   │   ├── CollectiveOrders.vue
│   │   │   ├── CollectivePending.vue
│   │   │   ├── DeliveryManage.vue
│   │   │   ├── PaymentManage.vue
│   │   │   ├── ProfitRecords.vue
│   │   │   ├── QuoteReview.vue
│   │   │   ├── SettlementStores.vue
│   │   │   ├── SettlementSuppliers.vue
│   │   │   ├── StockManage.vue
│   │   │   ├── StoreDetail.vue
│   │   │   ├── StoreOrderManage.vue
│   │   │   ├── StoreReview.vue
│   │   │   ├── SupplierDetail.vue
│   │   │   └── SupplierReview.vue
│   │   ├── apply/
│   │   │   ├── ApplyResult.vue
│   │   │   ├── ApplyShell.vue
│   │   │   ├── ClaimOnboarding.vue
│   │   │   ├── StoreApply.vue
│   │   │   └── SupplierApply.vue
│   │   ├── entry/
│   │   │   ├── B2CPage.vue
│   │   │   └── EntryPage.vue
│   │   ├── exception/
│   │   │   ├── 403.vue
│   │   │   └── 404.vue
│   │   ├── forget-password/
│   │   │   └── ForgetPassword.vue
│   │   ├── login/
│   │   │   └── Login.vue
│   │   ├── register/
│   │   │   └── Register.vue
│   │   ├── store/
│   │   │   ├── Cart.vue
│   │   │   ├── MyOrders.vue
│   │   │   ├── MyPayments.vue
│   │   │   ├── OrderDetail.vue
│   │   │   ├── Procurement.vue
│   │   │   ├── ProductDetail.vue
│   │   │   └── Profile.vue
│   │   ├── supplier/
│   │   │   ├── MyInventory.vue
│   │   │   ├── MySettlement.vue
│   │   │   ├── OrderActive.vue
│   │   │   ├── OrderPending.vue
│   │   │   ├── ProductForm.vue
│   │   │   ├── ProductLibrary.vue
│   │   │   ├── Profile.vue
│   │   │   ├── QuoteForm.vue
│   │   │   ├── QuoteHistory.vue
│   │   │   ├── QuoteManage.vue
│   │   │   ├── ShipmentManage.vue
│   │   │   └── WarehouseManage.vue
│   │   ├── sys/
│   │   │   ├── iframe/
│   │   │   │   └── FrameBlank.vue
│   │   │   └── RouteView.vue
│   │   ├── system/
│   │   │   ├── dict/
│   │   │   │   └── DictManage.vue
│   │   │   ├── menu/
│   │   │   │   └── MenuManage.vue
│   │   │   ├── role/
│   │   │   │   ├── components/
│   │   │   │   │   ├── permissionTree.ts
│   │   │   │   │   └── RolePermissionModal.vue
│   │   │   │   └── RoleManage.vue
│   │   │   └── user/
│   │   │       └── UserManage.vue
│   │   └── workbench/
│   │       ├── AdminDashboard.vue
│   │       ├── AdminWorkbench.vue
│   │       ├── StoreDashboard.vue
│   │       ├── StoreWorkbench.vue
│   │       ├── SupplierDashboard.vue
│   │       └── SupplierWorkbench.vue
│   ├── App.vue
│   └── main.ts
├── tests/
│   ├── __tests__/
│   │   └── merchant-onboarding.spec.ts
│   ├── api/
│   │   └── system/
│   │       └── __tests__/
│   │           ├── dict.spec.ts
│   │           ├── helpers.spec.ts
│   │           └── role.spec.ts
│   └── system/
│       └── role/
│           └── __tests__/
│               └── permissionTree.spec.ts
├── types/
│   ├── api.d.ts
│   ├── b2b-2b.d.ts
│   ├── b2b-2c.d.ts
│   ├── b2b-store.d.ts
│   ├── b2b-supplier.d.ts
│   ├── b2b.d.ts
│   ├── menu.d.ts
│   ├── router.d.ts
│   ├── shims-vue.d.ts
│   ├── system.d.ts
│   └── user.d.ts
├── .env.development
├── .env.production
├── .gitignore
├── AGENTS.md
├── CONVENTIONS.md
├── index.html
├── jest.config.cjs
├── package-lock.json
├── package.json
├── PAGES.md
├── postcss.config.js
├── PROGRESS.md
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── uno.config.ts
├── vite.config.ts
└── Vue_AI开发规范.md
```
