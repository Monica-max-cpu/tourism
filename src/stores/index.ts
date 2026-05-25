/**
 * Pinia 入口
 */
import { createPinia } from 'pinia';

export const store = createPinia();

export function setupStore(app: import('vue').App) {
  app.use(store);
}
