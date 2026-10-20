import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tarjeta de sección del panel. */
export function AdminCard({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-panel border border-linea bg-papel p-5 sm:p-6", className)} aria-label={title}>
      <h2 className="font-serif text-[26px] leading-tight">{title}</h2>
      {description && <p className="mt-1 text-[14px] text-gris-texto">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * Campo de precio en pesos. Se puede tipear libre y se guarda al salir del campo o con Enter,
 * para que el sitio no recalcule con cada tecla.
 */
export function PriceField({
  label,
  hint,
  value,
  fallback,
  onCommit,
}: {
  label: string;
  hint?: string;
  value: number;
  /** Valor de fábrica, para mostrar si fue cambiado. */
  fallback: number;
  onCommit: (value: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  const commit = () => {
    const n = Number(draft);
    if (draft !== "" && Number.isFinite(n) && n !== value) onCommit(n);
    else setDraft(String(value));
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-linea py-3 last:border-0">
      <label htmlFor={id} className="min-w-0 text-[15px]">
        {label}
        {hint && <span className="block text-[13px] text-gris-texto">{hint}</span>}
        {value !== fallback && (
          <span className="block text-[12px] text-malva-oscuro">Cambiado · antes ${fallback.toLocaleString("es-AR")}</span>
        )}
      </label>
      <div className="relative w-[132px] shrink-0">
        <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gris-texto">
          $
        </span>
        <input
          id={id}
          inputMode="numeric"
          value={draft ? Number(draft).toLocaleString("es-AR") : ""}
          onFocus={() => setFocused(true)}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
          onBlur={() => {
            setFocused(false);
            commit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="tabular h-11 w-full rounded-option border border-linea bg-marfil pl-7 pr-3 text-right text-[15px] transition-colors duration-300 ease-atelier hover:border-tinta/40 focus-visible:border-malva"
        />
      </div>
    </div>
  );
}
