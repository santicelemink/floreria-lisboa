import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CardDesignId, ExtraId, FlowerId, SizeId, WrapId } from "@/types";
import { safeStorage } from "@/lib/storage";

/**
 * Lo que los dueños editan desde /admin. Solo se guardan los cambios: todo lo que no
 * se tocó sale de los valores de fábrica (data/catalog.ts y data/products.ts).
 *
 * En el prototipo vive en el navegador (localStorage). En producción se reemplaza por
 * tablas de Supabase con suscripción en tiempo real, sin cambiar las pantallas.
 */
export interface ProductEdit {
  name?: string;
  description?: string;
  tag?: string;
  hidden?: boolean;
  /** Foto subida desde el panel (data URL 4:5). */
  photo?: string;
}

export interface BusinessInfo {
  whatsapp?: string;
  address?: string;
}

interface CatalogState {
  sizeBase: Partial<Record<SizeId, number>>;
  flowerSurcharge: Partial<Record<FlowerId, number>>;
  flowerUnavailable: FlowerId[];
  wrapSurcharge: Partial<Record<WrapId, number>>;
  cardSurcharge: Partial<Record<CardDesignId, number>>;
  extraPrice: Partial<Record<ExtraId, number>>;
  products: Record<string, ProductEdit>;
  /** Orden de los diseños de la casa (slugs). Vacío = orden original. */
  productOrder: string[];
  business: BusinessInfo;
  setPrice: (
    group: "sizeBase" | "flowerSurcharge" | "wrapSurcharge" | "cardSurcharge" | "extraPrice",
    id: string,
    value: number,
  ) => void;
  setFlowerAvailable: (id: FlowerId, available: boolean) => void;
  editProduct: (slug: string, edit: ProductEdit) => void;
  setProductOrder: (order: string[]) => void;
  setBusiness: (info: BusinessInfo) => void;
  resetAll: () => void;
}

const EMPTY = {
  sizeBase: {},
  flowerSurcharge: {},
  flowerUnavailable: [] as FlowerId[],
  wrapSurcharge: {},
  cardSurcharge: {},
  extraPrice: {},
  products: {},
  productOrder: [] as string[],
  business: {},
};

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      ...EMPTY,
      setPrice: (group, id, value) =>
        set((s) => ({ [group]: { ...s[group], [id]: Math.max(0, Math.round(value)) } }) as Partial<CatalogState>),
      setFlowerAvailable: (id, available) =>
        set((s) => ({
          flowerUnavailable: available ? s.flowerUnavailable.filter((f) => f !== id) : [...new Set([...s.flowerUnavailable, id])],
        })),
      editProduct: (slug, edit) => set((s) => ({ products: { ...s.products, [slug]: { ...s.products[slug], ...edit } } })),
      setProductOrder: (productOrder) => set({ productOrder }),
      setBusiness: (info) => set((s) => ({ business: { ...s.business, ...info } })),
      resetAll: () => set({ ...EMPTY }),
    }),
    {
      name: "lisboa-catalogo",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        sizeBase: s.sizeBase,
        flowerSurcharge: s.flowerSurcharge,
        flowerUnavailable: s.flowerUnavailable,
        wrapSurcharge: s.wrapSurcharge,
        cardSurcharge: s.cardSurcharge,
        extraPrice: s.extraPrice,
        products: s.products,
        productOrder: s.productOrder,
        business: s.business,
      }),
    },
  ),
);
