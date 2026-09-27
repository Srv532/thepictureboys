import { mediaUrl, type ImageAsset } from "@/lib/media";

const srcset = (list: { w: number; src: string }[]) => list.map((s) => `${mediaUrl(s.src)} ${s.w}w`).join(", ");

type Props = {
  image: ImageAsset;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** "cover" fills the parent box; "natural" keeps the aspect ratio. */
  fit?: "cover" | "natural";
};

/** AVIF → WebP → JPEG with responsive widths and a blurred placeholder. Works in every browser. */
export function Picture({ image, alt, sizes = "100vw", className, priority, fit = "natural" }: Props) {
  const jpeg = image.sources.jpeg;
  const cover = fit === "cover";
  return (
    <picture className={className} style={{ display: "block", ...(cover ? { position: "absolute", inset: 0 } : {}) }}>
      {image.sources.avif.length > 0 && <source type="image/avif" srcSet={srcset(image.sources.avif)} sizes={sizes} />}
      {image.sources.webp.length > 0 && <source type="image/webp" srcSet={srcset(image.sources.webp)} sizes={sizes} />}
      <img
        src={mediaUrl(jpeg[jpeg.length - 1].src)}
        srcSet={srcset(jpeg)}
        sizes={sizes}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        style={{
          width: "100%",
          height: cover ? "100%" : "auto",
          objectFit: "cover",
          backgroundImage: `url(${image.blurDataURL})`,
          backgroundSize: "cover",
        }}
      />
    </picture>
  );
}
