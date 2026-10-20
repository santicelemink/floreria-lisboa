import type { CartItem } from "@/types";
import { paletteBackground } from "@/components/bouquet/BouquetPreview";
import { BouquetComposer } from "@/components/bouquet/BouquetComposer";
import { BouquetPhoto } from "@/components/bouquet/BouquetPhoto";
import { PHOTOS } from "@/data/photos";
import { PRODUCT_BY_SLUG } from "@/data/products";
import { getCatalog } from "@/lib/catalogData";
import { describeBouquet, summaryLines } from "@/lib/bouquet";
import { formatPrice } from "@/lib/format";

/** ¿El ramo se ve igual que el diseño de la casa? Entonces usamos su foto. */
function matchesProductPhoto(item: CartItem) {
  const product = item.productSlug ? PRODUCT_BY_SLUG[item.productSlug] : undefined;
  if (!product || !PHOTOS[product.slug]) return false;
  const a = item.config;
  const b = product.config;
  return a.palette === b.palette && a.wrap === b.wrap && a.ribbon === b.ribbon && a.flowers.join() === b.flowers.join();
}

export function CartThumb({ item, className = "h-[84px] w-[70px]" }: { item: CartItem; className?: string }) {
  const frame = `${className} shrink-0 overflow-hidden rounded-[14px] border border-linea`;
  if (matchesProductPhoto(item)) {
    return (
      <BouquetPhoto
        slug={item.productSlug!}
        src={getCatalog().productBySlug[item.productSlug!]?.photo}
        fallback={item.config}
        alt={describeBouquet(item.config)}
        className={frame}
      />
    );
  }
  return (
    <div className={frame} style={{ background: paletteBackground(item.config.palette) }}>
      <BouquetComposer {...item.config} label={describeBouquet(item.config)} />
    </div>
  );
}

export function CartItemRow({ item, onRemove, warning }: { item: CartItem; onRemove?: () => void; warning?: string | null }) {
  const lines = summaryLines(item.config);
  return (
    <li className="flex gap-4 py-5">
      <CartThumb item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[21px] leading-tight">{item.name}</h3>
          <p className="tabular shrink-0 font-serif text-[19px] leading-tight">{formatPrice(item.price)}</p>
        </div>
        <p className="mt-1 text-[13px] leading-snug text-gris-texto">{lines.main}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-gris-texto">{lines.wrap}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-gris-texto">{lines.card}</p>
        {warning && <p className="mt-1.5 text-[13px] leading-snug text-error">{warning}</p>}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-2 rounded-sm text-[13px] text-malva-oscuro underline decoration-1 underline-offset-4 transition-colors hover:text-tinta"
            aria-label={`Quitar ${item.name} del pedido`}
          >
            Quitar
          </button>
        )}
      </div>
    </li>
  );
}
