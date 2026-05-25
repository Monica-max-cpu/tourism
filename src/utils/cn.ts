import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn-vue 标配：合并类名 + 处理冲突
 * 仅在 components/ui/** 内部使用，业务层用 UnoCSS 直接写
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
