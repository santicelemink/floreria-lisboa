import { useEffect, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { PALETTES, PALETTE_COMPOSER_COLORS } from "@/data/catalog";
import { PHOTOS, photoSrc } from "@/data/photos";
import { PRODUCTS } from "@/data/products";
import { BouquetComposer } from "@/components/bouquet/BouquetComposer";
import { paletteBackground } from "@/components/bouquet/BouquetPreview";
import { Button } from "@/components/ui/button";
import { allComposerAssets, loadAsset, type AssetStatus } from "@/lib/composerAssets";
import { cn } from "@/lib/utils";

/** Página interna (no enlazada): muestra qué imágenes del compositor y qué fotos faltan. */

function useStatuses(urls: string[]) {
  const [statuses, setStatuses] = useState<Record<string, AssetStatus>>({});
  useEffect(() => {
    let cancelled = false;
    urls.forEach((url) =>
      loadAsset(url).then((status) => {
        if (!cancelled) setStatuses((prev) => ({ ...prev, [url]: status }));
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [urls]);
  return statuses;
}

const checker =
  "bg-[conic-gradient(#EBE3DC_25%,#FFFFFF_0_50%,#EBE3DC_0_75%,#FFFFFF_0)] bg-[length:14px_14px]";

function AssetCell({ url, label, status, wide = false }: { url: string; label: string; status?: AssetStatus; wide?: boolean }) {
  return (
    <figure className="min-w-0">
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-[12px] border",
          wide ? "aspect-[5/6]" : "aspect-square",
          status === "ok" ? `border-linea ${checker}` : "border-dashed border-error/60 bg-papel",
        )}
      >
        {status === "ok" && <img src={url} alt="" className="h-full w-full object-contain" loading="lazy" />}
        {status === "error" && <span className="px-2 text-center text-[13px] text-error">Falta</span>}
        {!status && <span className="text-[13px] text-gris-texto">…</span>}
      </div>
      <figcaption className="mt-1.5 break-all text-[12px] leading-snug text-tinta">{label}</figcaption>
    </figure>
  );
}

function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-[28px]">{title}</h2>
      {note && <p className="mt-1 max-w-[760px] text-[14px] text-gris-texto">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function DevComposerPage() {
  const assets = useMemo(() => allComposerAssets(), []);
  const photoUrls = useMemo(() => Object.keys(PHOTOS).flatMap((slug) => [photoSrc(slug), photoSrc(slug, 2)]), []);
  const composerUrls = useMemo(
    () => [
      ...assets.flowers.flatMap((f) => f.items.map((i) => i.url)),
      ...assets.foliage,
      ...assets.wraps.map((w) => w.url),
      assets.box,
      ...assets.ribbons.map((r) => r.url),
    ],
    [assets],
  );
  const allUrls = useMemo(() => [...photoUrls, ...composerUrls], [photoUrls, composerUrls]);
  const statuses = useStatuses(allUrls);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Revisión de assets · Florería Lisboa";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const checked = allUrls.filter((u) => statuses[u]).length;
  const missingComposer = composerUrls.filter((u) => statuses[u] === "error");
  const missingPhotos = photoUrls.filter((u) => statuses[u] === "error");
  const placeholderPhotos = Object.values(PHOTOS).filter((p) => !p.final);
  const missingList = [
    ...missingPhotos,
    ...placeholderPhotos.flatMap((p) => [photoSrc(p.slug), photoSrc(p.slug, 2)]).filter((u) => !missingPhotos.includes(u)).map((u) => `${u}  (provisoria)`),
    ...missingComposer,
  ].map((u) => `public${u}`);

  return (
    <div className="container pb-24 pt-10">
      <p className="kicker">Uso interno</p>
      <h1 className="section-title mt-3">
        Revisión de <em>assets</em>
      </h1>
      <p className="mt-3 max-w-[760px] text-[15px] text-gris-texto">
        Esta página no está enlazada en el sitio. Muestra todas las imágenes que usa el compositor del configurador y las
        fotos de los ramos. Mientras falte alguna imagen de una composición, el configurador dibuja ese ramo en SVG.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Compositor disponibles", value: `${composerUrls.length - missingComposer.length} de ${composerUrls.length}` },
          { label: "Fotos provisorias", value: `${placeholderPhotos.length} de ${Object.keys(PHOTOS).length}` },
          { label: "Revisadas", value: `${checked} de ${allUrls.length}` },
        ].map((s) => (
          <div key={s.label} className="rounded-card border border-linea bg-papel p-5">
            <p className="text-[13px] text-gris-texto">{s.label}</p>
            <p className="tabular mt-1 font-serif text-[30px] leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      <Section title="Fotos de ramos" note="640 × 800 (1x) y 1280 × 1600 (2x), 4:5. Se marcan las que todavía son provisorias.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {Object.values(PHOTOS).map((p) => (
            <div key={p.slug}>
              <AssetCell url={photoSrc(p.slug)} label={`images/ramos/${p.slug}.webp`} status={statuses[photoSrc(p.slug)]} wide />
              <p className={cn("mt-1 text-[12px]", p.final ? "text-tinta" : "text-malva-oscuro")}>
                {p.final ? "Definitiva" : "Provisoria"}
                {statuses[photoSrc(p.slug, 2)] === "error" && " · falta @2x"}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Flores" note="400 × 400 o más, fondo transparente, la flor centrada ocupando ~90% del ancho, vista desde arriba en leve ángulo.">
        <div className="overflow-x-auto pb-2">
          <table className="w-full min-w-[960px] border-separate border-spacing-2 text-left">
            <thead>
              <tr>
                <th className="w-[110px] text-[12px] font-normal uppercase tracking-[0.14em] text-gris-texto">Variedad</th>
                {assets.flowers[0].items.map((i) => (
                  <th key={i.color} className="text-[12px] font-normal text-tinta">
                    {i.color}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.flowers.map(({ flower, items }) => (
                <tr key={flower.id}>
                  <th className="align-top font-serif text-[18px] font-normal">{flower.label}</th>
                  {items.map((i) => (
                    <td key={i.color} className="align-top">
                      <AssetCell url={i.url} label={`${flower.id}/${i.color}.webp`} status={statuses[i.url]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Follaje" note="300 × 600, transparente, la base de la rama en el centro del borde inferior.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {assets.foliage.map((u) => (
            <AssetCell key={u} url={u} label={u.split("/").pop()!} status={statuses[u]} />
          ))}
        </div>
      </Section>

      <Section
        title="Envoltorios y caja"
        note="1000 × 1200 (5:6), transparente, alineados al ramo Clásico: el cuello del ramo en (500, 870). El de adelante incluye los tallos. La caja: el borde de la boca en (500, 560)."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-9">
          {assets.wraps.map((w) => (
            <AssetCell key={w.url} url={w.url} label={w.url.split("/").pop()!} status={statuses[w.url]} wide />
          ))}
          <AssetCell url={assets.box} label="caja-sombrerera.webp" status={statuses[assets.box]} wide />
        </div>
      </Section>

      <Section title="Cintas" note="400 × 400, transparente, el nudo del moño en el centro.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 lg:grid-cols-8">
          {assets.ribbons.map((r) => (
            <AssetCell key={r.url} url={r.url} label={r.url.split("/").pop()!} status={statuses[r.url]} />
          ))}
        </div>
      </Section>

      <Section title="Paletas → colores fotográficos">
        <ul className="grid gap-2 text-[14px] sm:grid-cols-2 lg:grid-cols-3">
          {PALETTES.map((p) => (
            <li key={p.id} className="rounded-option border border-linea bg-papel px-4 py-3">
              <span className="font-serif text-[18px]">{p.label}</span>
              <span className="text-gris-texto"> · {PALETTE_COMPOSER_COLORS[p.id].join(", ")}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Prueba de composición" note="Los seis diseños de la casa armados con el compositor. Si falta algún asset, se ven en SVG.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PRODUCTS.map((p) => (
            <figure key={p.slug}>
              <div className="aspect-[5/6] overflow-hidden rounded-card border border-linea" style={{ background: paletteBackground(p.config.palette) }}>
                <BouquetComposer {...p.config} />
              </div>
              <figcaption className="mt-1.5 font-serif text-[17px]">{p.name}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title={`Lista de pendientes (${missingList.length})`}>
        <textarea
          readOnly
          value={missingList.join("\n")}
          className="h-64 w-full rounded-option border border-linea bg-papel p-4 font-mono text-[12px] leading-relaxed"
          aria-label="Lista de imágenes pendientes"
        />
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(missingList.join("\n"));
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
          {copied ? "Copiada" : "Copiar lista"}
        </Button>
      </Section>
    </div>
  );
}
