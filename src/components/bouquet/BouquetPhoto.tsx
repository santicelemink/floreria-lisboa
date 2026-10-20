import { useCallback, useEffect, useState } from "react";
import type { BouquetConfig } from "@/types";
import { PALETTE_BY_ID } from "@/data/catalog";
import { PHOTOS, PHOTO_HEIGHT, PHOTO_WIDTH, photoSrc } from "@/data/photos";
import { tint } from "@/lib/color";
import { cn } from "@/lib/utils";
import { BouquetPreview } from "./BouquetPreview";

interface BouquetPhotoProps {
  slug: string;
  className?: string;
  imgClassName?: string;
  /** Solo para la imagen principal (hero): carga inmediata y prioridad alta. */
  priority?: boolean;
  alt?: string;
  /** Foto subida desde /admin (reemplaza a la del sitio). */
  src?: string;
  /** Si la foto no carga, se dibuja este ramo en SVG para que nunca quede un hueco. */
  fallback?: Pick<BouquetConfig, "palette" | "flowers" | "size" | "wrap" | "ribbon">;
}

/**
 * Foto de un ramo completo (4:5). Mientras carga se ve el color de la paleta;
 * después aparece con un fundido suave.
 */
export function BouquetPhoto({ slug, className, imgClassName, priority = false, alt, fallback, src }: BouquetPhotoProps) {
  const photo = PHOTOS[slug];
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  // Si cambia la foto (por ejemplo, desde el panel), vuelve a cargar.
  useEffect(() => setState("loading"), [src]);
  const palette = photo ? PALETTE_BY_ID[photo.palette] : PALETTE_BY_ID.marfil;

  // Si la imagen ya estaba en caché, onLoad puede dispararse antes de hidratar: lo chequeamos al montar.
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setState("loaded");
  }, []);

  if (!photo || state === "error") {
    return (
      <div className={cn("relative overflow-hidden", className)} style={{ background: tint(palette.colors[2], 0.35) }}>
        {fallback && (
          <div className="absolute inset-0 p-[6%]">
            <BouquetPreview {...fallback} label={alt ?? photo?.alt} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: tint(palette.colors[2], 0.35) }}>
      <img
        ref={ref}
        src={src ?? photoSrc(slug)}
        srcSet={src ? undefined : `${photoSrc(slug)} 1x, ${photoSrc(slug, 2)} 2x`}
        width={PHOTO_WIDTH}
        height={PHOTO_HEIGHT}
        alt={alt ?? photo.alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchpriority: "high" } : {})}
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300 ease-atelier",
          state === "loaded" ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
