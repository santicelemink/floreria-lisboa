import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { BouquetPhoto } from "@/components/bouquet/BouquetPhoto";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { calculatePrice } from "@/lib/pricing";
import { unavailableFlowers, useCatalog } from "@/lib/catalogData";
import { FLOWER_BY_ID } from "@/data/catalog";

export function ProductCard({
  product,
  onCustomize,
  onAdd,
  headingLevel: Heading = "h3",
}: {
  headingLevel?: "h2" | "h3";
  product: Product & { photo?: string };
  onCustomize: () => void;
  onAdd: () => void;
}) {
  const catalog = useCatalog();
  const price = calculatePrice(product.config, catalog);
  const missing = unavailableFlowers(product.config, catalog);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-linea bg-marfil transition-[transform,box-shadow] duration-300 ease-atelier hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/producto/${product.slug}`} className="relative block overflow-hidden rounded-t-card" aria-label={`Ver ${product.name}`}>
        <BouquetPhoto
          slug={product.slug}
          src={product.photo}
          fallback={product.config}
          className="aspect-[4/5]"
          imgClassName="transition-[opacity,transform] duration-500 ease-atelier group-hover:scale-[1.04]"
        />
        {missing.length > 0 && (
          <span className="absolute bottom-3 left-3 right-3 rounded-full bg-papel/95 px-3 py-1.5 text-center text-[12px] text-error backdrop-blur">
            Sin {missing.map((f) => FLOWER_BY_ID[f].plural).join(" ni ")} esta semana
          </span>
        )}
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-papel/90 px-3 py-1 text-[12px] tracking-[0.02em] text-tinta backdrop-blur">
            {product.tag}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <Heading className="font-serif text-[24px] leading-tight sm:text-[26px]">
            <Link to={`/producto/${product.slug}`} className="rounded-sm hover:text-malva-oscuro">
              {product.name}
            </Link>
          </Heading>
          <p className="tabular font-serif text-[20px] sm:text-[21px]">{formatPrice(price)}</p>
        </div>
        <p className="mt-1.5 text-[14px] leading-snug text-gris-texto">{product.description}</p>
        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <Button variant="secondary" size="xs" onClick={onCustomize} aria-label={`Personalizar ${product.name}`}>
            Personalizar
          </Button>
          <Button size="xs" onClick={onAdd} disabled={missing.length > 0} aria-label={`Agregar ${product.name} al pedido`}>
            Agregar
          </Button>
        </div>
      </div>
    </article>
  );
}
