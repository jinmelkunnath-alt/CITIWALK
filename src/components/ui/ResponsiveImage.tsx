import type { ImgHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ResponsiveImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "loading" | "alt"
> & {
  src: string;
  alt: string;
  webpSrcSet?: string;
  avifSrcSet?: string;
  fallbackSrcSet?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Production image primitive with AVIF/WebP negotiation, responsive source sets,
 * intrinsic dimensions, async decoding, and explicit priority behavior.
 */
export function ResponsiveImage({
  src,
  webpSrcSet,
  avifSrcSet,
  fallbackSrcSet,
  sizes = "100vw",
  priority = false,
  className,
  alt,
  ...props
}: ResponsiveImageProps) {
  return (
    <picture>
      {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
      {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
      <img
        src={src}
        srcSet={fallbackSrcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={cn("block max-w-full", className)}
        {...props}
      />
    </picture>
  );
}
