# PROGRESS

> 最后更新：2026-05-24（阶段 5 完成：ECharts 封装 + 三角色看板）

## 项目目标
B2B 集采模块前端项目，1:1 还原原 React 项目（shadcn/ui 商务管理后台风格）。
三角色：平台管理员 / 供应商 / 门店。强价格隔离。Mock-first 开发。

## 阶段进度总览

```
阶段 1   配置+登录+入驻+工作台      ████████████  ✅ 103 文件
阶段 2A  审核+目录+vxe-table         ████████████  ✅  25 文件
阶段 2B  库存+订单+支付              ████████████  ✅  10 文件
阶段 2C  集采+履约+结算+利润         ████████████  ✅  12 文件
阶段 3   供应商端 9 模块             ████████████  ✅  23 文件
阶段 4   门店端 7 模块               ████████████  ✅  17 文件
阶段 5   ECharts + 三角色看板        ████████████  ✅  11 文件
─────────────────────────────────────────────────────────
                          累计 201 文件
─────────────────────────────────────────────────────────
阶段 6   样式抛光 + 暗色主题         ░░░░░░░░░░░░  约  6 文件
阶段 7   联调（CAS/JeecgBoot/qiankun）░░░░░░░░░░░░  约  8 文件
```

---

## ✅ 阶段 5 完成记录（2026-05-24）

### 落实约束
- 配色：`#3b82f6 #10b981 #f59e0b #8b5cf6`，禁用浮夸渐变 / 发光
- BasicChart：`option` props 响应式（`watch` deep + `setOption notMerge=true`），autoResize（ResizeObserver）+ 自定义 `b2b-light` 主题
- 主题/图表按需注册（`echarts/core` + 单文件 `useChart.ts` 内 lazy register）
- 价格隔离继续遵守：admin 看板 KPI 区整体 `v-auth='b2b:profit:view'`；supplier 仅自报价金额；store 仅 salePrice 口径
- 路由 workbench 入口指向新 Dashboard（update-begin/end 包住），原 `*Workbench.vue` 暂保留作回退备份

### 文件清单（10 + 1 关联修改 = 11）

**ECharts 封装 (4)**
- `src/components/ECharts/themes/light.ts` —— `B2B_LIGHT_THEME` + `B2B_COLOR_PALETTE` + 主题名 `b2b-light`
- `src/components/ECharts/useChart.ts` —— echarts 按需注册 + 实例 + ResizeObserver + option deep watch
- `src/components/ECharts/BasicChart.vue` —— `option` / `height` / `loading` / `theme` / 空状态
- `src/components/ECharts/index.ts` —— 统一出口

**Dashboard API + 内联 Mock (3)**
- `src/api/admin/dashboard.ts` —— `/b2b/dashboard/admin`（kpi + trend12m + supplierShare + topSkus10）
- `src/api/supplier/dashboard.ts` —— `/b2b/dashboard/supplier`（kpi + acceptTrend12w + quoteFunnel + settleMonthly12m）
- `src/api/store/dashboard.ts` —— `/b2b/dashboard/store`（kpi + purchaseMonthly12m + salesTrend30d + turnover）

**三角色看板 (3)**
- `src/views/workbench/AdminDashboard.vue` —— 销售/采购/毛利趋势折线 + 供应商分布饼 + Top10 SKU 横向柱
- `src/views/workbench/SupplierDashboard.vue` —— 接单趋势折线 + 报价转化率仪表 + 月度结算柱
- `src/views/workbench/StoreDashboard.vue` —— 月度采购柱 + 销售上报 30d 折线 + 库存周转率仪表

**关联修改 (1)**
- `src/router/routes/business.ts` —— 三个 `workbench` 路由组件 → `Admin/Supplier/StoreDashboard.vue`（update-begin/end 包住）

### 验收路径表

| 路径 | 名称 | 关键交互 |
|---|---|---|
| `/admin/workbench` | 平台看板 | 4 KPI 卡（profit auth）+ 趋势折线 + 供应商分布饼 + Top10 SKU 柱 + 待办 + 风险提醒 |
| `/supplier/workbench` | 供应商看板 | 4 KPI 卡 + 接单趋势 + 报价转化率仪表 + 月度结算柱 + 待办 + 应收 3 卡 |
| `/store/workbench` | 门店看板 | 4 KPI 卡 + 月度采购柱 + 库存周转仪表 + 销售上报折线 + 待办 + 销售 3 卡 |

### 端到端演示流程
1. `admin / 任意密码` 登录 → `/admin/workbench` 看到四张图（含利润口径，非 admin 角色 KPI 区会被 v-auth 隐藏）
2. `supplier / 任意密码` 登录 → `/supplier/workbench` 看到接单趋势 + 报价仪表（仅展示与本供应商相关的数据）
3. `store / 任意密码` 登录 → `/store/workbench` 看到月度采购 + 销售上报趋势 + 库存周转仪表
4. 改窗口宽度图表自动 resize（ResizeObserver）；toggleMock 切换 `VITE_USE_MOCK=false` 后请求 `/b2b/dashboard/{role}` 真实后端接口

### 已知踩坑 / 注意
- `echarts` 按需注册放在 `useChart.ts` 模块顶层 `registered` 标志位，多个 BasicChart 共用一次注册
- `setOption(..., {notMerge:true})` 必填，否则切换 series 类型会残留旧配置
- 仪表盘 `axisLine.lineStyle.color: [[1,'#eef2f7']]` 用 `[[stop,color]]` 形式，TS 严格下需保留二维数组
- `B2B_COLOR_PALETTE` 是 `as const`，传入 `theme.color` 时需 `[...]` 解构成可变数组

### 验收
- `npx vue-tsc --noEmit` —— src 范围 0 错误（配置文件 TS6305 为旧问题，与本阶段无关）

---

## 路径别名 / 价格隔离
（沿用前阶段，未变更）`/@/` → `src/`；`/#/` → `types/`；admin 双价；supplier 仅 cost；store 仅 sale。

## 下一步：阶段 6（去机械感二次抛光 + 暗色主题）

> 用户已确认方向（2026-05-24 对齐）：
> - 参考风格：山西文旅平台（截图 7368 / 8943 / 1905）
> - Hero 渐变主色：深邃藏蓝 `#1e3a5f → #22487a → #2a5490`
> - 三角色都要 Hero 横幅化（已在阶段 5 看板内置 KPI 区，本阶段只调风格）
> - **严格边界：只改样式 / 只动已存在文件 / 不新建组件、Composable、工具函数**
> - 阶段 5.5（视觉风格还原：登录页左右分栏 + theme.less 一轮微调 + Card 去边框）
>   如果尚未执行，请按 `PROMPTS/phase-5.5.md`（待生成）先做完，再跑阶段 6

### 任务边界

✅ 只改样式：CSS token、已有组件 class、已有页面 `<style>` 块
❌ 不新建任何组件 / Composable / 工具函数 / 独立 less 文件
❌ 不动业务逻辑、API、Mock、路由、Pinia store 主体
❌ 不动业务页面 template 结构（仅允许加/换 class）
❌ 不接 ECharts（阶段 5 已完成）

### 任务 1：theme.less 二次微调（深化去机械感）

只改 `:root` 内的 CSS 变量，保留阶段 5.5 已存在的 token 不动。

```less
--primary: 221 83% 53%        →  213 60% 40%       /* 降饱和，向藏蓝靠拢 */
--muted:   210 40% 96%        →  216 16% 95%       /* 与背景层级拉开 */
--muted-foreground: 215 16% 47% → 220 9% 46%
--accent:  210 40% 96%        →  213 30% 94%       /* 悬停色与 primary 同色系 */
--secondary: 210 40% 96%      →  216 16% 95%
--ring:    221 83% 53%        →  213 60% 40%       /* 聚焦环跟 primary 同步 */

/* 新增字重 + 数字字体特性 */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-numeric: tabular-nums;
```

### 任务 2：侧边栏选中态重设计

文件：`src/layout/components/Sider.vue`（或 `src/components/Layout/Sider.vue`，先 grep 定位）

- 删除：选中项左侧 3px 蓝色竖条
- 改为：选中项 = 半透明 primary 胶囊
  - `background: hsl(var(--primary) / 0.10)`
  - `color: hsl(var(--primary))`
  - `font-weight: 500`
  - `border-radius: 8px`
  - `margin: 2px 8px` / `padding: 10px 12px`
  - `transition: all 200ms ease`
- 未选中 hover：`bg-muted/60` + 文字色变 foreground，**不变 primary**
- 折叠模式：胶囊改 36×36 正方形居中

仅改 `<style scoped>`，不动菜单数据生成、folded 折叠、router-link 跳转逻辑。

### 任务 3：字重通刷

文件：`src/styles/index.less`（或项目已存在的全局 less，**不新建文件**）

末尾追加（用 update-begin/update-end 注释包住）：

```less
body {
  font-weight: var(--font-weight-normal);
  font-feature-settings: 'tnum' on, 'lnum' on;
}

.page-wrapper-title {
  font-weight: var(--font-weight-semibold);
}

[class*='card-title'],
.card-header h3,
.card-header h4 {
  font-weight: var(--font-weight-medium);
}

/* vxe-table 表头降为 500 */
.vxe-table .vxe-header--row .vxe-header--column {
  font-weight: var(--font-weight-medium) !important;
  color: hsl(var(--muted-foreground));
}

.num,
.currency,
[data-numeric] {
  font-variant-numeric: var(--font-numeric);
}
```

### 任务 4：暗色主题 token

文件：`src/styles/theme.less` 末尾的 `.dark` 块（已存在占位，补全数值）

```less
.dark {
  --background: 222 20% 8%;
  --foreground: 210 20% 92%;
  --card: 222 18% 11%;
  --card-foreground: 210 20% 92%;
  --popover: 222 18% 11%;
  --popover-foreground: 210 20% 92%;
  --primary: 213 65% 55%;            /* 暗色亮度 +15% */
  --primary-foreground: 210 20% 98%;
  --secondary: 217 15% 18%;
  --secondary-foreground: 210 20% 92%;
  --muted: 217 15% 18%;
  --muted-foreground: 215 12% 60%;
  --accent: 217 18% 22%;
  --accent-foreground: 210 20% 92%;
  --destructive: 0 62% 50%;
  --destructive-foreground: 210 20% 98%;
  --border: 217 15% 22%;
  --input: 217 15% 22%;
  --ring: 213 65% 55%;

  --shadow-card:       0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2);
  --shadow-card-hover: 0 2px 6px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3);
  --hero-gradient:     linear-gradient(135deg, #0f1f3a 0%, #14304f 50%, #1c3e64 100%);
}
```

### 任务 5：暗色切换（不新建组件 / Hook）

**实现策略**：在已有 `src/stores/modules/app.ts` 中追加 theme state + action，
顶栏切换按钮直接 inline 在已有 `Header.vue`（不抽 ThemeToggle.vue）。

#### `src/stores/modules/app.ts`（追加约 10 行）

```ts
state: () => ({
  // ...existing
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
}),
getters: {
  // ...existing
  getIsDark: (state) => state.theme === 'dark',
},
actions: {
  // ...existing
  setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  },
},
```

#### `src/main.ts`（启动时同步类名，pinia 安装之后）

```ts
const appStore = useAppStoreWithOut();
document.documentElement.classList.toggle('dark', appStore.theme === 'dark');
```

#### `src/layout/components/Header.vue`（顶栏 inline 切换按钮）

```vue
<Button variant="ghost" size="icon" @click="appStore.toggleTheme()">
  <Sun v-if="appStore.getIsDark" class="w-4 h-4" />
  <Moon v-else class="w-4 h-4" />
</Button>
```

```ts
import { Sun, Moon } from 'lucide-vue-next';
import { useAppStore } from '/@/stores/modules/app';
const appStore = useAppStore();
```

### 最终改动文件清单（5 个，全部已存在，0 新建）

| 文件 | 改动类型 |
|---|---|
| `src/styles/theme.less` | 任务 1（token 微调）+ 任务 4（.dark 块补全） |
| `src/styles/index.less` | 任务 3（字重通刷规则末尾追加） |
| `src/layout/components/Sider.vue` | 任务 2（选中态胶囊化，仅 style 部分） |
| `src/stores/modules/app.ts` | 任务 5（theme state/getter/action 约 10 行） |
| `src/layout/components/Header.vue` | 任务 5（顶栏 Sun/Moon 切换按钮 inline） |

> 实际路径以项目为准，先 `grep 'Sider' / 'Header'` 定位（可能在 `src/components/Layout/` 下）。

### 代码规范

- 单引号、分号、2 空格、行宽 150
- 路径别名 `/@/` 不能写 `@/`
- lucide-vue-next 按需 import（Sun, Moon）
- 全部改动用 `update-begin / update-end` 注释包住，author + date `2026-05-24` + for `【阶段6】去机械感+暗色`
- 不引入新依赖
- vxe-table 暗色样式覆盖如不彻底，补在 index.less 字重段下方

### 验收

- 浅色：侧边栏选中项 = 胶囊（无左竖条）；表头字重 500；金额数字等宽
- 暗色：点击顶栏 Sun/Moon → 整站切换；Hero 渐变变更深；卡片阴影变深
- 持久化：刷新页面保持上次主题
- vxe-table 在暗色模式下表头/行/边框可读（如不彻底再单独覆盖）

---

## 阶段 7（联调 + 工程化）

约 8 文件。VITE_USE_MOCK 切真实后端 / JeecgBoot 集成 / CAS 单点 / qiankun 微前端 /
i18n / Playwright E2E / CI / README。详细 prompt 等阶段 6 完成后再生成。
