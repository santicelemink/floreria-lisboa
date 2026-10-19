import { useEffect, useId, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { COMPOSER_COLORS, COMPOSER_COLOR_HEX, PALETTES, PALETTE_COMPOSER_COLORS, RIBBONS, WRAPS } from "@/data/catalog";
import { PHOTOS, photoSrc } from "@/data/photos";
import { PRODUCTS } from "@/data/products";
import { BouquetComposer } from "@/components/bouquet/BouquetComposer";
import { paletteBackground } from "@/components/bouquet/BouquetPreview";
import { Button } from "@/components/ui/button";
import { allComposerAssets, allComposerUrls, composerPaths, loadAsset, type AssetStatus } from "@/lib/composerAssets";
import { tintMatrix } from "@/lib/tint";
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

/** La imagen teñida con el mismo filtro que usa el compositor. */
function TintedCell({ url, hex, status, wide = false }: { url: string; hex: string; status?: AssetStatus; wide?: boolean }) {
  const id = `t${hex.slice(1)}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-[12px] border",
        wide ? "aspect-[5/6]" : "aspect-square",
        status === "ok" ? `border-linea ${checker}` : "border-dashed border-linea bg-papel",
      )}
    >
      {status === "ok" ? (
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <filter id={id} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={tintMatrix(hex)} />
          </filter>
          <image href={url} x="0" y="0" width="100" height="100" filter={`url(#${id})`} preserveAspectRatio="xMidYMid meet" />
        </svg>
      ) : (
        <span className="h-6 w-6 rounded-full border border-linea" style={{ background: hex }} />
      )}
    </div>
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
  const composerUrls = useMemo(() => allComposerUrls(), []);
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

      <Section
        title="Flores"
        note="Una por variedad, fotografiada en blanco. 600 × 600 o más, fondo transparente, la flor centrada ocupando ~90% del ancho, vista desde arriba en leve ángulo. A la derecha, cómo queda teñida en cada color."
      >
        <div className="overflow-x-auto pb-2">
          <table className="w-full min-w-[1040px] border-separate border-spacing-2 text-left">
            <thead>
              <tr>
                <th className="w-[110px] text-[12px] font-normal uppercase tracking-[0.14em] text-gris-texto">Variedad</th>
                <th className="text-[12px] font-normal uppercase tracking-[0.14em] text-gris-texto">Archivo</th>
                {COMPOSER_COLORS.map((c) => (
                  <th key={c} className="text-[12px] font-normal text-tinta">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.flowers.map(({ flower, url }) => (
                <tr key={flower.id}>
                  <th className="align-top font-serif text-[18px] font-normal">{flower.label}</th>
                  <td className="align-top">
                    <AssetCell url={url} label={`flores/${flower.id}.webp`} status={statuses[url]} />
                  </td>
                  {COMPOSER_COLORS.map((c) => (
                    <td key={c} className="align-top">
                      <TintedCell url={url} hex={COMPOSER_COLOR_HEX[c]} status={statuses[url]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Follaje" note="300 × 600, transparente, la base de la rama en el centro del borde inferior. Sin teñir.">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-8">
          {assets.foliage.map((u) => (
            <AssetCell key={u} url={u} label={u.split("/").pop()!} status={statuses[u]} />
          ))}
        </div>
      </Section>

      <Section
        title="Papel, tallos y caja"
        note="1000 × 1200 (5:6), transparentes, alineados al ramo Clásico: el cuello del ramo en (500, 870). El papel va en blanco o marfil (se tiñe con el color de cada envoltorio); los tallos y la caja, en su color real. La caja: el centro del borde de la boca en (500, 560)."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {assets.wraps.map((w) => (
            <AssetCell key={w.url} url={w.url} label={w.label} status={statuses[w.url]} wide />
          ))}
          <AssetCell url={assets.box} label="caja-sombrerera.webp" status={statuses[assets.box]} wide />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-8">
          {WRAPS.filter((w) => w.kind === "paper").map((w) => (
            <figure key={w.id}>
              <TintedCell url={composerPaths.paperFront()} hex={w.color} status={statuses[composerPaths.paperFront()]} wide />
              <figcaption className="mt-1.5 text-[12px] text-tinta">{w.label}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Moño" note="400 × 400, transparente, satén blanco, el nudo en el centro. Se tiñe con el color de cada cinta.">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-8">
          <AssetCell url={assets.ribbon} label="cintas/mono.webp" status={statuses[assets.ribbon]} />
          {RIBBONS.map((r) => (
            <figure key={r.id}>
              <TintedCell url={assets.ribbon} hex={r.color} status={statuses[assets.ribbon]} />
              <figcaption className="mt-1.5 text-[12px] text-tinta">{r.label}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Paletas → colores de flor">
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
