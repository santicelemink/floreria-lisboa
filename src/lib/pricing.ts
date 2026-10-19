import type { BouquetConfig } from "@/types";
import {
  CARD_BY_ID,
  EXTRA_BY_ID,
  FLOWER_BY_ID,
  SIZE_BY_ID,
  WRAP_BY_ID,
} from "@/data/catalog";
import { roundToHundred } from "./format";

/**
 * precio = baseTamaño
 *        + (promedio del recargo de las flores) × (tallos / 11) × 1.4
 *        + envoltorio + tarjeta + extras
 * redondeado a la centena.
 */
export function calculatePrice(config: BouquetConfig) {
  const size = SIZE_BY_ID[config.size];
  const surcharges = config.flowers.map((id) => FLOWER_BY_ID[id].surcharge);
  const avg = surcharges.length ? surcharges.reduce((a, b) => a + b, 0) / surcharges.length : 0;
  const flowers = avg * (size.stems / 11) * 1.4;
  const wrap = WRAP_BY_ID[config.wrap].surcharge;
  const card = CARD_BY_ID[config.cardDesign].surcharge;
  const extras = config.extras.reduce((sum, id) => sum + EXTRA_BY_ID[id].price, 0);
  return roundToHundred(size.base + flowers + wrap + card + extras);
}

/**
 * El envío no se cobra en la web: lo hace una mensajería que se coordina por WhatsApp
 * y su costo depende de la zona. El total online es solo el de los productos.
 */
export function cartTotal(prices: number[]) {
  return prices.reduce((a, b) => a + b, 0);
}
