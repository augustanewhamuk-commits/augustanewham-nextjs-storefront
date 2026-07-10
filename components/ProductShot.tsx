import Image from "next/image";
import type { ProductImage } from "@/lib/products";

/**
 * Renders a single product view. When the shot has a photo it fills its
 * (relative) parent with next/image; when it doesn't, it shows a neutral
 * placeholder labelled with the view ([front] / [side] / [back]) so the
 * product still displays everywhere.
 */
export function ProductShot({
  image,
  alt,
  sizes,
  priority,
  className,
}: {
  image: ProductImage;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (image.src) {
    return (
      <Image
        src={image.src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-brand-light-gray">
      <span className="font-body text-[11px] uppercase tracking-[0.25em] text-brand-gray">
        [{image.view}]
      </span>
      <span className="font-body text-[9px] uppercase tracking-[0.18em] text-brand-gray/70">
        Coming soon
      </span>
    </div>
  );
}
