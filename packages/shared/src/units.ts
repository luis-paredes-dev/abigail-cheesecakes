/** Measurement system used for display. Data is always stored metric (mm, g). */
export type UnitSystem = "imperial" | "metric";

export const DEFAULT_UNIT_SYSTEM: UnitSystem = "imperial";

const MM_PER_INCH = 25.4;
const GRAMS_PER_OUNCE = 28.349523125;
const GRAMS_PER_POUND = 453.59237;

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/** Drops a trailing ".0" so 15.0 shows as "15". */
function trimNumber(value: number, decimals: number): string {
  return Number(value.toFixed(decimals)).toString();
}

/** 152 mm → "6 in" (imperial, nearest ½ inch) or "15.2 cm" (metric). */
export function formatLength(mm: number, system: UnitSystem): string {
  if (system === "metric") {
    return `${trimNumber(mm / 10, 1)} cm`;
  }
  return `${trimNumber(roundTo(mm / MM_PER_INCH, 0.5), 1)} in`;
}

/** 900 g → "31.7 oz" / "900 g"; 1600 g → "3.5 lb" / "1.6 kg". */
export function formatWeight(grams: number, system: UnitSystem): string {
  if (system === "metric") {
    return grams < 1000 ? `${Math.round(grams)} g` : `${trimNumber(grams / 1000, 2)} kg`;
  }
  return grams < GRAMS_PER_POUND
    ? `${trimNumber(grams / GRAMS_PER_OUNCE, 1)} oz`
    : `${trimNumber(grams / GRAMS_PER_POUND, 1)} lb`;
}

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

/** 2200 → "£22.00". */
export function formatPrice(pence: number): string {
  return gbp.format(pence / 100);
}
