import { FlowerIcon } from "@/components/bouquet/flowers";
import { Switch } from "@/components/ui/switch";
import { FLOWERS, PALETTE_BY_ID } from "@/data/catalog";
import { useCatalog } from "@/lib/catalogData";
import { useCatalogStore } from "@/store/catalog";
import { AdminCard, PriceField } from "./AdminUI";

export function AdminFlowers() {
  const catalog = useCatalog();
  const setAvailable = useCatalogStore((s) => s.setFlowerAvailable);
  const setPrice = useCatalogStore((s) => s.setPrice);
  const affected = (id: string) => catalog.allProducts.filter((p) => p.config.flowers.includes(id as never)).map((p) => p.name);

  return (
    <div className="space-y-4">
      <AdminCard
        title="Disponibles esta semana"
        description="Si una variedad no entró al mercado, apagala: deja de ofrecerse en el configurador y los diseños que la llevan no se pueden comprar."
      >
        <ul className="divide-y divide-linea">
          {catalog.flowers.map((f) => {
            const uses = affected(f.id);
            return (
              <li key={f.id} className="flex items-center gap-4 py-3">
                <FlowerIcon flower={f.id} colors={PALETTE_BY_ID.rubor.colors} className="h-10 w-10 shrink-0" />
                <label htmlFor={`stock-${f.id}`} className="min-w-0 flex-1 text-[15px]">
                  {f.label}
                  <span className="block text-[13px] text-gris-texto">
                    {f.available ? "En stock" : "Sin stock esta semana"}
                    {uses.length > 0 && ` · está en ${uses.join(", ")}`}
                  </span>
                </label>
                <Switch id={`stock-${f.id}`} checked={f.available} onCheckedChange={(on) => setAvailable(f.id, on)} />
              </li>
            );
          })}
        </ul>
      </AdminCard>

      <AdminCard title="Recargo por variedad" description="Lo que se suma al precio del tamaño cuando el ramo lleva esa flor.">
        {catalog.flowers.map((f) => (
          <PriceField
            key={f.id}
            label={f.label}
            value={f.surcharge}
            fallback={FLOWERS.find((x) => x.id === f.id)!.surcharge}
            onCommit={(v) => setPrice("flowerSurcharge", f.id, v)}
          />
        ))}
      </AdminCard>
    </div>
  );
}
