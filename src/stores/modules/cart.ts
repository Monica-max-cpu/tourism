/**
 * 阶段 4 - 门店购物车 Store
 * update-begin--author:claude---date:2026-05-26---for:【阶段7】支持阶梯价计算
 * update-end--author:claude---date:2026-05-26---for:【阶段7】支持阶梯价计算
 */
import { defineStore } from 'pinia';
import { store } from '/@/stores';
import type { CartItem, StoreCatalogItem, CatalogTier } from '/#/b2b-store';

const STORAGE_PREFIX = 'b2b:store:cart:';

/** 按数量匹配阶梯单价，命中区间 [minQty, maxQty] 则返回对应 unitPrice，未命中返回 basePrice */
function matchTierPrice(qty: number, basePrice: number, tiers?: CatalogTier[]): number {
  if (!tiers || !tiers.length) return basePrice;
  const match = tiers.find((t) => qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty));
  return match ? match.unitPrice : basePrice;
}

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
    getItemLineTotal(state) {
      return (catalogId: string): number => {
        const item = state.items.find((x) => x.catalogId === catalogId);
        if (!item) return 0;
        const price = matchTierPrice(item.qty, item.basePrice, item.catalogTiers);
        return +(price * item.qty).toFixed(2);
      };
    },
    getItemUnitPrice(state) {
      return (catalogId: string): number => {
        const item = state.items.find((x) => x.catalogId === catalogId);
        if (!item) return 0;
        return matchTierPrice(item.qty, item.basePrice, item.catalogTiers);
      };
    },
    getSelectedAmount(state): number {
      const sum = state.items
        .filter((x) => state.selectedIds.includes(x.catalogId))
        .reduce((s, x) => {
          const price = matchTierPrice(x.qty, x.basePrice, x.catalogTiers);
          return s + price * x.qty;
        }, 0);
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
      } else {
        this.items.unshift({
          catalogId: catalog.id,
          productName: catalog.productName,
          unit: catalog.unit,
          basePrice: catalog.basePrice,
          qty,
          productImages: catalog.productImages,
          minOrderQty: catalog.minOrderQty,
          catalogTiers: catalog.catalogTiers,
          addedAt: new Date().toISOString(),
        });
        if (!this.selectedIds.includes(catalog.id)) this.selectedIds.push(catalog.id);
      }
      this.persist();
    },
    updateQty(catalogId: string, qty: number) {
      const item = this.items.find((x) => x.catalogId === catalogId);
      if (!item) return;
      const min = item.minOrderQty || 1;
      item.qty = Math.max(min, qty);
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
