import { useMemo } from "react";
import type { BouquetConfig, FlowerId } from "@/types";
import {
  ATELIER,
  CARD_DESIGNS,
  EXTRAS,
  FLOWERS,
  FLOWER_BY_ID,
  SIZES,
  WHATSAPP_NUMBER,
  WRAPS,
} from "@/data/catalog";
import { PRODUCTS, type Product } from "@/data/products";
import { useCatalogStore } from "@/store/catalog";

/**
 * Catálogo vigente: los valores de fábrica más lo que los dueños cambiaron en /admin.
 * Las funciones get* leen el estado sin suscribirse (para cálculos); useCatalog() se
 * suscribe, así las pantallas se actualizan apenas cambia algo en el panel.
 */
type State = ReturnType<typeof useCatalogStore.getState>;

function build(s: State) {
  const pick = <T,>(value: T | undefined, fallback: T) => (value === undefined ? fallback : value);
  const sizes = SIZES.map((x) => ({ ...x, base: pick(s.sizeBase[x.id], x.base) }));
  const flowers = FLOWERS.map((x) => ({
    ...x,
    surcharge: pick(s.flowerSurcharge[x.id], x.surcharge),
    available: !s.flowerUnavailable.includes(x.id),
  }));
  const wraps = WRAPS.map((x) => ({ ...x, surcharge: pick(s.wrapSurcharge[x.id], x.surcharge) }));
  const cards = CARD_DESIGNS.map((x) => ({ ...x, surcharge: pick(s.cardSurcharge[x.id], x.surcharge) }));
  const extras = EXTRAS.map((x) => ({ ...x, price: pick(s.extraPrice[x.id], x.price) }));

  const order = s.productOrder.length ? s.productOrder : PRODUCTS.map((p) => p.slug);
  const allProducts: (Product & { hidden: boolean; photo?: string })[] = [...PRODUCTS]
    .sort((a, b) => {
      const ia = order.indexOf(a.slug);
      const ib = order.indexOf(b.slug);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    })
    .map((p) => {
      const e = s.products[p.slug] ?? {};
      return {
        ...p,
        name: e.name?.trim() || p.name,
        description: e.description?.trim() || p.description,
        tag: e.tag === undefined ? p.tag : e.tag.trim() || undefined,
        hidden: e.hidden ?? false,
        photo: e.photo,
      };
    });

  const business = {
    whatsapp: s.business.whatsapp?.replace(/\D/g, "") || WHATSAPP_NUMBER,
    address: s.business.address?.trim() || ATELIER.address,
    hours: ATELIER.hours,
  };

  return {
    sizes,
    flowers,
    wraps,
    cards,
    extras,
    allProducts,
    products: allProducts.filter((p) => !p.hidden),
    business,
    sizeById: Object.fromEntries(sizes.map((x) => [x.id, x])) as Record<string, (typeof sizes)[number]>,
    flowerById: Object.fromEntries(flowers.map((x) => [x.id, x])) as Record<string, (typeof flowers)[number]>,
    wrapById: Object.fromEntries(wraps.map((x) => [x.id, x])) as Record<string, (typeof wraps)[number]>,
    cardById: Object.fromEntries(cards.map((x) => [x.id, x])) as Record<string, (typeof cards)[number]>,
    extraById: Object.fromEntries(extras.map((x) => [x.id, x])) as Record<string, (typeof extras)[number]>,
    productBySlug: Object.fromEntries(allProducts.map((p) => [p.slug, p])) as Record<string, (typeof allProducts)[number]>,
  };
}

export type Catalog = ReturnType<typeof build>;

let cache: { state: State; catalog: Catalog } | null = null;

export function getCatalog(): Catalog {
  const state = useCatalogStore.getState();
  if (!cache || cache.state !== state) cache = { state, catalog: build(state) };
  return cache.catalog;
}

export function useCatalog(): Catalog {
  const state = useCatalogStore();
  return useMemo(() => {
    if (!cache || cache.state !== state) cache = { state, catalog: build(state) };
    return cache.catalog;
  }, [state]);
}

/** Variedades del diseño que la florería marcó como no disponibles. */
export function unavailableFlowers(config: Pick<BouquetConfig, "flowers">, catalog: Catalog = getCatalog()): FlowerId[] {
  return config.flowers.filter((f) => catalog.flowerById[f] && !catalog.flowerById[f].available);
}

export function unavailableMessage(flowers: FlowerId[]) {
  if (!flowers.length) return null;
  const names = flowers.map((f) => FLOWER_BY_ID[f].plural);
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  return `Esta semana no tenemos ${list}. Cambiá esa variedad en el paso de las flores.`;
}

export function whatsappLink(text: string) {
  return `https://wa.me/${getCatalog().business.whatsapp}?text=${encodeURIComponent(text)}`;
}
