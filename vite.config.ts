import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import unocss from 'unocss/vite';
import { resolve } from 'node:path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

// update-begin--author:claude---date:2026-05-24---for:【B2B-阶段1】Vite 基础配置 + qiankun 占位
// 注意：阶段 1 不接 qiankun，但保留 base / output.libraryTarget 占位，便于后续接入。
// update-end--author:claude---date:2026-05-24---for:【B2B-阶段1】Vite 基础配置 + qiankun 占位

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    base: env.VITE_BASE || '/',
    resolve: {
      alias: {
        '/@': resolve(__dirname, 'src'),
        '/#': resolve(__dirname, 'types'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "/@/styles/theme.less";`,
        },
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      unocss(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'types/auto-imports.d.ts',
        eslintrc: { enabled: true },
      }),
      Components({
        dirs: ['src/components/ui', 'src/components/Basic*'],
        extensions: ['vue'],
        deep: true,
        dts: 'types/components.d.ts',
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/sys': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
        },
        '/b2b': {
          // 直连 B2B 服务，绕过网关
          target: 'http://127.0.0.1:7015',
          changeOrigin: true,
          bypass(req) {
            if (req.headers.accept?.includes('text/html')) {
              return '/index.html';
            }
          },
        },
      },
    },
    build: {
      target: 'es2020',
      sourcemap: !isProd,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            vxe: ['vxe-table', 'vxe-table-plugin-antd', 'ant-design-vue'],
            echarts: ['echarts', 'vue-echarts'],
            radix: ['radix-vue'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'axios', 'dayjs'],
    },
    // optimizeDeps: {
    //   include: ['vue', 'vue-router', 'pinia', 'axios', 'dayjs', 'radix-vue'],
    // },
  };
});
