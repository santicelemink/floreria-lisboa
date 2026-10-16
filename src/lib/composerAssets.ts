import type { BouquetConfig, FlowerId, RibbonId, WrapId } from "@/types";
import {
  COMPOSER_COLORS,
  FLOWERS,
  OCCASIONS,
  PALETTES,
  PALETTE_COMPOSER_COLORS,
  RIBBONS,
  WRAPS,
  WRAP_BY_ID,
  type ComposerColor,
} from "@/data/catalog";

/* ---------- Rutas de los assets del compositor (carpeta /public/composer) ---------- */

export const FOLIAGE_VARIANTS = [1, 2, 3, 4] as const;

export const composerPaths = {
  flower: (flower: FlowerId, color: ComposerColor) => `/composer/flores/${flower}/${color}.webp`,
  foliage: (n: number) => `/composer/follaje/eucalipto-${n}.webp`,
  wrapBack: (wrap: WrapId) => `/composer/envoltorios/${wrap}-atras.webp`,
  wrapFront: (wrap: WrapId) => `/composer/envoltorios/${wrap}-adelante.webp`,
  box: () => `/composer/caja/caja-sombrerera.webp`,
  ribbon: (ribbon: RibbonId) => `/composer/cintas/${ribbon}.webp`,
};

type VisualConfig = Pick<BouquetConfig, "palette" | "flowers" | "wrap" | "ribbon">;

/** Todas las imágenes que hacen falta para componer un ramo. */
export function assetsForConfig({ palette, flowers, wrap, ribbon }: VisualConfig): string[] {
  const colors = PALETTE_COMPOSER_COLORS[palette];
  const urls = new Set<string>();
  flowers.forEach((f) => colors.forEach((c) => urls.add(composerPaths.flower(f, c))));
  FOLIAGE_VARIANTS.forEach((n) => urls.add(composerPaths.foliage(n)));
  if (WRAP_BY_ID[wrap].kind === "box") {
    urls.add(composerPaths.box());
  } else {
    urls.add(composerPaths.wrapBack(wrap));
    urls.add(composerPaths.wrapFront(wrap));
  }
  urls.add(composerPaths.ribbon(ribbon));
  return [...urls];
}

/** Lista completa de assets esperados, para la página de revisión /dev/composer. */
export function allComposerAssets() {
  return {
    flowers: FLOWERS.map((f) => ({
      flower: f,
      items: COMPOSER_COLORS.map((c) => ({ color: c, url: composerPaths.flower(f.id, c) })),
    })),
    foliage: FOLIAGE_VARIANTS.map((n) => composerPaths.foliage(n)),
    wraps: WRAPS.filter((w) => w.kind === "paper").flatMap((w) => [
      { label: `${w.label} (atrás)`, url: composerPaths.wrapBack(w.id) },
      { label: `${w.label} (adelante)`, url: composerPaths.wrapFront(w.id) },
    ]),
    box: composerPaths.box(),
    ribbons: RIBBONS.map((r) => ({ label: r.label, url: composerPaths.ribbon(r.id) })),
  };
}

/* ---------- Carga con caché: cada imagen se pide una sola vez ---------- */

export type AssetStatus = "ok" | "error";
const statusCache = new Map<string, AssetStatus>();
const pendingCache = new Map<string, Promise<AssetStatus>>();

export function loadAsset(url: string): Promise<AssetStatus> {
  const known = statusCache.get(url);
  if (known) return Promise.resolve(known);
  const pending = pendingCache.get(url);
  if (pending) return pending;
  const promise = new Promise<AssetStatus>((resolve) => {
    if (typeof Image === "undefined") return resolve("error");
    const img = new Image();
    img.decoding = "async";
    // Si el archivo no existe, el hosting devuelve index.html: no decodifica y cae en onerror.
    img.onload = () => resolve(img.naturalWidth > 0 ? "ok" : "error");
    img.onerror = () => resolve("error");
    img.src = url;
  }).then((status) => {
    statusCache.set(url, status);
    pendingCache.delete(url);
    return status;
  });
  pendingCache.set(url, promise);
  return promise;
}

/** Estado ya conocido de un grupo de assets, sin esperar: "ok", "error" o null si falta averiguar. */
export function knownStatus(urls: string[]): AssetStatus | null {
  let allOk = true;
  for (const url of urls) {
    const s = statusCache.get(url);
    if (s === "error") return "error";
    if (s !== "ok") allOk = false;
  }
  return allOk ? "ok" : null;
}

export async function loadAll(urls: string[]): Promise<AssetStatus> {
  const results = await Promise.all(urls.map(loadAsset));
  return results.every((s) => s === "ok") ? "ok" : "error";
}

export function preloadAssets(urls: Iterable<string>) {
  for (const url of urls) void loadAsset(url);
}

/**
 * Imágenes de las opciones que se ven en el paso actual del configurador,
 * para que al elegir cualquiera no haya parpadeos.
 */
export function assetsForStep(step: number, config: BouquetConfig): string[] {
  const urls = new Set<string>(assetsForConfig(config));
  const add = (c: VisualConfig) => assetsForConfig(c).forEach((u) => urls.add(u));
  switch (step) {
    case 0:
      OCCASIONS.forEach((o) => add({ ...config, palette: o.palette }));
      break;
    case 1:
      PALETTES.forEach((p) => add({ ...config, palette: p.id }));
      break;
    case 2: {
      const colors = PALETTE_COMPOSER_COLORS[config.palette];
      FLOWERS.forEach((f) => colors.forEach((c) => urls.add(composerPaths.flower(f.id, c))));
      break;
    }
    case 4:
      WRAPS.forEach((w) => add({ ...config, wrap: w.id }));
      RIBBONS.forEach((r) => urls.add(composerPaths.ribbon(r.id)));
      break;
    default:
      break;
  }
  return [...urls];
}
