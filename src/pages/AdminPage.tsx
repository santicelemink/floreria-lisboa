import { useEffect, useRef, type KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ExternalLink, Info, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import { buttonVariants } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useCatalogStore } from "@/store/catalog";
import { AdminOrders } from "./admin/AdminOrders";
import { AdminDesigns } from "./admin/AdminDesigns";
import { AdminFlowers } from "./admin/AdminFlowers";
import { AdminPrices } from "./admin/AdminPrices";
import { AdminBusiness } from "./admin/AdminBusiness";

const TABS = [
  { id: "pedidos", label: "Pedidos", Panel: AdminOrders },
  { id: "disenos", label: "Diseños", Panel: AdminDesigns },
  { id: "flores", label: "Flores", Panel: AdminFlowers },
  { id: "precios", label: "Precios", Panel: AdminPrices },
  { id: "negocio", label: "Negocio", Panel: AdminBusiness },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** El panel no tiene que aparecer en buscadores. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

/**
 * Panel de la florería (/admin). En el prototipo guarda en este navegador y el sitio abierto
 * en otra pestaña se actualiza solo. En producción: login de Supabase y tablas con Realtime.
 */
export function AdminPage() {
  useDocumentTitle("Panel de la florería");
  useNoIndex();
  const [params, setParams] = useSearchParams();
  const current = (TABS.find((t) => t.id === params.get("seccion"))?.id ?? "pedidos") as TabId;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const toPrepare = useCart((s) => s.orders.filter((o) => o.payment.status === "aprobado" && o.fulfillment !== "entregado").length);
  const resetAll = useCatalogStore((s) => s.resetAll);

  const select = (id: TabId, focus = false) => {
    setParams(id === "pedidos" ? {} : { seccion: id }, { replace: true });
    if (focus) tabRefs.current[id]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === current);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    select(TABS[next].id, true);
  };

  const { Panel } = TABS.find((t) => t.id === current)!;

  return (
    <div className="min-h-screen bg-marfil">
      <header className="border-b border-linea bg-papel">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-4">
            <Logo compact className="items-start" />
            <span className="hidden border-l border-linea pl-4 text-[12px] uppercase tracking-[0.18em] text-gris-texto sm:inline">
              Panel de la florería
            </span>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "pill", size: "xs" })}>
            Ver el sitio
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main id="contenido" className="container max-w-[880px] py-6 sm:py-10">
        <h1 className="font-serif text-[36px] leading-tight sm:text-[44px]">Panel de la florería</h1>

        <div className="mt-4 flex gap-3 rounded-option border border-linea bg-lavanda/40 p-4 text-[14px] leading-relaxed">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-malva-oscuro" strokeWidth={1.5} aria-hidden="true" />
          <p>
            <strong className="font-normal">Versión de demostración.</strong> Lo que cambies se guarda en este navegador y
            se ve al instante en el sitio (abrilo en otra pestaña para comprobarlo). En la versión final los cambios van a
            la nube, con usuario y contraseña, y los ve cualquier cliente.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Secciones del panel"
          onKeyDown={onKeyDown}
          className="-mx-4 mt-6 flex gap-1 overflow-x-auto border-b border-linea px-4 sm:mx-0 sm:px-0"
        >
          {TABS.map((t) => {
            const selected = t.id === current;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[t.id] = el;
                }}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(t.id)}
                className={cn(
                  "-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[14px] transition-colors duration-300 ease-atelier",
                  selected ? "border-tinta text-tinta" : "border-transparent text-gris-texto hover:text-tinta",
                )}
              >
                {t.label}
                {t.id === "pedidos" && toPrepare > 0 && (
                  <span className="tabular rounded-full bg-rubor px-2 py-0.5 text-[12px] text-tinta" aria-label={`${toPrepare} para preparar`}>
                    {toPrepare}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div id={`panel-${current}`} role="tabpanel" aria-labelledby={`tab-${current}`} tabIndex={0} className="pt-6 focus-visible:outline-none">
          <Panel />
        </div>

        <div className="mt-12 border-t border-linea pt-6">
          <button
            type="button"
            onClick={() => {
              if (!window.confirm("¿Volver todos los precios, fotos, flores y datos a como venían? Los pedidos no se borran.")) return;
              resetAll();
              toast("Listo: el catálogo volvió a los valores de fábrica.");
            }}
            className="inline-flex items-center gap-2 rounded-sm text-[13px] text-malva-oscuro underline-offset-4 hover:underline"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Restablecer el catálogo de la demo
          </button>
        </div>
      </main>
    </div>
  );
}
