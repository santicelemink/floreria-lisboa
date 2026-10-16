import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { BouquetConfig } from "@/types";
import { PALETTE_COMPOSER_COLORS } from "@/data/catalog";
import { describeBouquet } from "@/lib/bouquet";
import { CX, H, W, layoutScene, type BouquetScene } from "@/lib/bouquetLayout";
import { assetsForConfig, composerPaths, FOLIAGE_VARIANTS, knownStatus, loadAll } from "@/lib/composerAssets";
import { cn } from "@/lib/utils";
import { BouquetPreview } from "./BouquetPreview";

/**
 * Vista previa por capas fotográficas. Usa la misma geometría que el SVG (phyllotaxis con
 * ángulo áureo, orden por Y, escala según tamaño) pero ubica imágenes con fondo transparente.
 *
 * Contrato de los assets (ver README):
 * - Flores: cuadradas, la flor centrada ocupando ~90% del ancho.
 * - Follaje: vertical 1:2, la base de la rama en el centro del borde inferior.
 * - Envoltorios y caja: lienzo completo 5:6 alineado al ramo Clásico; se escalan según el tamaño.
 * - Cintas: cuadradas, el nudo del moño en el centro.
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
const r2 = (v: number) => Math.round(v * 10) / 10;

/** Lienzo completo escalado alrededor de un ancla: el cuello del ramo o el borde de la caja. */
function canvasLayer(href: string, scale: number, anchorY: number, refAnchorY: number) {
  return (
    <image
      href={href}
      x={r2(CX - CX * scale)}
      y={r2(anchorY - refAnchorY * scale)}
      width={r2(W * scale)}
      height={r2(H * scale)}
    />
  );
}

function PhotoComposition({ config, scene, shadowId }: { config: VisualConfig; scene: BouquetScene; shadowId: string }) {
  const colors = PALETTE_COMPOSER_COLORS[config.palette];
  const s = scene.sizeScale;
  const bowSize = 118 * s;
  const e = scene.boxHalf * 0.22;
  const boxBowY = scene.boxTop + 29.5 + e * 0.82;

  return (
    <>
      {/* 1. Envoltorio de atrás */}
      {!scene.isBox && canvasLayer(composerPaths.wrapBack(config.wrap), s, scene.neckY, PAPER_ANCHOR_Y)}

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

      {/* 3. Flores, de atrás hacia adelante, con rotación leve estable y sombra suave */}
      {scene.placed.map((p) => {
        const d = p.r * 2.36;
        const rotate = (p.spin - 0.5) * 24;
        return (
          <g key={`p${p.key}`} transform={`translate(${r2(p.x)} ${r2(p.y)}) rotate(${r2(rotate)})`}>
            <image
              href={composerPaths.flower(p.kind, colors[p.colorIndex])}
              x={r2(-d / 2)}
              y={r2(-d / 2)}
              width={r2(d)}
              height={r2(d)}
              filter={`url(#${shadowId})`}
            />
          </g>
        );
      })}

      {/* 4. Envoltorio de adelante (incluye los tallos) o frente de la caja */}
      {scene.isBox
        ? canvasLayer(composerPaths.box(), s, scene.boxTop, BOX_ANCHOR_Y)
        : canvasLayer(composerPaths.wrapFront(config.wrap), s, scene.neckY, PAPER_ANCHOR_Y)}

      {/* 5. Moño */}
      {scene.isBox ? (
        <image
          href={composerPaths.ribbon(config.ribbon)}
          x={r2(CX + scene.boxHalf * 0.52 - bowSize * 0.31)}
          y={r2(boxBowY - bowSize * 0.31)}
          width={r2(bowSize * 0.62)}
          height={r2(bowSize * 0.62)}
        />
      ) : (
        <image
          href={composerPaths.ribbon(config.ribbon)}
          x={r2(CX - bowSize / 2)}
          y={r2(scene.neckY - 4 - bowSize / 2)}
          width={r2(bowSize)}
          height={r2(bowSize)}
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

function BouquetComposerBase({ palette, flowers, size, wrap, ribbon, className, label, decorative }: BouquetComposerProps) {
  const config = useMemo(() => ({ palette, flowers, size, wrap, ribbon }), [palette, flowers, size, wrap, ribbon]);
  const key = keyFor(config);
  const urls = useMemo(() => assetsForConfig(config), [config]);
  const shadowId = `sombra-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
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
              <defs>
                <filter id={shadowId} x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#4A3438" floodOpacity="0.22" />
                </filter>
              </defs>
              <PhotoComposition config={layer.config} scene={layoutScene(layer.config)} shadowId={shadowId} />
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
