export { createDatabaseClient, type DatabaseClient } from "./client";
export type { Database, Json } from "./types.generated";

export { getActiveProducts, getProductBySlug, type ProductWithSizes } from "./queries/products";
export { createOrder, type CreateOrderInput, type OrderItemInput } from "./queries/orders";
