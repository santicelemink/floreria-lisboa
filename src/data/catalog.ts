import type {
  CardDesignId,
  ExtraId,
  FlowerId,
  FontId,
  OccasionId,
  PaletteId,
  RibbonId,
  SizeId,
  WrapId,
  BouquetConfig,
} from "@/types";

export interface Occasion {
  id: OccasionId;
  label: string;
  palette: PaletteId;
  messages: [string, string];
}

export const OCCASIONS: Occasion[] = [
  {
    id: "cumpleanos",
    label: "Cumpleaños",
    palette: "durazno",
    messages: [
      "Feliz cumple. Que este año te traiga todo lo que soñás.",
      "Para que tu día sea tan lindo como vos.",
    ],
  },
  {
    id: "amor",
    label: "Amor",
    palette: "rubor",
    messages: ["Te elegiría todos los días.", "Gracias por hacer todo más lindo."],
  },
  {
    id: "aniversario",
    label: "Aniversario",
    palette: "rubor",
    messages: ["Un año más, y cada vez mejor.", "Por todos los que vienen."],
  },
  {
    id: "nacimiento",
    label: "Nacimiento",
    palette: "lavanda",
    messages: ["Bienvenida al mundo, pequeña.", "Felicitaciones por la nueva familia."],
  },
  {
    id: "agradecimiento",
    label: "Agradecimiento",
    palette: "manteca",
    messages: ["Gracias por estar siempre.", "Un pequeño gesto para decir gracias."],
  },
  {
    id: "condolencias",
    label: "Condolencias",
    palette: "marfil",
    messages: ["Acompañándote en este momento.", "Con todo nuestro cariño."],
  },
  {
    id: "porque-si",
    label: "Solo porque sí",
    palette: "lavanda",
    messages: ["Pensé en vos.", "Porque sí, y porque te lo merecés."],
  },
];

export interface Palette {
  id: PaletteId;
  label: string;
  colors: [string, string, string];
}

export const PALETTES: Palette[] = [
  { id: "rubor", label: "Rubor", colors: ["#F4C9CF", "#E8A5B0", "#FBE3E3"] },
  { id: "lavanda", label: "Lavanda", colors: ["#D8CDEF", "#B8A5DC", "#EFE9F8"] },
  { id: "durazno", label: "Durazno", colors: ["#F8CDB6", "#F1AD8F", "#FDE6D8"] },
  { id: "manteca", label: "Manteca", colors: ["#F6E3A6", "#EFD07F", "#FBF0CF"] },
  { id: "marfil", label: "Marfil", colors: ["#FFFDF8", "#EFE8DA", "#E4DCCB"] },
  { id: "jardin", label: "Jardín", colors: ["#F4C9CF", "#D8CDEF", "#F6E3A6"] },
];

export interface Flower {
  id: FlowerId;
  label: string;
  plural: string;
  description: string;
  surcharge: number;
  badge?: string;
}

export const FLOWERS: Flower[] = [
  { id: "rosa", label: "Rosas", plural: "rosas", description: "Clásicas y elegantes", surcharge: 0 },
  {
    id: "peonia",
    label: "Peonías",
    plural: "peonías",
    description: "Abundantes y románticas",
    surcharge: 9000,
    badge: "De estación",
  },
  { id: "tulipan", label: "Tulipanes", plural: "tulipanes", description: "Simples y modernos", surcharge: 6000 },
  { id: "ranunculo", label: "Ranúnculos", plural: "ranúnculos", description: "Capas delicadas", surcharge: 5000 },
  { id: "lisianthus", label: "Lisianthus", plural: "lisianthus", description: "Livianos y sutiles", surcharge: 2000 },
  { id: "hortensia", label: "Hortensias", plural: "hortensias", description: "Volumen y textura", surcharge: 4000 },
];

export const MAX_FLOWERS = 3;

export interface Size {
  id: SizeId;
  label: string;
  stems: number;
  detail: string;
  base: number;
  badge?: string;
}

export const SIZES: Size[] = [
  { id: "petite", label: "Petite", stems: 7, detail: "7 tallos · ideal para una mesa de luz", base: 29000 },
  {
    id: "clasico",
    label: "Clásico",
    stems: 11,
    detail: "11 tallos · el equilibrio justo",
    base: 39000,
    badge: "El más pedido",
  },
  { id: "abundante", label: "Abundante", stems: 17, detail: "17 tallos · para impresionar", base: 56000 },
];

export interface Wrap {
  id: WrapId;
  label: string;
  color: string;
  surcharge: number;
  kind: "paper" | "box";
  phrase: string;
}

export const WRAPS: Wrap[] = [
  { id: "seda-marfil", label: "Seda marfil", color: "#F7F2E8", surcharge: 0, kind: "paper", phrase: "papel seda marfil" },
  { id: "lino-rubor", label: "Lino rubor", color: "#F1D6D9", surcharge: 2500, kind: "paper", phrase: "papel de lino rubor" },
  { id: "kraft", label: "Kraft natural", color: "#DCC4A0", surcharge: 0, kind: "paper", phrase: "papel kraft natural" },
  { id: "salvia", label: "Salvia", color: "#D3DDC9", surcharge: 2500, kind: "paper", phrase: "papel salvia" },
  { id: "caja", label: "Caja sombrerera", color: "#EFE7F4", surcharge: 7500, kind: "box", phrase: "caja sombrerera" },
];

export interface Ribbon {
  id: RibbonId;
  label: string;
  color: string;
}

export const RIBBONS: Ribbon[] = [
  { id: "saten-rubor", label: "Satén rubor", color: "#E3A9B3" },
  { id: "saten-marfil", label: "Satén marfil", color: "#F3ECE0" },
  { id: "salvia", label: "Salvia", color: "#A9BFA0" },
  { id: "lavanda", label: "Lavanda", color: "#B7A6D8" },
  { id: "dorado", label: "Dorado", color: "#C9AE7C" },
];

export interface CardDesign {
  id: CardDesignId;
  label: string;
  surcharge: number;
}

export const CARD_DESIGNS: CardDesign[] = [
  { id: "clasica", label: "Clásica", surcharge: 0 },
  { id: "acuarela", label: "Acuarela", surcharge: 1500 },
  { id: "minima", label: "Mínima", surcharge: 0 },
];

export const FONTS: { id: FontId; label: string }[] = [
  { id: "clasica", label: "Clásica" },
  { id: "manuscrita", label: "Manuscrita" },
];

export interface Extra {
  id: ExtraId;
  label: string;
  price: number;
}

export const EXTRAS: Extra[] = [
  { id: "florero", label: "Florero de vidrio soplado", price: 12500 },
  { id: "vela", label: "Vela de soja con aroma a peonía", price: 8900 },
  { id: "bombones", label: "Bombones artesanales", price: 7800 },
];

export const MESSAGE_MAX = 180;

export const DEFAULT_CONFIG: BouquetConfig = {
  occasion: "cumpleanos",
  palette: "durazno",
  flowers: ["rosa", "lisianthus"],
  size: "clasico",
  wrap: "seda-marfil",
  ribbon: "saten-rubor",
  cardDesign: "clasica",
  font: "clasica",
  message: "",
  anonymous: false,
  extras: [],
};

/** Combinaciones armónicas que usa "Sorprendeme". */
export const HARMONY: Record<PaletteId, { wraps: WrapId[]; ribbons: RibbonId[] }> = {
  rubor: { wraps: ["lino-rubor", "seda-marfil", "caja"], ribbons: ["saten-rubor", "saten-marfil", "dorado"] },
  lavanda: { wraps: ["seda-marfil", "salvia", "caja"], ribbons: ["lavanda", "saten-marfil", "salvia"] },
  durazno: { wraps: ["kraft", "seda-marfil", "lino-rubor"], ribbons: ["saten-rubor", "dorado", "saten-marfil"] },
  manteca: { wraps: ["kraft", "seda-marfil", "salvia"], ribbons: ["dorado", "saten-marfil", "salvia"] },
  marfil: { wraps: ["salvia", "seda-marfil", "kraft"], ribbons: ["salvia", "saten-marfil", "dorado"] },
  jardin: { wraps: ["caja", "seda-marfil", "lino-rubor"], ribbons: ["saten-rubor", "lavanda", "dorado"] },
};

/* ---------- Compositor fotográfico ---------- */

/**
 * Colores de flor del compositor. Las flores se fotografían una sola vez, en blanco,
 * y el sitio las tiñe con estos tonos. Ajustá los hex para afinar cómo se ven.
 */
export const COMPOSER_COLORS = [
  "blanco",
  "crema",
  "rubor-claro",
  "rubor",
  "lavanda-claro",
  "lavanda",
  "durazno-claro",
  "durazno",
  "manteca",
] as const;
export type ComposerColor = (typeof COMPOSER_COLORS)[number];

export const COMPOSER_COLOR_HEX: Record<ComposerColor, string> = {
  blanco: "#FFFDF9",
  crema: "#F3E6CB",
  "rubor-claro": "#F8D7DD",
  rubor: "#EBA8B6",
  "lavanda-claro": "#E6DCF5",
  lavanda: "#BCA8E0",
  "durazno-claro": "#FBDFCD",
  durazno: "#F3B296",
  manteca: "#F6E09C",
};

/** Cómo se traduce cada paleta a tres colores de flor (mismo orden que `Palette.colors`). */
export const PALETTE_COMPOSER_COLORS: Record<PaletteId, [ComposerColor, ComposerColor, ComposerColor]> = {
  rubor: ["rubor-claro", "rubor", "blanco"],
  lavanda: ["lavanda-claro", "lavanda", "blanco"],
  durazno: ["durazno-claro", "durazno", "crema"],
  manteca: ["manteca", "crema", "blanco"],
  marfil: ["blanco", "crema", "durazno-claro"],
  jardin: ["rubor", "lavanda", "manteca"],
};

const byId = <T extends { id: string }>(list: T[]) =>
  Object.fromEntries(list.map((item) => [item.id, item])) as Record<T["id"], T>;

export const OCCASION_BY_ID = byId(OCCASIONS);
export const PALETTE_BY_ID = byId(PALETTES);
export const FLOWER_BY_ID = byId(FLOWERS);
export const SIZE_BY_ID = byId(SIZES);
export const WRAP_BY_ID = byId(WRAPS);
export const RIBBON_BY_ID = byId(RIBBONS);
export const CARD_BY_ID = byId(CARD_DESIGNS);
export const EXTRA_BY_ID = byId(EXTRAS);

export const BARRIOS = [
  "Palermo",
  "Belgrano",
  "Colegiales",
  "Recoleta",
  "Núñez",
  "Caballito",
  "Villa Urquiza",
  "Otro barrio de CABA",
  "Gran Buenos Aires (a consultar)",
];

/** Retiro sin cargo en el atelier (dirección de ejemplo del prototipo). */
export const ATELIER = {
  address: "Thames 1850, Palermo, CABA",
  hours: "Lunes a sábado de 8 a 20 h · Domingos de 9 a 14 h",
};

/** Plazo para pagar un pedido antes de que se cancele (efectivo o transferencia). */
export const PAYMENT_WINDOW_HOURS = 24;

export const SLOTS_TODAY = ["15 a 18 h", "18 a 20 h"];
export const SLOTS_OTHER = ["9 a 13 h", "13 a 17 h", "17 a 20 h"];

export const WHATSAPP_NUMBER = "5491100000000"; // Número de ejemplo del prototipo
// El link de WhatsApp vive en lib/catalogData.ts: usa el número que se edita en /admin.
