# CONVENTIONS

> 本项目的 AI 协作上下文。所有 AI 辅助生成的代码必须遵循以下约定。
> 任何与本约定冲突的代码必须修正后再合入。

## 1. 技术栈速查
- Vue 3 + Vite + TypeScript（strict）
- `<script setup lang="ts">` + Composition API（**禁止 Options API**）
- Pinia 选项式 `defineStore({ id, state, getters, actions })`
- vue-router 4
- Axios 封装为 VAxios（`defHttp.get/post<T>()`）
- Tailwind v3 + UnoCSS preset-wind3 + Less（三层共存，见 §5）
- shadcn-vue + vxe-table + ECharts 5
- vue-i18n + dayjs

## 2. 路径别名
- `/@/` → `src/`
- `/#/` → `types/`
- 所有 import 必须使用别名，禁止相对路径跨层引用

## 3. 命名约定
| 类型 | 规则 | 示例 |
|---|---|---|
| Vue 组件文件 | PascalCase | `UserCard.vue` |
| TS 文件 | camelCase | `useAuth.ts`、`userRoles.ts` |
| 组件 name 属性 | kebab-case | `name: 'user-card'` |
| Composable | `useXxx` | `useAuth` |
| Store | `useXxxStore` + `useXxxStoreWithOut` 双导出 | `useUserStore` |
| Pinia getter | `get` 前缀 | `getUserInfo` |
| Pinia action | `set` 前缀 | `setUserInfo` |
| 常量/枚举值 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| 路由 name | PascalCase 唯一 | `AdminWorkbench` |
| 路由 path | kebab-case | `/admin/workbench` |

## 4. 文件体积
- 单 Vue 组件 ≤ 300 行；超出拆子组件
- `<template>` ≤ 80 行；超出拆子组件
- `<script setup>` ≤ 100 行；超出提 composable
- 单组件 watch ≤ 3 个；超出拆分

## 5. 样式分层（关键规则，1:1 还原 React 项目的根本）

| 场景 | 用什么 | 备注 |
|---|---|---|
| `src/components/ui/**` shadcn-vue 组件 | **Tailwind v3** | 由 `tailwind.config.ts` 仅扫此目录；`@apply` 允许 |
| `src/views/**` 业务页面 | **UnoCSS** | 由 `uno.config.ts` 扫此目录 |
| `src/components/!(ui)/**` 业务组件 | **UnoCSS** + 必要时 `<style scoped lang="less">` | |
| 全局动画、CSS 变量、第三方覆盖 | **Less** | `src/styles/*.less` |
| vxe-table 主题对齐 | **Less 变量映射 shadcn token** | `styles/vxe-override.less` |

**禁止**：
- 内联 `style="..."`（动态计算值除外）
- `!important`（覆盖第三方且无解时除外）
- 同一组件混用 Tailwind 和 UnoCSS（除 ui 组件外，业务页只写 UnoCSS）
- 全局非 scoped style（除 `styles/` 目录外）
- 在 ui 组件外使用 shadcn 语义类（`bg-card`、`text-foreground` 等仅在 ui 组件内出现）

**业务页写样式只写两种**：
1. UnoCSS 工具类：`class="flex items-center gap-4 p-6"`
2. shadcn-vue 暴露的组件 props/class：`<Button variant="outline" class="px-6">`

## 6. CSS 变量（设计 token）
所有颜色、圆角、阴影统一通过 CSS 变量声明在 `src/styles/theme.less`，shadcn-vue 的 token 体系，与原 React 项目完全一致：
```
--background --foreground --card --card-foreground
--primary --primary-foreground --secondary --secondary-foreground
--muted --muted-foreground --accent --accent-foreground
--destructive --destructive-foreground
--border --input --ring --radius
```

## 7. API 层规范
```ts
// /@/api/login/api.ts
enum Api {
  Login = '/sys/login',
  Logout = '/sys/logout',
  GetUserInfo = '/sys/user/getUserInfo',
}

export const loginApi = (params: LoginParams) =>
  defHttp.post<LoginResult>({ url: Api.Login, params });
```

- URL 用 enum 集中定义
- 请求参数和响应类型在 `model.ts` 定义
- 调用一律 `defHttp.get/post/put/delete<T>()`
- API 函数命名 `xxxApi`、`getXxxList`、`xxxAdd`、`xxxEdit` 等

## 8. Pinia Store 范式
```ts
import { defineStore } from 'pinia';
import { store } from '/@/stores';

interface UserState { user: User | null; token: string; permissions: string[]; }

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({ user: null, token: '', permissions: [] }),
  getters: {
    getUserInfo(): User | null { return this.user; },
    getToken(): string { return this.token; },
  },
  actions: {
    setUserInfo(user: User) { this.user = user; },
    setToken(token: string) { this.token = token; },
    async login(params) { /* ... */ },
    logout() { /* ... */ },
  },
});

// 非组件上下文使用（路由守卫等）
export function useUserStoreWithOut() {
  return useUserStore(store);
}
```

## 9. 表格交互范式（基于 vxe-table 的 BasicTable 封装）
```vue
<BasicTable @register="registerTable">
  <template #action="{ record }">
    <TableAction :actions="getActions(record)" />
  </template>
</BasicTable>

<script setup lang="ts">
const [registerTable, { reload }] = useTable({
  api: getOrderListApi,
  columns,
  useSearchForm: true,
  formConfig: { schemas },
  actionColumn: { width: 120, title: '操作', slots: { default: 'action' } },
});
</script>
```

## 10. 权限
两层防御：
1. **路由守卫**：`router.beforeEach` 检查登录态 + 角色
2. **指令 `v-auth`**：`<Button v-auth="'b2b:supplier:review'">审核</Button>`，无权限时移除节点

## 11. 修改注释（团队内追溯）
```ts
// update-begin--author:claude---date:2026-05-24---for:【B2B-001】登录页底部添加入驻链接
// ... 修改内容 ...
// update-end--author:claude---date:2026-05-24---for:【B2B-001】登录页底部添加入驻链接
```

## 12. 格式化
- 单引号、必加分号、尾逗号、2 空格缩进、行宽 150、文件末尾换行

## 13. 提交
Conventional Commits：`feat: 新增登录页`、`fix: 修复刷新登录态丢失`、`style: 调整卡片间距`、`refactor: 重构 user store`、`chore: 升级依赖`

## 14. AI 协作 Checklist
每次 AI 生成代码后必查：
- [ ] 用了 `<script setup lang="ts">`
- [ ] 类型完整无 `any`
- [ ] 无未使用 import
- [ ] reactive 解构用了 `toRefs`
- [ ] 副作用在 `onUnmounted` 清理
- [ ] 未硬编码文案/接口地址
- [ ] `<style>` 加了 `scoped`
- [ ] Mock 通过 service 层，不直接引用
- [ ] 业务代码未误写 shadcn 语义类
- [ ] 使用 `/@/` `/#/` 别名
