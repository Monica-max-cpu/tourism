/**
 * 阶段 4 - 门店购物车 Store
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】购物车 Pinia 持久化
 * - 选项式 defineStore，双导出 useCartStore + useCartStoreWithOut
 * - localStorage 持久化（按 storeId 隔离）
 * - 仅保存抽象 SKU + salePrice，绝不出现 costPrice / supplierName / profit
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】购物车 Pinia 持久化
 */
import { defineStore } from 'pinia';
import { store } from '/@/stores';
import type { CartItem, StoreCatalogItem } from '/#/b2b-store';

const STORAGE_PREFIX = 'b2b:store:cart:';

interface CartState {
  storeId: string;
  items: CartItem[];
  selectedIds: string[];
}

function readStorage(storeId: string): CartItem[] {
  if (!storeId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storeId);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(storeId: string, items: CartItem[]) {
  if (!storeId) return;
  try {
    localStorage.setItem(STORAGE_PREFIX + storeId, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export const useCartStore = defineStore({
  id: 'b2b-store-cart',
  state: (): CartState => ({
    storeId: '',
    items: [],
    selectedIds: [],
  }),
  getters: {
    getItems(state): CartItem[] {
      return state.items;
    },
    getCount(state): number {
      return state.items.reduce((s, x) => s + x.qty, 0);
    },
    getSelectedItems(state): CartItem[] {
      return state.items.filter((x) => state.selectedIds.includes(x.catalogId));
    },
    getSelectedAmount(state): number {
      const sum = state.items
        .filter((x) => state.selectedIds.includes(x.catalogId))
        .reduce((s, x) => s + x.salePrice * x.qty, 0);
      return +sum.toFixed(2);
    },
    isAllSelected(state): boolean {
      return state.items.length > 0 && state.selectedIds.length === state.items.length;
    },
  },
  actions: {
    init(storeId: string) {
      this.storeId = storeId || '';
      this.items = readStorage(this.storeId);
      const ids = new Set(this.items.map((x) => x.catalogId));
      this.selectedIds = this.selectedIds.filter((id) => ids.has(id));
    },
    switchStore(storeId: string) {
      this.storeId = storeId || '';
      this.items = readStorage(this.storeId);
      this.selectedIds = [];
    },
    persist() {
      writeStorage(this.storeId, this.items);
    },
    addItem(catalog: StoreCatalogItem, qty = 1) {
      if (qty <= 0) return;
      const exist = this.items.find((x) => x.catalogId === catalog.id);
      if (exist) {
        exist.qty += qty;
        if (catalog.availableQty != null && exist.qty > catalog.availableQty) {
          exist.qty = catalog.availableQty;
        }
      } else {
        this.items.unshift({
          catalogId: catalog.id,
          productSku: catalog.productSku,
          productName: catalog.productName,
          unit: catalog.unit,
          salePrice: catalog.salePrice,
          qty,
          cover: catalog.cover,
          availableQty: catalog.availableQty,
          minQty: catalog.minQty,
          addedAt: new Date().toISOString(),
        });
        if (!this.selectedIds.includes(catalog.id)) this.selectedIds.push(catalog.id);
      }
      this.persist();
    },
    updateQty(catalogId: string, qty: number) {
      const item = this.items.find((x) => x.catalogId === catalogId);
      if (!item) return;
      const min = item.minQty || 1;
      const max = item.availableQty ?? Number.MAX_SAFE_INTEGER;
      item.qty = Math.max(min, Math.min(qty, max));
      this.persist();
    },
    removeItem(catalogId: string) {
      this.items = this.items.filter((x) => x.catalogId !== catalogId);
      this.selectedIds = this.selectedIds.filter((id) => id !== catalogId);
      this.persist();
    },
    removeBatch(catalogIds: string[]) {
      const set = new Set(catalogIds);
      this.items = this.items.filter((x) => !set.has(x.catalogId));
      this.selectedIds = this.selectedIds.filter((id) => !set.has(id));
      this.persist();
    },
    clear() {
      this.items = [];
      this.selectedIds = [];
      this.persist();
    },
    toggleSelect(catalogId: string, v?: boolean) {
      const idx = this.selectedIds.indexOf(catalogId);
      const want = v === undefined ? idx === -1 : v;
      if (want && idx === -1) this.selectedIds.push(catalogId);
      else if (!want && idx >= 0) this.selectedIds.splice(idx, 1);
    },
    toggleSelectAll(v?: boolean) {
      const want = v === undefined ? !this.isAllSelected : v;
      this.selectedIds = want ? this.items.map((x) => x.catalogId) : [];
    },
  },
});

export function useCartStoreWithOut() {
  return useCartStore(store);
}
