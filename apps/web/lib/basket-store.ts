import { useSyncExternalStore } from "react";

import {
  EMPTY_BASKET,
  addItem,
  basketItemCount,
  basketSubtotalPence,
  parseBasket,
  removeItem,
  setQuantity,
  type Basket,
  type BasketItem,
} from "@abigail/shared";

const STORAGE_KEY = "abigail-cheesecakes:basket";

const listeners = new Set<() => void>();

// The last value read from localStorage, so React gets the same object back
// until the basket actually changes.
let cachedRaw: string | null = null;
let cachedBasket: Basket = EMPTY_BASKET;

function readBasket(): Basket {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked (e.g. private mode): keep the in-memory basket.
    return cachedBasket;
  }

  if (raw === cachedRaw) {
    return cachedBasket;
  }

  cachedRaw = raw;
  try {
    cachedBasket = raw === null ? EMPTY_BASKET : parseBasket(JSON.parse(raw));
  } catch {
    cachedBasket = EMPTY_BASKET;
  }
  return cachedBasket;
}

function writeBasket(basket: Basket): void {
  cachedBasket = basket;
  try {
    const raw = JSON.stringify(basket);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
  } catch {
    // Storage full or blocked: the basket still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Keep several open tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// The server can't see localStorage, so it always renders an empty basket.
// React then swaps in the saved basket after the page loads, without a hydration error.
function getServerSnapshot(): Basket {
  return EMPTY_BASKET;
}

function update(change: (basket: Basket) => Basket): void {
  writeBasket(change(readBasket()));
}

/** Empties the basket, e.g. after an order is placed. */
export function clearBasket(): void {
  writeBasket(EMPTY_BASKET);
}

/** The visitor's basket, saved in the browser. Use only in Client Components. */
export function useBasket() {
  const basket = useSyncExternalStore(subscribe, readBasket, getServerSnapshot);

  return {
    basket,
    itemCount: basketItemCount(basket),
    subtotalPence: basketSubtotalPence(basket),
    add: (item: Omit<BasketItem, "quantity">, quantity = 1) =>
      update((current) => addItem(current, item, quantity)),
    setQuantity: (productSizeId: string, quantity: number) =>
      update((current) => setQuantity(current, productSizeId, quantity)),
    remove: (productSizeId: string) => update((current) => removeItem(current, productSizeId)),
    clear: clearBasket,
  };
}
