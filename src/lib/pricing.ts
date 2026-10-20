import type { BouquetConfig } from "@/types";
import { getCatalog, type Catalog } from "./catalogData";
import { roundToHundred } from "./format";

/**
 * precio = baseTamaño
 *        + (promedio del recargo de las flores) × (tallos / 11) × 1.4
 *        + envoltorio + tarjeta + extras
 * redondeado a la centena. Usa los precios vigentes (los que se editan en /admin).
 */
export function calculatePrice(config: BouquetConfig, catalog: Catalog = getCatalog()) {
  const size = catalog.sizeById[config.size];
  const surcharges = config.flowers.map((id) => catalog.flowerById[id].surcharge);
  const avg = surcharges.length ? surcharges.reduce((a, b) => a + b, 0) / surcharges.length : 0;
  const flowers = avg * (size.stems / 11) * 1.4;
  const wrap = catalog.wrapById[config.wrap].surcharge;
  const card = catalog.cardById[config.cardDesign].surcharge;
  const extras = config.extras.reduce((sum, id) => sum + catalog.extraById[id].price, 0);
  return roundToHundred(size.base + flowers + wrap + card + extras);
}

/**
 * El envío no se cobra en la web: lo hace una mensajería que se coordina por WhatsApp
 * y su costo depende de la zona. El total online es solo el de los productos.
 */
export function cartTotal(prices: number[]) {
  return prices.reduce((a, b) => a + b, 0);
}
