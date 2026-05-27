# Vue AI 开发规范细则

> 本规范用于指导 AI 辅助 Vue 前端开发，规避 AI 生成代码的常见痛点，确保项目可维护、可扩展。

---

## 一、项目结构规范

### 1.1 目录约定

```
src/
├── components/        # 通用 UI 组件（纯展示，无业务逻辑）
│   └── BaseButton/
│       ├── index.vue
│       └── BaseButton.types.ts
├── views/             # 页面级组件（路由对应）
├── composables/       # 组合式函数（等同于 React 的 custom hook）
├── services/          # API 请求层（唯一与后端通信的层）
├── mocks/             # Mock 数据（集中管理）
├── types/             # 全局类型定义
├── utils/             # 工具函数
├── constants/         # 常量、枚举
├── stores/            # 状态管理（Pinia）
├── styles/            # 全局样式
├── assets/            # 静态资源
└── config/            # 项目配置（环境变量、主题等）

```

### 1.2 文件规则

| 规则 | 说明 |
| --- | --- |
| 单文件不超过 300 行 | 超出必须拆分为子组件或 composable |
| 每个目录有 `index.ts` | 统一导出，外部只引用目录路径 |
| 组件目录化 | 复杂组件使用文件夹：`index.vue` + `*.types.ts` + `*.module.css` |
| 禁止跨层引用 | `views` 可引用 `components`，反之禁止 |

### 1.3 命名约定

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 组件文件/目录 | PascalCase | `UserCard/index.vue` |
| Composable | `use` 前缀 + camelCase | `useAuth.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 类型文件 | `.types.ts` 后缀 | `User.types.ts` |
| 常量 | UPPER\_SNAKE\_CASE | `API_BASE_URL` |
| CSS Module | camelCase 类名 | `styles.cardWrapper` |
| Pinia Store | `use` 前缀 + `Store` 后缀 | `useUserStore.ts` |

---

## 二、组件设计规范

### 2.1 组件分类

| 类型 | 职责 | 存放位置 |
| --- | --- | --- |
| UI 组件 | 纯展示，通过 Props 驱动，无副作用 | `src/components/` |
| 业务组件 | 包含业务逻辑，调用 composable/service | `src/views/` 内部 |
| 布局组件 | 页面骨架、导航、侧边栏 | `src/components/Layout/` |

### 2.2 单文件组件（SFC）结构约定

```vue
<!-- ✅ 标准结构顺序：script → template → style -->
<script setup lang="ts">
// 1. 类型导入
// 2. 第三方库导入
// 3. 内部模块导入
// 4. Props / Emits 定义
// 5. Composable 调用
// 6. 响应式数据
// 7. 计算属性
// 8. 方法
// 9. 生命周期
</script>

<template>
  <!-- 单根节点（或使用 Fragment） -->
</template>

<style scoped>
/* 样式 */
</style>

```

**规则：**

-   必须使用 `<script setup>` 语法（Composition API），禁止 Options API
-   必须加 `lang="ts"` 启用 TypeScript
-   `<style>` 必须加 `scoped`（除全局样式文件外）

### 2.3 Props 与 Emits 规范

```vue
<script setup lang="ts">
// ✅ 必须显式定义 Props 接口
interface Props {
  user: User
  onEdit?: (id: string) => void
  className?: string
}

// ✅ 使用 withDefaults 提供默认值
const props = withDefaults(defineProps<Props>(), {
  className: '',
})

// ✅ 显式定义 Emits
const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()
</script>

```

**禁止事项：**

-   禁止使用 `any` 类型
-   禁止 Props 超过 8 个（超出需合并对象或拆分组件）
-   禁止在组件内部直接修改 Props（通过 emit 通知父组件）
-   禁止使用非类型化的 `defineProps({ name: String })`

### 2.4 组件体积控制

-   单组件 template 超过 80 行 → 拆分子组件
-   单组件 `<script setup>` 超过 100 行 → 提取 composable
-   单组件 `watch` / `watchEffect` 超过 3 个 → 必须拆分

---

## 三、TypeScript 类型规范

### 3.1 基础规则

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}

```

### 3.2 类型定义规则

| 场景 | 规则 |
| --- | --- |
| API 响应 | 必须定义完整 Response 类型，禁止 `res.data` 裸用 |
| 状态值/标记 | 使用联合类型 `type Status = 'idle' \| 'loading' \| 'error' \| 'success'` |
| 事件处理 | 显式标注事件类型 `(e: MouseEvent) => void` |
| 第三方库 | 缺少类型时写 `.d.ts` 声明文件，禁止 `@ts-ignore` |
| `ref` / `reactive` | 泛型显式标注 `ref<User \| null>(null)` |

### 3.3 Vue 特有类型规范

```ts
// ✅ ref 显式类型
const user = ref<User | null>(null)
const list = ref<User[]>([])

// ✅ reactive 类型
const state = reactive<FormState>({ name: '', email: '' })

// ✅ computed 类型自动推断（无需标注）
const fullName = computed(() => `${user.value?.firstName} ${user.value?.lastName}`)

// ✅ 模板 ref 类型
const inputRef = ref<HTMLInputElement | null>(null)

```

### 3.4 类型文件组织

```
src/types/
├── user.types.ts       # 用户相关
├── product.types.ts    # 产品相关
├── api.types.ts        # 通用 API 响应结构
└── common.types.ts     # 公共类型（分页、排序等）

```

---

## 四、Mock 数据规范（方案一 + 类型约束）

### 4.1 目录结构

```
src/mocks/
├── user.mock.ts
├── product.mock.ts
├── order.mock.ts
└── index.ts            # 统一导出

```

### 4.2 Mock 文件编写规则

```ts
// src/mocks/user.mock.ts
import type { User } from '@/types/user.types'

// ✅ 必须标注类型，确保与 API 返回结构一致
export const mockUsers: User[] = [
  { id: '1', name: '张三', role: 'admin', avatar: '/mock/avatar1.png' },
  { id: '2', name: '李四', role: 'user', avatar: '/mock/avatar2.png' },
]

// ✅ 模拟分页响应也要类型约束
export const mockUserListResponse: PaginatedResponse<User> = {
  data: mockUsers,
  total: 2,
  page: 1,
  pageSize: 10,
}

```

### 4.3 Service 层开关机制

```ts
// src/services/user.service.ts
import { mockUsers } from '@/mocks/user.mock'
import type { User } from '@/types/user.types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) return mockUsers
  return request.get<User[]>('/api/users')
}

```

### 4.4 环境变量配置

```bash
# .env.development
VITE_USE_MOCK=true

# .env.production
VITE_USE_MOCK=false

```

### 4.5 Mock 规范要点

| 规则 | 说明 |
| --- | --- |
| Mock 数据必须满足 TypeScript 类型 | 替换 API 时类型已对齐，不会字段对不上 |
| 组件禁止直接引用 Mock | 只通过 Service 层或 composable 获取数据 |
| Mock 数据量要合理 | 至少 3-5 条，覆盖边界情况（空值、长文本、特殊字符） |
| API 替换后删除对应 Mock 文件 | 不留死代码 |
| Mock 文件禁止包含业务逻辑 | 只存放静态数据 |

---

## 五、样式规范

### 5.1 Tailwind CSS（首选方案）

**适用场景**：绝大多数 UI 样式

```vue
<!-- ✅ 使用 Tailwind 工具类 -->
<div class="flex items-center gap-4 rounded-lg bg-gray-50 p-4">

<!-- ❌ 禁止内联样式 -->
<div :style="{ display: 'flex', alignItems: 'center' }">

<!-- ❌ 禁止魔法数字 -->
<div class="max-w-[437px] mt-[13px]">

<!-- ✅ 使用设计 Token -->
<div class="max-w-md mt-3">

```

**Tailwind 规则：**

| 规则 | 说明 |
| --- | --- |
| 颜色从 `tailwind.config` 统一管理 | 禁止随意写 `bg-[#1a2b3c]`，定义语义化颜色 |
| 响应式断点统一 | 使用 `sm/md/lg/xl/2xl`，禁止自定义断点 |
| 类名排序 | 按 布局 → 尺寸 → 间距 → 样式 → 状态 排列 |
| 超过 5 个类名的重复组合 | 提取为组件或使用 `@apply` |

**tailwind.config 示例：**

```ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb', light: '#60a5fa', dark: '#1d4ed8' },
        surface: { DEFAULT: '#f8fafc', elevated: '#ffffff' },
        content: { DEFAULT: '#1e293b', muted: '#64748b' },
      },
      spacing: {
        section: '2rem',
        card: '1.5rem',
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
}

```

### 5.2 CSS Module（复杂/隔离场景）

**适用场景**：需要复杂选择器、动画、或第三方组件样式覆盖

```vue
<template>
  <div :class="styles.wrapper">
</template>

<script setup lang="ts">
import styles from './UserCard.module.css'
</script>

```

**规则：**

-   文件命名：`ComponentName.module.css`
-   类名使用 camelCase
-   与 `<style scoped>` 二选一，禁止混用

### 5.3 Scoped Style（Vue 原生方案）

**适用场景**：组件内简单、低复杂度样式

```vue
<style scoped>
.wrapper {
  /* 自动添加属性选择器作用域 */
}

/* ✅ 覆盖子组件样式用 :deep() */
:deep(.el-input__inner) {
  border-radius: 8px;
}
</style>

```

**规则：**

-   必须加 `scoped`，禁止裸写全局 style
-   覆盖第三方组件样式必须使用 `:deep()`，禁止 `!important`
-   禁止在 scoped 中使用 id 选择器

### 5.4 样式方案选择决策

| 场景 | 方案 |
| --- | --- |
| 常规页面布局和组件 | Tailwind CSS |
| 复杂动画、伪元素、嵌套选择器 | CSS Module |
| 简单独立组件内部样式 | `<style scoped>` |
| 覆盖第三方组件库 | `<style scoped>` + `:deep()` |

**禁止事项：**

-   禁止同一组件混用两种以上样式方案
-   禁止 `:style` 绑定静态样式（仅允许动态计算值）
-   禁止 `!important`（除非覆盖第三方库且无其他方案）

---

## 六、状态管理规范

### 6.1 状态分层决策

```
局部状态 (ref / reactive)
    ↓ 需要跨 2-3 个相邻组件共享
组合状态 (Props 提升 / provide/inject)
    ↓ 需要跨多层级或非父子组件共享
Pinia Store（全局）
    ↓ 需要持久化、DevTools、复杂异步流
Pinia + 持久化插件

```

### 6.2 ref / reactive

```vue
<script setup lang="ts">
// ✅ 基础值用 ref
const count = ref(0)
const isOpen = ref(false)

// ✅ 对象/表单状态用 reactive
const form = reactive<LoginForm>({ username: '', password: '' })

// ✅ 避免解构 reactive（会丢失响应性）
// ❌ const { username } = form
// ✅ 使用 toRefs 解构
const { username, password } = toRefs(form)
</script>

```

**规则：**

-   基础值（string、number、boolean）用 `ref`
-   复杂对象/表单用 `reactive`
-   解构 `reactive` 时必须用 `toRefs`，否则丢失响应性
-   禁止混用 `ref` 和 `reactive` 存储同一数据的不同字段

### 6.3 Pinia（推荐全局方案）

```ts
// src/stores/useUserStore.ts
import { defineStore } from 'pinia'
import type { User } from '@/types/user.types'

export const useUserStore = defineStore('user', () => {
  // ✅ 使用 Setup Store 风格（与 Composition API 一致）
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)

  function setUser(newUser: User) {
    user.value = newUser
  }

  function logout() {
    user.value = null
  }

  return { user, isLoggedIn, setUser, logout }
})

```

**规则：**

-   一个 Store 对应一个业务域（user、cart、theme）
-   使用 Setup Store 写法（函数式），而非 Options Store
-   Store 文件放 `src/stores/`，命名 `use*Store.ts`
-   禁止在 Store 中写 UI 逻辑（toast、router.push）
-   禁止在 Store 外直接修改 state，通过 action 修改

### 6.4 provide / inject（有限使用）

**仅适用于**：主题、国际化、表单组件内部等强父子关联场景

```ts
// ✅ 必须使用 InjectionKey 保证类型安全
import type { InjectionKey } from 'vue'

const themeKey: InjectionKey<Theme> = Symbol('theme')

// 父组件
provide(themeKey, theme)

// 子组件
const theme = inject(themeKey)

```

**规则：**

-   必须使用 `InjectionKey` 确保类型安全
-   禁止使用字符串 key（`provide('theme', ...)` 不安全）
-   跨页面共享数据用 Pinia，不用 provide/inject
-   禁止注入高频变化的数据（引发不必要渲染）

### 6.5 状态管理禁止事项

-   禁止同一项目混用 Pinia + Vuex
-   禁止组件直接修改 Pinia state（必须通过 action）
-   禁止将服务端数据缓存在 Pinia（用 VueQuery 管理）
-   禁止 Props Drilling 超过 3 层（提升为 Pinia 或用 provide/inject）

---

## 七、路由规范（Vue Router）

### 7.1 路由结构

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/Layout/index.vue'),  // ✅ 懒加载
      children: [
        { path: '', name: 'Home', component: () => import('@/views/Home/index.vue') },
        { path: 'users', name: 'UserList', component: () => import('@/views/User/List.vue') },
        { path: 'users/:id', name: 'UserDetail', component: () => import('@/views/User/Detail.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') },
  ],
})

export default router

```

### 7.2 路由元信息与守卫

```ts
// ✅ 路由元信息定义类型
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
    roles?: string[]
  }
}

// ✅ 全局守卫统一处理鉴权
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useUserStore().isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})

```

### 7.3 路由规则

| 规则 | 说明 |
| --- | --- |
| 所有路由组件必须懒加载 | `() => import(...)` 形式 |
| 路由配置集中管理 | 统一放 `src/router/`，禁止分散定义 |
| 路径命名用 kebab-case | `/user-profile` 而非 `/userProfile` |
| 路由 name 必须唯一且 PascalCase | 便于编程式导航 |
| 路由守卫统一在 `router/index.ts` | 禁止在组件内单独 `beforeRouteEnter` 处理全局鉴权 |
| 路由元信息必须有类型声明 | 扩展 `RouteMeta` 接口 |

---

## 八、异步请求规范

### 8.1 Axios 封装

```ts
// src/services/request.ts
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000,
})

// 请求拦截：注入 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截：统一错误处理
request.interceptors.response.use(
  (res) => res.data,
  (error) => {
    handleApiError(error)
    return Promise.reject(error)
  }
)

export default request

```

### 8.2 VueQuery / TanStack Query（推荐）

```ts
// ✅ 在 composable 中封装查询
export function useUsers(filters: Ref<UserFilters>) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getList(filters.value),
  })
}

// ✅ 变更操作
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

```

**规则：**

-   所有 GET 请求用 `useQuery`
-   所有 POST/PUT/DELETE 用 `useMutation`
-   `queryKey` 必须包含所有影响结果的参数（reactive 值必须传入 key）
-   禁止在组件中直接调用 `axios.get()`

### 8.3 Service 层规范

```ts
// src/services/user.service.ts
import request from './request'
import type { User, CreateUserDTO } from '@/types/user.types'

export const userService = {
  getList: (params?: ListParams) => request.get<User[]>('/users', { params }),
  getById: (id: string) => request.get<User>(`/users/${id}`),
  create: (data: CreateUserDTO) => request.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => request.put(`/users/${id}`, data),
  delete: (id: string) => request.delete(`/users/${id}`),
}

```

**规则：**

-   每个业务域一个 service 文件
-   返回类型必须显式标注
-   禁止在 service 中处理 UI 逻辑（ElMessage、router.push）

---

## 九、Composable（组合式函数）规范

> Vue 特有模块，对应 React 的 Custom Hook，是业务逻辑复用的核心。

### 9.1 基本结构

```ts
// src/composables/useUserList.ts
import { ref, computed } from 'vue'
import type { User, UserFilters } from '@/types/user.types'

/**
 * useUserList - 用户列表数据管理
 *
 * 用途：封装用户列表查询、筛选、分页逻辑
 * @param initialFilters 初始筛选条件
 */
export function useUserList(initialFilters?: UserFilters) {
  const filters = ref<UserFilters>(initialFilters ?? {})
  const { data: users, isLoading, error } = useUsers(filters)

  const totalCount = computed(() => users.value?.length ?? 0)

  function updateFilters(newFilters: Partial<UserFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return { users, isLoading, error, totalCount, filters, updateFilters }
}

```

### 9.2 Composable 规则

| 规则 | 说明 |
| --- | --- |
| 必须以 `use` 开头 | `useAuth`、`useCart`，命名语义化 |
| 必须返回响应式数据 | 返回 `ref` / `computed`，禁止返回普通对象 |
| 单一职责 | 一个 composable 只封装一个业务场景 |
| 禁止在条件语句中调用 | 必须在 `setup` 顶层调用（同 React Hook 规则） |
| 副作用必须在 onUnmounted 清理 | 定时器、事件监听必须清理 |
| 文件放 `src/composables/` | 不要散落在各 view 目录 |

### 9.3 生命周期使用规范

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, onBeforeUnmount } from 'vue'

// ✅ 在 setup 顶层调用
onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

// ✅ 必须在 onUnmounted 清理副作用
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

```

**常用生命周期对照：**

| 场景 | 推荐 |
| --- | --- |
| 组件挂载后请求数据 | `onMounted` |
| 监听外部事件 | `onMounted` + `onUnmounted` 成对使用 |
| 路由离开前确认 | `onBeforeRouteLeave` |
| SSR 兼容的初始化 | `onServerPrefetch` |
| 禁止使用 | `created`（Options API，不用） |

---

## 十、表单规范（VeeValidate + Zod / Vue 原生）

### 10.1 VeeValidate + Zod（推荐复杂表单）

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

const schema = toTypedSchema(z.object({
  name: z.string().min(2, '至少2个字符'),
  email: z.string().email('邮箱格式不正确'),
  age: z.number().min(0).max(150),
}))

const { handleSubmit, errors } = useForm({ validationSchema: schema })

const onSubmit = handleSubmit((values) => {
  // values 自动获得 TypeScript 类型
})
</script>

```

### 10.2 表单规则

| 规则 | 说明 |
| --- | --- |
| 校验逻辑统一用 Zod Schema | 禁止在组件中手写 if 校验 |
| Schema 与类型共用 | `z.infer<typeof schema>` 生成类型 |
| 复杂表单拆分步骤 | 多步表单每步一个子组件 |
| 表单状态不放 Pinia | 表单是局部状态，用 VeeValidate 或 reactive 管理 |

---

## 十一、UI 组件库使用规范

### 11.1 Element Plus

```vue
<script setup lang="ts">
// ✅ 按需引入（配合 unplugin-vue-components 自动导入）
import { ElButton, ElTable, ElDialog } from 'element-plus'
</script>

```

**规则：**

-   通过 CSS 变量统一覆盖主题：`--el-color-primary: #2563eb`
-   禁止组件级直接覆盖 class 样式（用 `:deep()` 或主题变量）
-   表格列配置提取为 `columns` 常量，不写在 template 中
-   弹窗内容超过 50 行必须提取为独立组件

### 11.2 Naive UI

```vue
<script setup lang="ts">
import { NButton, NDataTable, NModal } from 'naive-ui'
</script>

```

**规则：**

-   通过 `n-config-provider` 统一主题配置
-   使用 `createDiscreteApi` 在非组件上下文中调用 message/dialog
-   禁止直接修改 Naive UI 的内部 CSS 变量

### 11.3 Ant Design Vue

```vue
<script setup lang="ts">
import { Button, Table, Modal } from 'ant-design-vue'
</script>

```

**规则：**

-   通过 `ConfigProvider` 统一主题，禁止组件级覆盖
-   表格 columns 提取为常量
-   弹窗/抽屉内容超过 50 行必须提取为独立组件

### 11.4 组件库选择

-   禁止同一项目混用两个组件库
-   组件库不提供的功能才自行封装
-   自封装组件 API 设计参考所选组件库风格保持一致

---

## 十二、动画规范

### 12.1 Vue 内置过渡（优先使用）

```vue
<!-- ✅ 使用内置 Transition -->
<Transition name="fade" mode="out-in">
  <component :is="currentView" />
</Transition>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

```

### 12.2 Framer Motion / VueUse Motion（复杂动画）

```vue
<script setup lang="ts">
import { useMotion } from '@vueuse/motion'

const target = ref(null)
useMotion(target, {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 300 } },
})
</script>

<template>
  <div ref="target">内容</div>
</template>

```

### 12.3 动画规则

| 规则 | 说明 |
| --- | --- |
| 优先使用 Vue 内置 `Transition` | 简单进出场景无需引入第三方库 |
| 动画时长不超过 500ms | 保持界面响应感 |
| 统一动画预设 | 提取到 `src/constants/animation.ts` |
| 列表动画使用 `TransitionGroup` | 禁止手动对每个 item 绑定动画 |
| 尊重用户偏好 | 检测 `prefers-reduced-motion` |
| 禁止纯装饰动画 | 动画必须服务于交互反馈或状态转换 |

---

## 十三、AI 协作专用规则

### 13.1 项目上下文文件

在项目根目录维护 AI 上下文文件（`.cursorrules` 或 `CONVENTIONS.md`），内容包括：

```markdown
# 项目约定
- 技术栈：Vue 3 + Vite + TypeScript + Tailwind v4
- 状态管理：Pinia（Setup Store 写法）
- 请求方案：Axios + VueQuery
- 组件库：Element Plus
- 目录结构：[简要说明]
- 当前 Mock 状态：[哪些模块已替换真实 API]
- 禁止 Options API，统一使用 Composition API + script setup

```

### 13.2 AI 生成代码约束

| 规则 | 说明 |
| --- | --- |
| 每次生成限定 1-3 个文件 | 超出需人工审查后再继续 |
| 增量修改优先 | 禁止整文件重写（除非新建文件） |
| 必须检查已有代码 | 生成前确认项目中无同类组件/composable |
| 新依赖需确认 | AI 引入的第三方包必须确认存在且版本兼容 |
| 禁止孤岛代码 | 新文件必须有明确的导入/导出关系 |
| 禁止生成 Options API | 项目统一使用 Composition API |

### 13.3 生成后 Checklist

每次 AI 生成代码后，检查以下项目：

-   [ ]  是否使用了 `<script setup lang="ts">`
-   [ ]  TypeScript 类型是否完整（无 `any`、无隐式类型）
-   [ ]  是否有未使用的 import
-   [ ]  reactive 解构是否用了 `toRefs`
-   [ ]  是否与现有组件/composable 功能重复
-   [ ]  是否引入了新的第三方依赖
-   [ ]  是否有硬编码的文案/配置/API 地址
-   [ ]  `<style>` 是否加了 `scoped`
-   [ ]  Mock 数据是否通过 Service 层调用（非直接引用）
-   [ ]  副作用是否在 `onUnmounted` 中清理

---

## 十四、性能规范

### 14.1 渲染优化

```vue
<script setup lang="ts">
// ✅ 路由懒加载（已在路由配置中）
// ✅ 计算缓存
const sortedList = computed(() =>
  list.value.slice().sort((a, b) => a.name.localeCompare(b.name))
)

// ✅ 稳定事件监听
const handleScroll = useDebounceFn(() => { /* ... */ }, 300)
</script>

<!-- ✅ v-memo 缓存静态列表项 -->
<div v-for="item in list" :key="item.id" v-memo="[item.id, item.updatedAt]">

<!-- ✅ v-once 只渲染一次的静态内容 -->
<footer v-once>{{ staticText }}</footer>

```

### 14.2 性能规则

| 规则 | 说明 |
| --- | --- |
| 路由级组件必须懒加载 | `() => import(...)` |
| 长列表使用虚拟滚动 | `vue-virtual-scroller` 或 `@tanstack/virtual` |
| 图片懒加载 | `loading="lazy"` 或 Intersection Observer |
| 禁止 `v-if` + `v-for` 同层 | `v-if` 优先级高，先过滤再渲染 |
| 大数据 reactive 用 shallowRef | 避免深度追踪开销 |
| 禁止在模板中调用函数 | 改用 `computed`，避免每次渲染重计算 |

---

## 十五、注释与文档规范

### 15.1 组件注释模板

```vue
<!--
  UserCard - 用户信息卡片

  用途：展示用户头像、姓名、角色信息
  使用场景：用户列表页、用户详情侧边栏

  @example
  <UserCard :user="currentUser" @edit="handleEdit" />
-->
<script setup lang="ts">

```

### 15.2 注释规则

| 规则 | 说明 |
| --- | --- |
| 组件头部必须有用途说明 | 方便 AI 读取上下文理解组件职责 |
| 复杂逻辑注释 Why | 解释为什么这样做，而非做了什么 |
| TODO 标注格式统一 | `// TODO: [描述] - [日期]` |
| 禁止注释掉的代码 | 删除而非注释，Git 有历史记录 |
| Composable 注释参数和返回值 | 说明入参含义和返回数据结构 |

---

## 十六、Git 与版本规范

### 16.1 分支策略

```
main          ← 生产分支，保护分支
  └── develop ← 开发主分支
       ├── feature/user-auth    ← 功能分支
       ├── feature/order-list
       └── fix/login-redirect   ← 修复分支

```

### 16.2 提交规范

```
feat: 新增用户登录功能
fix: 修复订单列表分页异常
style: 调整首页卡片间距
refactor: 重构用户 Service 层
chore: 更新依赖版本

```

### 16.3 Git 规则

| 规则 | 说明 |
| --- | --- |
| 原子提交 | 一个功能/修复一个 commit |
| AI 生成代码必须 review 后提交 | 禁止盲目 commit |
| 禁止直接推 main | 通过 PR/MR 合并 |
| commit message 用中文或英文统一 | 项目内保持一致 |

---

## 十七、AI 开发痛点规避清单

| 痛点 | 规避规则 |
| --- | --- |
| 生成 Options API | `.cursorrules` 强调 Composition API，Checklist 必查 |
| reactive 解构丢失响应性 | 强制使用 `toRefs`，Checklist 检查 |
| 硬编码泛滥 | 所有文案、配置、API 地址提取到 `constants/` 或 `.env` |
| 样式污染 | `<style>` 必须 `scoped`，覆盖第三方用 `:deep()` |
| 重复造轮子 | 生成前检查已有 composable，AI 上下文列出已有模块 |
| 幻觉依赖 | AI 引入的包必须确认存在 |
| 孤岛代码 | 新文件必须被引用，定期清理未使用的导出 |
| 类型丢失 | strict 模式，`ref` 显式泛型，CI 加类型检查 |
| Pinia 状态直接修改 | 所有修改通过 action，Store 外只读 |
| Mock 残留 | Service 层统一开关，替换后删除 mock 文件 |
| 副作用泄漏 | Checklist 检查 onUnmounted 清理 |
| 文件膨胀 | 300 行硬限制，超出必须拆分 |