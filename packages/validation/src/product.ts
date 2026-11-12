import { z } from "zod";

/** Same rule as the database check: lowercase words joined by hyphens. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

const positiveInt = z.int().positive();

export const productSizeSchema = z.object({
  label: z.string().trim().min(1).max(50),
  diameterMm: positiveInt.optional(),
  heightMm: positiveInt.optional(),
  weightG: positiveInt.optional(),
  serves: positiveInt.optional(),
  pricePence: z.int().nonnegative(),
  isActive: z.boolean().default(true),
  sortOrder: z.int().default(0),
});

export const productSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.int().default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductSizeInput = z.infer<typeof productSizeSchema>;
