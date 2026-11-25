"use client";

import { useState } from "react";

import type { ProductWithSizes } from "@abigail/database";
import {
  DEFAULT_UNIT_SYSTEM,
  MAX_ITEM_QUANTITY,
  formatLength,
  formatPrice,
  formatWeight,
  type UnitSystem,
} from "@abigail/shared";

import { Button } from "@/components/ui/button";
import { useBasket } from "@/lib/basket-store";

type Size = ProductWithSizes["product_sizes"][number];

type Props = {
  productName: string;
  productSlug: string;
  sizes: Size[];
};

const UNIT_OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: "imperial", label: "Imperial" },
  { value: "metric", label: "Metric" },
];

export function ProductSizes({ productName, productSlug, sizes }: Props) {
  const [system, setSystem] = useState<UnitSystem>(DEFAULT_UNIT_SYSTEM);
  const [status, setStatus] = useState<string | null>(null);
  const { basket, add, setQuantity } = useBasket();

  if (sizes.length === 0) {
    return <p className="text-muted-foreground">No sizes are available right now.</p>;
  }

  function quantityInBasket(sizeId: string): number {
    return basket.items.find((item) => item.productSizeId === sizeId)?.quantity ?? 0;
  }

  function handleAdd(size: Size) {
    add({
      productSizeId: size.id,
      productSlug,
      productName,
      sizeLabel: size.label,
      unitPricePence: size.price_pence,
    });
    setStatus(`${productName} (${size.label}) added to your basket.`);
  }

  function handleChange(size: Size, quantity: number) {
    setQuantity(size.id, quantity);
    setStatus(
      quantity > 0
        ? `${productName} (${size.label}): ${quantity} in your basket.`
        : `${productName} (${size.label}) removed from your basket.`,
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Sizes</h2>
        <div role="group" aria-label="Measurement units" className="flex gap-1">
          {UNIT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={system === option.value ? "default" : "outline"}
              aria-pressed={system === option.value}
              onClick={() => setSystem(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <ul className="mt-4 divide-y rounded-xl border bg-card">
        {sizes.map((size) => {
          // The heading follows the unit toggle when we know the diameter;
          // otherwise it falls back to the size's stored name.
          const heading =
            size.diameter_mm !== null
              ? `${formatLength(size.diameter_mm, system)} diameter`
              : size.label;

          const details = [
            size.height_mm !== null && `${formatLength(size.height_mm, system)} tall`,
            size.weight_g !== null && formatWeight(size.weight_g, system),
            size.serves !== null && `serves ${size.serves}`,
          ].filter(Boolean);

          const quantity = quantityInBasket(size.id);
          const itemName = `${productName}, ${size.label}`;

          return (
            <li key={size.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{heading}</p>
                {details.length > 0 && (
                  <p className="text-sm text-muted-foreground">{details.join(" · ")}</p>
                )}
                {quantity > 0 && (
                  <p className="mt-1 text-sm font-medium text-primary">{quantity} in your basket</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <p className="font-semibold tabular-nums">{formatPrice(size.price_pence)}</p>
                {quantity === 0 ? (
                  <Button
                    type="button"
                    size="sm"
                    aria-label={`Add ${itemName} to basket`}
                    onClick={() => handleAdd(size)}
                  >
                    Add
                  </Button>
                ) : (
                  <div
                    role="group"
                    aria-label={`Quantity of ${itemName}`}
                    className="flex items-center gap-2"
                  >
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label={`Remove one ${itemName}`}
                      onClick={() => handleChange(size, quantity - 1)}
                    >
                      −
                    </Button>
                    <span className="w-6 text-center font-semibold tabular-nums">{quantity}</span>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label={`Add one more ${itemName}`}
                      disabled={quantity >= MAX_ITEM_QUANTITY}
                      onClick={() => handleChange(size, quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Announced by screen readers; also visible confirmation for everyone. */}
      <p role="status" className="mt-3 min-h-5 text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  );
}
