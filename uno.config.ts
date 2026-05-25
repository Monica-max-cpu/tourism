import {
  defineConfig,
  presetWind3,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

// update-begin--author:claude---date:2026-05-24---for:【B2B-阶段1】UnoCSS 业务层配置
// 业务层（views/**、components 非 ui/**）使用此配置；shadcn-vue 内部走 Tailwind。
// 共用 theme.less 中的 CSS 变量（--background、--primary 等），实现两套生成器对同一 token。
// update-end--author:claude---date:2026-05-24---for:【B2B-阶段1】UnoCSS 业务层配置

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.(vue|ts|tsx)($|\?)/],
      exclude: ['src/components/ui/**'],
    },
  },
  presets: [
    presetWind3({ dark: 'class' }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {},
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      // 与 shadcn token 对齐，两套生成器使用同一组 CSS 变量
      background: 'hsl(var(--background) / <alpha-value>)',
      foreground: 'hsl(var(--foreground) / <alpha-value>)',
      card: {
        DEFAULT: 'hsl(var(--card) / <alpha-value>)',
        foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
        foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
      },
      primary: {
        DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
        foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
        foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
        foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
        foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
      },
      sidebar: {
        DEFAULT: 'hsl(var(--sidebar) / <alpha-value>)',
        foreground: 'hsl(var(--sidebar-foreground) / <alpha-value>)',
        primary: 'hsl(var(--sidebar-primary) / <alpha-value>)',
        'primary-foreground': 'hsl(var(--sidebar-primary-foreground) / <alpha-value>)',
        accent: 'hsl(var(--sidebar-accent) / <alpha-value>)',
        'accent-foreground': 'hsl(var(--sidebar-accent-foreground) / <alpha-value>)',
        border: 'hsl(var(--sidebar-border) / <alpha-value>)',
        ring: 'hsl(var(--sidebar-ring) / <alpha-value>)',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
        foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
      },
      border: 'hsl(var(--border) / <alpha-value>)',
      input: 'hsl(var(--input) / <alpha-value>)',
      ring: 'hsl(var(--ring) / <alpha-value>)',
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
    boxShadow: {
      'card-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      glow: '0 0 0 1px hsl(var(--primary) / 0.1), 0 4px 12px -2px hsl(var(--primary) / 0.15)',
    },
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-col-center': 'flex flex-col items-center justify-center',
    'card-base': 'bg-card rounded-xl border border-border shadow-card-sm',
    'page-container': 'container mx-auto px-6 py-8',
  },
  safelist: [
    'animate-spin',
    'animate-pulse',
    ...Array.from({ length: 12 }).map((_, i) => `delay-${i * 100}`),
  ],
});
