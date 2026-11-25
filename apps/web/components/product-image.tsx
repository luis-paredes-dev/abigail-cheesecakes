import fs from "node:fs";
import path from "node:path";

import Image from "next/image";
import { CakeSlice } from "lucide-react";

/**
 * Local preview photos live in apps/web/public/images/products, named after the
 * product's slug: new-york-classic.jpg, basque-burnt.png, biscoff.webp, ...
 *
 * The folder is git-ignored, so these photos are never published. Anywhere the
 * folder is missing (e.g. the deployed site), a "Photo coming soon" placeholder shows.
 * Real photos will come from Supabase Storage via the admin panel (Block 3).
 *
 * Server-only: reads the file system, so only use it in Server Components.
 */
const IMAGE_DIR = path.join(process.cwd(), "public", "images", "products");
const EXTENSIONS = ["webp", "avif", "jpg", "jpeg", "png"];

function findLocalImage(slug: string): string | null {
  for (const extension of EXTENSIONS) {
    const fileName = `${slug}.${extension}`;
    if (fs.existsSync(path.join(IMAGE_DIR, fileName))) {
      return `/images/products/${fileName}`;
    }
  }
  return null;
}

type Props = {
  slug: string;
  name: string;
  /** Tells the browser how wide the image is shown, so it downloads the right size. */
  sizes: string;
  className?: string;
  /** Load straight away instead of lazily. Use for the main image at the top of a page. */
  eager?: boolean;
};

export function ProductImage({ slug, name, sizes, className = "", eager = false }: Props) {
  const src = findLocalImage(slug);

  return (
    <div className={`relative aspect-square w-full overflow-hidden bg-secondary ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={`${name} cheesecake`}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-secondary-foreground">
          <CakeSlice aria-hidden="true" className="size-10" strokeWidth={1.5} />
          <p className="text-sm">Photo coming soon</p>
        </div>
      )}
    </div>
  );
}
