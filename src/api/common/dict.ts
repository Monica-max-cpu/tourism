/**
 * JeecgBoot 字典接口封装
 * update-begin--author:phase7---date:2026-05-25---for:【阶段7】对接 sys/dict/getDictItems
 * - 客户端 Map 缓存,同一 dictCode 仅请求一次
 * - 失败时降级为空数组,不阻塞业务渲染
 * update-end--author:phase7---date:2026-05-25---for:【阶段7】对接 sys/dict/getDictItems
 */
import { defHttp } from '/@/api/http';

export interface DictItem {
  label: string;
  value: string;
}

const cache = new Map<string, DictItem[]>();

export async function getDictItems(dictCode: string): Promise<DictItem[]> {
  if (cache.has(dictCode)) return cache.get(dictCode)!;
  try {
    const list = await defHttp.get<DictItem[]>({ url: `/sys/dict/getDictItems/${dictCode}` });
    const safe = Array.isArray(list) ? list : [];
    cache.set(dictCode, safe);
    return safe;
  } catch {
    return [];
  }
}

export function clearDictCache(code?: string) {
  if (code) cache.delete(code);
  else cache.clear();
}
