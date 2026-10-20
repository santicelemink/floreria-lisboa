import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { BouquetConfig } from "@/types";
import { COMPOSER_COLOR_HEX, PALETTE_COMPOSER_COLORS, RIBBON_BY_ID, WRAP_BY_ID } from "@/data/catalog";
import { describeBouquet } from "@/lib/bouquet";
import { CX, H, W, layoutScene, type BouquetScene } from "@/lib/bouquetLayout";
import { assetsForConfig, composerPaths, FOLIAGE_VARIANTS, knownStatus, loadAll } from "@/lib/composerAssets";
import { tintMatrix } from "@/lib/tint";
import { cn } from "@/lib/utils";
import { BouquetPreview } from "./BouquetPreview";

/**
 * Vista previa por capas fotográficas. Usa la misma geometría que el SVG (phyllotaxis con
 * ángulo áureo, orden por Y, escala según tamaño) pero ubica imágenes con fondo transparente.
 *
 * Son 14 imágenes (ver README): las flores, el papel y el moño están fotografiados en blanco
 * y se tiñen acá con el color de la paleta, del envoltorio y de la cinta.
 * - Flores: dos capas de 600 × 1200 (cabeza y tallo), generadas con scripts/procesar_flores.py.
 * - Follaje: vertical 1:2, la base de la rama en el centro del borde inferior.
 * - Papel, tallos y caja: lienzo completo 5:6 alineado al ramo Clásico; se escalan según el tamaño.
 * - Moño: cuadrado, el nudo en el centro.
 * Si falta cualquier imagen de la composición, se muestra el ramo en SVG.
 */

type VisualConfig = Pick<BouquetConfig, "palette" | "flowers" | "size" | "wrap" | "ribbon">;

export interface BouquetComposerProps extends VisualConfig {
  className?: string;
  label?: string;
  decorative?: boolean;
}

// Puntos de anclaje de los lienzos completos, medidos sobre el ramo Clásico.
const PAPER_ANCHOR_Y = layoutScene({ flowers: ["rosa"], size: "clasico", wrap: "seda-marfil" }).neckY;
const BOX_ANCHOR_Y = layoutScene({ flowers: ["rosa"], size: "clasico", wrap: "caja" }).boxTop;
const FADE_MS = 250;

/**
 * Lienzo de cada flor (lo genera scripts/procesar_flores.py): 600 × 1200, con el centro
 * de la cabeza en (300, 264) y la cabeza de 360 px de ancho. El tallo baja desde ahí.
 */
const FLOWER_IMG = { w: 600, h: 1200, headX: 300, headY: 264, headW: 360 };
const r2 = (v: number) => Math.round(v * 10) / 10;

/** Lienzo completo escalado alrededor de un ancla: el cuello del ramo o el borde de la caja. */
function canvasLayer(href: string, scale: number, anchorY: number, refAnchorY: number, filter?: string) {
  return (
    <image
      href={href}
      x={r2(CX - CX * scale)}
      y={r2(anchorY - refAnchorY * scale)}
      width={r2(W * scale)}
      height={r2(H * scale)}
      filter={filter}
    />
  );
}

function PhotoComposition({ config, scene, uid }: { config: VisualConfig; scene: BouquetScene; uid: string }) {
  const flowerColors = PALETTE_COMPOSER_COLORS[config.palette].map((c) => COMPOSER_COLOR_HEX[c]);
  const wrapColor = WRAP_BY_ID[config.wrap].color;
  const ribbonColor = RIBBON_BY_ID[config.ribbon].color;
  const flowerFilter = (i: number) => `url(#${uid}-flor-${i})`;
  const s = scene.sizeScale;
  const bowSize = 118 * s;
  const e = scene.boxHalf * 0.22;
  const boxBowY = scene.boxTop + 29.5 + e * 0.82;
  // Punto hacia el que convergen los tallos, y hasta dónde se ven.
  const tie = scene.isBox ? { x: CX, y: scene.boxTop + 140 * s } : { x: CX, y: scene.neckY + 30 * s };
  const cutY = scene.isBox ? scene.boxTop + e + 30 : scene.neckY - 4;

  return (
    <>
      <defs>
        {/* Tres tintes de flor (uno por color de la paleta), cada uno con sombra suave */}
        {flowerColors.map((hex, i) => (
          <filter key={i} id={`${uid}-flor-${i}`} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={tintMatrix(hex)} result="tinte" />
            <feDropShadow in="tinte" dx="0" dy="3" stdDeviation="3.5" floodColor="#4A3438" floodOpacity="0.22" />
          </filter>
        ))}
        <clipPath id={`${uid}-corte`}>
          <rect x="0" y="0" width={W} height={r2(cutY)} />
        </clipPath>
        <filter id={`${uid}-papel`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={tintMatrix(wrapColor, 0.06)} />
        </filter>
        <filter id={`${uid}-cinta`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={tintMatrix(ribbonColor, 0.08)} />
        </filter>
      </defs>

      {/* 1. Papel de atrás */}
      {!scene.isBox && canvasLayer(composerPaths.paperBack(), s, scene.neckY, PAPER_ANCHOR_Y, `url(#${uid}-papel)`)}

      {/* 2. Follaje */}
      {scene.foliage.map((f) => {
        const width = f.length * 0.5;
        return (
          <g key={`f${f.key}`} transform={`translate(${r2(f.x)} ${r2(f.y)}) rotate(${r2(f.angle)})`}>
            <image
              href={composerPaths.foliage(FOLIAGE_VARIANTS[f.key % FOLIAGE_VARIANTS.length])}
              x={r2(-width / 2)}
              y={r2(-f.length)}
              width={r2(width)}
              height={r2(f.length)}
            />
          </g>
        );
      })}

      {/* 3. Flores, de atrás hacia adelante. Cada tallo apunta al atado (como en un ramo de verdad)
             y se recorta a la altura del cuello: debajo se ven los tallos atados. */}
      <g clipPath={`url(#${uid}-corte)`}>
        {scene.placed.map((p) => {
          const scale = (p.r * 2.2) / FLOWER_IMG.headW;
          const w = FLOWER_IMG.w * scale;
          const h = FLOWER_IMG.h * scale;
          const x = -FLOWER_IMG.headX * scale;
          const y = -FLOWER_IMG.headY * scale;
          // Ángulo para que el tallo (hacia abajo en la imagen) apunte al punto de atado, con una leve variación estable.
          const toward = Math.atan2(-(tie.x - p.x), tie.y - p.y) * (180 / Math.PI);
          const rotate = toward + (p.spin - 0.5) * 10;
          return (
            <g key={`p${p.key}`} transform={`translate(${r2(p.x)} ${r2(p.y)}) rotate(${r2(rotate)})`}>
              <image href={composerPaths.flowerStem(p.kind)} x={r2(x)} y={r2(y)} width={r2(w)} height={r2(h)} />
              <image
                href={composerPaths.flower(p.kind)}
                x={r2(x)}
                y={r2(y)}
                width={r2(w)}
                height={r2(h)}
                filter={flowerFilter(p.colorIndex)}
              />
            </g>
          );
        })}
      </g>

      {/* 4. Tallos y papel de adelante, o frente de la caja */}
      {scene.isBox ? (
        canvasLayer(composerPaths.box(), s, scene.boxTop, BOX_ANCHOR_Y)
      ) : (
        <>
          {canvasLayer(composerPaths.stems(), s, scene.neckY, PAPER_ANCHOR_Y)}
          {canvasLayer(composerPaths.paperFront(), s, scene.neckY, PAPER_ANCHOR_Y, `url(#${uid}-papel)`)}
        </>
      )}

      {/* 5. Moño */}
      {scene.isBox ? (
        <image
          href={composerPaths.ribbon()}
          x={r2(CX + scene.boxHalf * 0.52 - bowSize * 0.31)}
          y={r2(boxBowY - bowSize * 0.31)}
          width={r2(bowSize * 0.62)}
          height={r2(bowSize * 0.62)}
          filter={`url(#${uid}-cinta)`}
        />
      ) : (
        <image
          href={composerPaths.ribbon()}
          x={r2(CX - bowSize / 2)}
          y={r2(scene.neckY - 4 - bowSize / 2)}
          width={r2(bowSize)}
          height={r2(bowSize)}
          filter={`url(#${uid}-cinta)`}
        />
      )}
    </>
  );
}

interface Layer {
  key: string;
  mode: "photo" | "svg";
  config: VisualConfig;
  leaving: boolean;
  /** Momento en que empezó a desvanecerse: se quita recién cuando terminó su fundido. */
  leftAt?: number;
}

const keyFor = (c: VisualConfig) => `${c.palette}|${c.flowers.join(".")}|${c.size}|${c.wrap}|${c.ribbon}`;
const safeId = (key: string) => key.replace(/[^a-zA-Z0-9]/g, "");

function BouquetComposerBase({ palette, flowers, size, wrap, ribbon, className, label, decorative }: BouquetComposerProps) {
  const config = useMemo(() => ({ palette, flowers, size, wrap, ribbon }), [palette, flowers, size, wrap, ribbon]);
  const key = keyFor(config);
  const urls = useMemo(() => assetsForConfig(config), [config]);
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const description = label ?? describeBouquet(config);

  // Si los assets ya se conocen (caché), la primera composición se muestra sin esperar.
  const [layers, setLayers] = useState<Layer[]>(() => {
    const status = knownStatus(urls);
    return status ? [{ key, mode: status === "ok" ? "photo" : "svg", config, leaving: false }] : [];
  });
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    // La composición anterior queda visible hasta que la nueva tiene todas sus imágenes cargadas.
    loadAll(urls).then((status) => {
      if (cancelled) return;
      const mode = status === "ok" ? "photo" : "svg";
      setLayers((prev) => {
        const current = prev.find((l) => !l.leaving);
        if (current && current.key === key && current.mode === mode) return prev;
        return [
          ...prev.filter((l) => l.key !== key).map((l) => (l.leaving ? l : { ...l, leaving: true, leftAt: Date.now() })),
          { key, mode, config, leaving: false },
        ];
      });
      const timer = window.setTimeout(
        () => setLayers((prev) => prev.filter((l) => !l.leaving || Date.now() - (l.leftAt ?? 0) < FADE_MS)),
        FADE_MS + 40,
      );
      timers.current.push(timer);
    });
    return () => {
      cancelled = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  return (
    <div
      className={cn("relative h-full w-full", className)}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": description })}
    >
      {layers.map((layer) => (
        <div
          key={layer.key}
          className={cn(
            "absolute inset-0 transition-opacity ease-atelier",
            layer.leaving ? "opacity-0" : "animate-[compose-in_250ms_cubic-bezier(.2,.8,.2,1)_both]",
          )}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          {layer.mode === "photo" ? (
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="block h-full w-full" aria-hidden="true">
              {/* Ids de filtro únicos por instancia y por capa: dos capas en fundido no comparten tintes */}
              <PhotoComposition config={layer.config} scene={layoutScene(layer.config)} uid={`${instanceId}${safeId(layer.key)}`} />
            </svg>
          ) : (
            <BouquetPreview {...layer.config} decorative />
          )}
        </div>
      ))}
    </div>
  );
}

export const BouquetComposer = memo(BouquetComposerBase);
