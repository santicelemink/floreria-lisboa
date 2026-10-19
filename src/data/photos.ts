import type { PaletteId } from "@/types";

/**
 * Fotos de ramos completos (hero, colección, fichas y carrito).
 * Cada archivo existe en dos resoluciones: {slug}.webp (640 × 800) y {slug}@2x.webp (1280 × 1600).
 * Mientras no estén las fotos definitivas, en /public/images/ramos hay imágenes provisorias
 * con el mismo encuadre. Ver la lista de fotos a producir en el README.
 */
export interface BouquetPhoto {
  slug: string;
  alt: string;
  palette: PaletteId;
  /** Descripción para quien produzca la foto. */
  brief: string;
  /** false mientras el archivo es la imagen provisoria; pasalo a true al subir la foto definitiva. */
  final: boolean;
}

export const PHOTO_WIDTH = 640;
export const PHOTO_HEIGHT = 800;

export const PHOTOS: Record<string, BouquetPhoto> = {
  hero: {
    slug: "hero",
    alt: "Ramo abundante de peonías, rosas y ranúnculos en tonos rubor, lavanda y manteca, envuelto en papel de lino rubor",
    palette: "jardin",
    final: true,
    brief:
      "Ramo abundante (17 tallos) de peonías, rosas y ranúnculos en rubor, lavanda y manteca, con eucalipto. Papel de lino rubor y moño de satén marfil. Es la imagen principal del sitio: la más cuidada.",
  },
  alfama: {
    slug: "alfama",
    alt: "Ramo Alfama: rosas y ranúnculos en tonos rubor, envueltos en papel de lino rubor",
    palette: "rubor",
    final: true,
    brief: "Ramo clásico (11 tallos) de rosas y ranúnculos en rubor claro, rubor y blanco, con eucalipto. Papel de lino rubor y moño de satén rubor.",
  },
  sintra: {
    slug: "sintra",
    alt: "Ramo Sintra: peonías y lisianthus en tonos lavanda, con papel seda marfil",
    palette: "lavanda",
    final: true,
    brief: "Ramo clásico (11 tallos) de peonías y lisianthus en lavanda claro, lavanda y blanco, con eucalipto. Papel seda marfil y moño de cinta lavanda.",
  },
  belem: {
    slug: "belem",
    alt: "Ramo Belém: hortensias y rosas marfil, envueltas en papel salvia",
    palette: "marfil",
    final: true,
    brief: "Ramo abundante (17 tallos) de hortensias y rosas en blanco y crema, con eucalipto. Papel salvia y moño de cinta salvia. Sobrio y luminoso.",
  },
  tejo: {
    slug: "tejo",
    alt: "Ramo Tejo: tulipanes color durazno con papel kraft y cinta dorada",
    palette: "durazno",
    final: true,
    brief: "Ramo clásico (11 tallos) de tulipanes en durazno claro, durazno y crema, con eucalipto. Papel kraft natural y moño de cinta dorada.",
  },
  chiado: {
    slug: "chiado",
    alt: "Ramo Chiado: peonías, rosas y lisianthus de colores de jardín en una caja sombrerera",
    palette: "jardin",
    final: false,
    brief: "Arreglo clásico (11 tallos) de peonías, rosas y lisianthus en rubor, lavanda y manteca, con eucalipto, dentro de una caja sombrerera lavanda pálido con banda de satén rubor y la palabra “Lisboa”.",
  },
  bairro: {
    slug: "bairro",
    alt: "Ramo Bairro: ranúnculos y lisianthus amarillo manteca, pequeño, con papel seda marfil",
    palette: "manteca",
    final: true,
    brief: "Ramo petite (7 tallos) de ranúnculos y lisianthus en manteca, crema y blanco, con eucalipto. Papel seda marfil y moño de satén marfil.",
  },
};

export function photoSrc(slug: string, density: 1 | 2 = 1) {
  return `/images/ramos/${slug}${density === 2 ? "@2x" : ""}.webp`;
}
