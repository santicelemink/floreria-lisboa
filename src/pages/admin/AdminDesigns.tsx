import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImageUp, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { BouquetPhoto } from "@/components/bouquet/BouquetPhoto";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PRODUCTS } from "@/data/products";
import { unavailableFlowers, useCatalog } from "@/lib/catalogData";
import { fileToBouquetPhoto } from "@/lib/photoUpload";
import { calculatePrice } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { FLOWER_BY_ID } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";

export function AdminDesigns() {
  const catalog = useCatalog();
  const edits = useCatalogStore((s) => s.products);
  const editProduct = useCatalogStore((s) => s.editProduct);
  const setProductOrder = useCatalogStore((s) => s.setProductOrder);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFor, setUploadFor] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const order = catalog.allProducts.map((p) => p.slug);
  const move = (slug: string, delta: -1 | 1) => {
    const i = order.indexOf(slug);
    const j = i + delta;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setProductOrder(next);
  };

  const onFile = async (file: File | undefined) => {
    const slug = uploadFor;
    if (!file || !slug) return;
    setBusy(slug);
    try {
      const photo = await fileToBouquetPhoto(file);
      editProduct(slug, { photo });
      toast("Foto actualizada. Ya se ve en el sitio.");
    } catch {
      toast("No pudimos leer esa imagen. Probá con una foto JPG o PNG.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <p className="text-[14px] text-gris-texto">
        Las fotos se recortan solas en formato 4:5. Conviene sacarlas con luz natural y fondo liso.
      </p>
      {catalog.allProducts.map((p, index) => {
        const original = PRODUCTS.find((x) => x.slug === p.slug)!;
        const edit = edits[p.slug] ?? {};
        const missing = unavailableFlowers(p.config, catalog);
        return (
          <article
            key={p.slug}
            aria-label={`Diseño ${p.name}`}
            className={cn("rounded-panel border bg-papel p-4 sm:p-5", p.hidden ? "border-dashed border-gris-texto/50" : "border-linea")}
          >
            <div className="flex gap-4">
              <div className="w-[120px] shrink-0 sm:w-[140px]">
                <BouquetPhoto
                  slug={p.slug}
                  src={p.photo}
                  alt={`Foto de ${p.name}`}
                  fallback={p.config}
                  className="aspect-[4/5] rounded-option"
                />
                <div className="mt-2 flex flex-col gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 px-2 text-[12px] tracking-normal"
                    disabled={busy === p.slug}
                    onClick={() => {
                      setUploadFor(p.slug);
                      fileRef.current?.click();
                    }}
                  >
                    <ImageUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    {busy === p.slug ? "Subiendo…" : "Cambiar foto"}
                  </Button>
                  {p.photo && (
                    <button
                      type="button"
                      onClick={() => editProduct(p.slug, { photo: undefined })}
                      className="inline-flex items-center justify-center gap-1 rounded-sm text-[12px] text-malva-oscuro underline-offset-4 hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      Volver a la original
                    </button>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {p.hidden && <p className="text-[12px] uppercase tracking-[0.14em] text-malva-oscuro">Oculto en el sitio</p>}
                    <p className="tabular font-serif text-[20px]">{formatPrice(calculatePrice(p.config, catalog))}</p>
                    {missing.length > 0 && (
                      <p className="text-[12px] text-malva-oscuro">
                        Sin stock: {missing.map((f) => FLOWER_BY_ID[f].plural).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label={`Subir ${p.name}`}
                      disabled={index === 0}
                      onClick={() => move(p.slug, -1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-linea hover:border-tinta/50 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Bajar ${p.name}`}
                      disabled={index === catalog.allProducts.length - 1}
                      onClick={() => move(p.slug, 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-linea hover:border-tinta/50 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <label className="block text-[13px] text-gris-texto">
                  Nombre
                  <Input
                    className="mt-1 h-11"
                    value={edit.name ?? original.name}
                    placeholder={original.name}
                    onChange={(e) => editProduct(p.slug, { name: e.target.value })}
                  />
                </label>
                <label className="block text-[13px] text-gris-texto">
                  Descripción corta
                  <Textarea
                    className="mt-1 min-h-[72px]"
                    value={edit.description ?? original.description}
                    placeholder={original.description}
                    onChange={(e) => editProduct(p.slug, { description: e.target.value })}
                  />
                </label>
                <label className="block text-[13px] text-gris-texto">
                  Etiqueta (opcional)
                  <Input
                    className="mt-1 h-11"
                    value={edit.tag ?? original.tag ?? ""}
                    placeholder="Por ejemplo: Nuevo"
                    onChange={(e) => editProduct(p.slug, { tag: e.target.value })}
                  />
                </label>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <label htmlFor={`visible-${p.slug}`} className="text-[14px]">
                    Visible en el sitio
                  </label>
                  <Switch
                    id={`visible-${p.slug}`}
                    checked={!p.hidden}
                    onCheckedChange={(on) => editProduct(p.slug, { hidden: !on })}
                  />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
