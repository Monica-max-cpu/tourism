/**
 * update-begin--author:claude---date:2026-05-24---for:【修复】Select 空值哨兵
 * radix-vue 的 SelectItem 不允许 value=''，业务字典又坚持 { value: '', label: '全部' } 写法。
 * 这里定义一个统一哨兵，由 Select.vue / SelectItem.vue 内部做 '' ↔ '__ALL__' 双向映射，对外完全透明。
 * update-end--author:claude---date:2026-05-24---for:【修复】Select 空值哨兵
 */
export const SELECT_EMPTY_SENTINEL = '__ALL__';

export const toInnerValue = (v: unknown): string => {
  if (v === '' || v === undefined || v === null) return SELECT_EMPTY_SENTINEL;
  return String(v);
};

export const toOuterValue = (v: string): string => {
  return v === SELECT_EMPTY_SENTINEL ? '' : v;
};
