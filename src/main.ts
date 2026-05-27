/**
 * 应用入口
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2A】vxe-table 正式接入
 * - createApp + Pinia + Router + v-auth
 * - vxe-table 全量 + ant-design-vue 样式
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2A】vxe-table 正式接入
 */
import { createApp } from 'vue';
import App from './App.vue';
import { setupStore } from '/@/stores';
import { setupRouter } from '/@/router';
import { setupAuthDirective } from '/@/directives/auth';

// ===== vxe-table =====
import VxeUI from 'vxe-pc-ui';
import 'vxe-pc-ui/lib/style.css';
import VxeUITable from 'vxe-table';
import 'vxe-table/lib/style.css';
import 'ant-design-vue/dist/reset.css';

// ===== 样式：UnoCSS → 全局 =====
import 'virtual:uno.css';
import './styles/index.less';

const app = createApp(App);

setupStore(app);
setupRouter(app);
setupAuthDirective(app);

app.use(VxeUI);
app.use(VxeUITable);

app.mount('#app');
