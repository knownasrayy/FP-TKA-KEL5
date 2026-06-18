import { useSyncExternalStore } from "react";
import type { Product } from "./products";

export type CartItem = { product: Product; qty: number };

const KEY = "smartshop_cart";
let items: CartItem[] = typeof window !== "undefined" ? load() : [];
const listeners = new Set<() => void>();

function load(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function persist() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

export const cart = {
  add(product: Product, qty = 1) {
    const ex = items.find((i) => i.product.id === product.id);
    if (ex) ex.qty += qty; else items = [...items, { product, qty }];
    persist();
  },
  remove(id: string) { items = items.filter((i) => i.product.id !== id); persist(); },
  setQty(id: string, qty: number) {
    items = items.map((i) => i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i);
    persist();
  },
  clear() { items = []; persist(); },
  get() { return items; },
};

export function useCart() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => items,
    () => [],
  );
}
