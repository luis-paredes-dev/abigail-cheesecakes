/**
 * Shown on every storefront page while the site is a demo.
 * Turn it off by removing `NEXT_PUBLIC_PREVIEW_MODE` (or setting it to
 * anything other than "true") in Vercel, then redeploying.
 */
export function PreviewBanner() {
  if (process.env.NEXT_PUBLIC_PREVIEW_MODE !== "true") {
    return null;
  }

  return (
    <div role="note" className="bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
      Preview site: prices are placeholders and orders aren&apos;t being taken yet.
    </div>
  );
}
