import type { BouquetConfig, FlowerId } from "@/types";
import { FLOWERS, WRAP_BY_ID } from "@/data/catalog";

/* ---------- Assets del compositor (carpeta /public/composer) ----------
 * 14 fotos de origen. Cada flor se procesa con scripts/procesar_flores.py en dos capas
 * alineadas (cabeza y tallo), así que en la carpeta quedan 20 archivos. */

export const FOLIAGE_VARIANTS = [1, 2, 3] as const;

export const composerPaths = {
  /** Cabeza de la flor, en blanco: el color lo pone el sitio. */
  flower: (flower: FlowerId) => `/composer/flores/${flower}.webp`,
  /** Tallo y hojas de la misma flor, en su verde natural (mismo lienzo que la cabeza). */
  flowerStem: (flower: FlowerId) => `/composer/flores/${flower}-tallo.webp`,
  foliage: (n: number) => `/composer/follaje/eucalipto-${n}.webp`,
  /** Papel blanco o marfil: se tiñe con el color de cada envoltorio. */
  paperBack: () => `/composer/envoltorios/papel-atras.webp`,
  paperFront: () => `/composer/envoltorios/papel-adelante.webp`,
  /** Tallos atados que asoman debajo del papel (sin teñir). */
  stems: () => `/composer/envoltorios/tallos.webp`,
  box: () => `/composer/caja/caja-sombrerera.webp`,
  /** Moño blanco: se tiñe con el color de cada cinta. */
  ribbon: () => `/composer/cintas/mono.webp`,
};

type VisualConfig = Pick<BouquetConfig, "flowers" | "wrap">;

/** Imágenes que hacen falta para componer un ramo. */
export function assetsForConfig({ flowers, wrap }: VisualConfig): string[] {
  const urls = new Set<string>();
  flowers.forEach((f) => {
    urls.add(composerPaths.flower(f));
    urls.add(composerPaths.flowerStem(f));
  });
  FOLIAGE_VARIANTS.forEach((n) => urls.add(composerPaths.foliage(n)));
  if (WRAP_BY_ID[wrap].kind === "box") {
    urls.add(composerPaths.box());
  } else {
    urls.add(composerPaths.paperBack());
    urls.add(composerPaths.paperFront());
    urls.add(composerPaths.stems());
  }
  urls.add(composerPaths.ribbon());
  return [...urls];
}

/** Las 14 imágenes del compositor, con su descripción, para /dev/composer y la precarga. */
export function allComposerAssets() {
  return {
    flowers: FLOWERS.map((f) => ({ flower: f, url: composerPaths.flower(f.id), stemUrl: composerPaths.flowerStem(f.id) })),
    foliage: FOLIAGE_VARIANTS.map((n) => composerPaths.foliage(n)),
    wraps: [
      { label: "papel-atras.webp", url: composerPaths.paperBack() },
      { label: "papel-adelante.webp", url: composerPaths.paperFront() },
      { label: "tallos.webp", url: composerPaths.stems() },
    ],
    box: composerPaths.box(),
    ribbon: composerPaths.ribbon(),
  };
}

export function allComposerUrls() {
  const a = allComposerAssets();
  return [...a.flowers.flatMap((f) => [f.url, f.stemUrl]), ...a.foliage, ...a.wraps.map((w) => w.url), a.box, a.ribbon];
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
