import type { FlowerId, SizeId, WrapId } from "@/types";
import { SIZE_BY_ID, WRAP_BY_ID } from "@/data/catalog";
import { FLOWER_SCALE } from "@/components/bouquet/flowerScale";

/**
 * Geometría compartida por el ramo en SVG (BouquetPreview) y por el compositor
 * fotográfico (BouquetComposer): ambos ubican las mismas flores en el mismo lugar.
 * Lienzo lógico de 400 × 480 (relación 5:6).
 */
export const W = 400;
export const H = 480;
export const CX = W / 2;
const GOLDEN = 2.39996;

/** Pseudoaleatorio determinístico: el mismo ramo siempre se arma igual. */
export function hash(i: number, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Radio horizontal de la copa del ramo según el tamaño. */
export const RX: Record<SizeId, number> = { petite: 96, clasico: 116, abundante: 138 };

export interface PlacedFlower {
  key: number;
  kind: FlowerId;
  x: number;
  y: number;
  /** Radio de la flor en unidades del lienzo (ya incluye escala por variedad, profundidad y variación ±8%). */
  r: number;
  /** Índice 0..2 dentro de los tres colores de la paleta. */
  colorIndex: number;
  /** Semillas estables según el índice, para rotación y detalles. */
  seed: number;
  spin: number;
}

export interface FoliagePlacement {
  key: number;
  x: number;
  y: number;
  angle: number;
  length: number;
  seed: number;
}

export interface BouquetScene {
  isBox: boolean;
  cy: number;
  rx: number;
  ry: number;
  neckY: number;
  boxTop: number;
  boxHalf: number;
  /** Escala del ramo respecto del Clásico: la usan los envoltorios y la caja. */
  sizeScale: number;
  placed: PlacedFlower[];
  foliage: FoliagePlacement[];
}

export function layoutScene({ flowers, size, wrap }: { flowers: FlowerId[]; size: SizeId; wrap: WrapId }): BouquetScene {
  const isBox = WRAP_BY_ID[wrap].kind === "box";
  const cy = isBox ? 196 : 176;
  const count = SIZE_BY_ID[size].stems;
  const rx = RX[size];
  const ry = rx * 0.74 * (isBox ? 0.78 : 1);
  const flowerR = Math.sqrt((rx * ry) / count) * 1.24;

  // Phyllotaxis con el ángulo áureo dentro de una elipse.
  const placed: PlacedFlower[] = [];
  for (let i = 0; i < count; i++) {
    const t = Math.sqrt((i + 0.5) / count);
    const angle = i * GOLDEN;
    const kind = flowers[i % flowers.length];
    const scale = FLOWER_SCALE[kind] * (1 - 0.13 * t) * (0.92 + hash(i, 1) * 0.16);
    placed.push({
      key: i,
      kind,
      x: CX + Math.cos(angle) * t * rx * 0.8,
      y: cy + Math.sin(angle) * t * ry * 0.8,
      r: flowerR * scale,
      colorIndex: (i + Math.floor(i / 3)) % 3,
      seed: hash(i, 3),
      spin: hash(i, 2),
    });
  }
  // Ordenadas por Y: las de abajo quedan delante y se superponen con naturalidad.
  placed.sort((a, b) => a.y - b.y);

  // Abanico de ramas de eucalipto desde el centro hacia afuera, sobre todo arriba y a los costados.
  const foliageCount = size === "petite" ? 6 : size === "clasico" ? 8 : 10;
  const spread = 250;
  const foliage: FoliagePlacement[] = Array.from({ length: foliageCount }, (_, i) => {
    const angle = -spread / 2 + (spread / (foliageCount - 1)) * i + (hash(i, 5) - 0.5) * 14;
    const radA = ((angle - 90) * Math.PI) / 180;
    return {
      key: i,
      x: CX + Math.cos(radA) * rx * 0.55,
      y: cy + Math.sin(radA) * ry * 0.55,
      angle,
      length: rx * (0.52 + hash(i, 6) * 0.2),
      seed: hash(i, 7),
    };
  });

  return {
    isBox,
    cy,
    rx,
    ry,
    neckY: Math.round(cy + ry + 58 + rx * 0.24),
    boxTop: cy + ry * 0.42,
    boxHalf: rx * 1.04,
    sizeScale: rx / RX.clasico,
    placed,
    foliage,
  };
}
