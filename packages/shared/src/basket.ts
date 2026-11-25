/**
 * Basket logic shared by every app: plain functions with no React and no storage,
 * so a future mobile app can reuse them unchanged.
 *
 * The basket keeps a copy of names and prices for display only. The real prices
 * are always read from the database by place_order when the order is placed.
 */

/** Same limit as orderItemSchema in @abigail/validation. */
export const MAX_ITEM_QUANTITY = 20;

export type BasketItem = {
  productSizeId: string;
  productSlug: string;
  productName: string;
  sizeLabel: string;
  unitPricePence: number;
  quantity: number;
};

export type Basket = {
  items: BasketItem[];
};

export const EMPTY_BASKET: Basket = { items: [] };

/** Keeps a quantity between 0 and the maximum, as a whole number. */
function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 0;
  }
  return Math.min(Math.max(Math.trunc(quantity), 0), MAX_ITEM_QUANTITY);
}

/** Sets an item's quantity. A quantity of 0 or less removes the item. */
export function setQuantity(basket: Basket, productSizeId: string, quantity: number): Basket {
  const clamped = clampQuantity(quantity);
  if (clamped === 0) {
    return removeItem(basket, productSizeId);
  }
  return {
    items: basket.items.map((item) =>
      item.productSizeId === productSizeId ? { ...item, quantity: clamped } : item,
    ),
  };
}

/** Adds an item, or increases its quantity if that size is already in the basket. */
export function addItem(basket: Basket, item: Omit<BasketItem, "quantity">, quantity = 1): Basket {
  const existing = basket.items.find((i) => i.productSizeId === item.productSizeId);
  if (existing) {
    return setQuantity(basket, item.productSizeId, existing.quantity + quantity);
  }

  const clamped = clampQuantity(quantity);
  if (clamped === 0) {
    return basket;
  }
  return { items: [...basket.items, { ...item, quantity: clamped }] };
}

export function removeItem(basket: Basket, productSizeId: string): Basket {
  return { items: basket.items.filter((item) => item.productSizeId !== productSizeId) };
}

/** Total number of cheesecakes in the basket. */
export function basketItemCount(basket: Basket): number {
  return basket.items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Display subtotal in pence. The order total is recalculated by the database. */
export function basketSubtotalPence(basket: Basket): number {
  return basket.items.reduce((sum, item) => sum + item.unitPricePence * item.quantity, 0);
}

function isBasketItem(value: unknown): value is BasketItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.productSizeId === "string" &&
    typeof v.productSlug === "string" &&
    typeof v.productName === "string" &&
    typeof v.sizeLabel === "string" &&
    typeof v.unitPricePence === "number" &&
    Number.isInteger(v.unitPricePence) &&
    v.unitPricePence >= 0 &&
    typeof v.quantity === "number"
  );
}

/** Turns saved data back into a basket, dropping anything malformed. */
export function parseBasket(value: unknown): Basket {
  if (typeof value !== "object" || value === null) {
    return EMPTY_BASKET;
  }
  const items: unknown = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) {
    return EMPTY_BASKET;
  }

  return {
    items: (items as unknown[])
      .filter(isBasketItem)
      .map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))
      .filter((item) => item.quantity > 0),
  };
}
