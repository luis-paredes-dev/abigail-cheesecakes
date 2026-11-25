/** Project-wide constants. */
export const PROJECT_NAME = "Abigail's Cheesecakes";

export {
  DEFAULT_UNIT_SYSTEM,
  formatLength,
  formatPrice,
  formatWeight,
  type UnitSystem,
} from "./units";

export {
  EMPTY_BASKET,
  MAX_ITEM_QUANTITY,
  addItem,
  basketItemCount,
  basketSubtotalPence,
  parseBasket,
  removeItem,
  setQuantity,
  type Basket,
  type BasketItem,
} from "./basket";
