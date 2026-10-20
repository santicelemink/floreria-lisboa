import { CARD_DESIGNS, EXTRAS, SIZES, WRAPS } from "@/data/catalog";
import { useCatalog } from "@/lib/catalogData";
import { useCatalogStore } from "@/store/catalog";
import { AdminCard, PriceField } from "./AdminUI";

export function AdminPrices() {
  const catalog = useCatalog();
  const setPrice = useCatalogStore((s) => s.setPrice);
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-gris-texto">
        Los cambios se aplican al instante en todo el sitio, también en los carritos abiertos. Los pedidos ya hechos
        mantienen su precio.
      </p>
      <AdminCard title="Tamaños" description="Precio base del ramo, con las flores clásicas.">
        {catalog.sizes.map((s) => (
          <PriceField
            key={s.id}
            label={s.label}
            hint={`${s.stems} tallos`}
            value={s.base}
            fallback={SIZES.find((x) => x.id === s.id)!.base}
            onCommit={(v) => setPrice("sizeBase", s.id, v)}
          />
        ))}
      </AdminCard>
      <AdminCard title="Envoltorios" description="Recargo sobre el precio base.">
        {catalog.wraps.map((w) => (
          <PriceField
            key={w.id}
            label={w.label}
            value={w.surcharge}
            fallback={WRAPS.find((x) => x.id === w.id)!.surcharge}
            onCommit={(v) => setPrice("wrapSurcharge", w.id, v)}
          />
        ))}
      </AdminCard>
      <AdminCard title="Tarjetas">
        {catalog.cards.map((c) => (
          <PriceField
            key={c.id}
            label={c.label}
            value={c.surcharge}
            fallback={CARD_DESIGNS.find((x) => x.id === c.id)!.surcharge}
            onCommit={(v) => setPrice("cardSurcharge", c.id, v)}
          />
        ))}
      </AdminCard>
      <AdminCard title="Extras">
        {catalog.extras.map((x) => (
          <PriceField
            key={x.id}
            label={x.label}
            value={x.price}
            fallback={EXTRAS.find((e) => e.id === x.id)!.price}
            onCommit={(v) => setPrice("extraPrice", x.id, v)}
          />
        ))}
      </AdminCard>
    </div>
  );
}
