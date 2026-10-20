import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { Fulfillment, Order } from "@/types";
import { Chip } from "@/components/ui/choice";
import { CartThumb } from "@/components/cart/CartItemRow";
import { buttonVariants } from "@/components/ui/button";
import { summaryLines } from "@/lib/bouquet";
import { formatPrice } from "@/lib/format";
import { deliverySummary } from "@/lib/orderMessages";
import { normalizeArgentinePhone } from "@/lib/phone";
import { formatDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { isOrderExpired, useCart } from "@/store/cart";

const FULFILLMENT: { id: Fulfillment; label: string }[] = [
  { id: "nuevo", label: "Nuevo" },
  { id: "preparando", label: "En preparación" },
  { id: "foto", label: "Foto enviada" },
  { id: "entregado", label: "Entregado" },
];

type Filter = "preparar" | "pago" | "entregados" | "todos";

function paymentBadge(order: Order) {
  if (isOrderExpired(order)) return { label: "Vencido", tone: "bg-linea text-tinta" };
  switch (order.payment.status) {
    case "aprobado":
      return { label: "Pago aprobado", tone: "bg-salvia text-tinta" };
    case "pendiente":
      return { label: "Esperando acreditación", tone: "bg-manteca text-tinta" };
    case "rechazado":
      return { label: "Pago rechazado", tone: "bg-rubor text-tinta" };
    default:
      return { label: "Sin pagar", tone: "bg-manteca text-tinta" };
  }
}

/** WhatsApp directo al cliente, con un mensaje según el estado. */
function customerLink(order: Order) {
  const digits = normalizeArgentinePhone(order.buyer.whatsapp);
  const first = order.buyer.name.split(" ")[0];
  const pickup = order.delivery.mode === "retiro";
  const byStatus: Record<Fulfillment, string> = {
    nuevo: `Hola ${first}, te escribimos de Florería Lisboa por tu pedido ${order.number}. ¡Gracias! Queremos coordinar ${pickup ? "el retiro" : "el envío"}.`,
    preparando: `Hola ${first}, ya estamos armando tu pedido ${order.number}.`,
    foto: `Hola ${first}, te mandamos la foto de tu ramo (pedido ${order.number}). ¿Te gusta cómo quedó?`,
    entregado: `Hola ${first}, ¡gracias por elegirnos! Esperamos que el ramo haya llegado perfecto.`,
  };
  const text = encodeURIComponent(byStatus[order.fulfillment ?? "nuevo"]);
  return digits ? `https://wa.me/549${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function AdminOrders() {
  const orders = useCart((s) => s.orders);
  const setFulfillment = useCart((s) => s.setFulfillment);
  const [filter, setFilter] = useState<Filter>("preparar");

  const groups = useMemo(() => {
    const paid = orders.filter((o) => o.payment.status === "aprobado");
    return {
      preparar: paid.filter((o) => o.fulfillment !== "entregado"),
      pago: orders.filter((o) => o.payment.status !== "aprobado" && !isOrderExpired(o)),
      entregados: paid.filter((o) => o.fulfillment === "entregado"),
      todos: orders,
    };
  }, [orders]);

  const list = groups[filter];
  const filters: { id: Filter; label: string }[] = [
    { id: "preparar", label: "Para preparar" },
    { id: "pago", label: "Esperando pago" },
    { id: "entregados", label: "Entregados" },
    { id: "todos", label: "Todos" },
  ];

  return (
    <div>
      <div role="group" aria-label="Filtrar pedidos" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {filters.map((f) => (
          <Chip key={f.id} selected={filter === f.id} onClick={() => setFilter(f.id)} className="shrink-0">
            {f.label}
            <span className={cn("tabular text-[12px]", filter === f.id ? "text-marfil/80" : "text-gris-texto")}>{groups[f.id].length}</span>
          </Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-6 rounded-panel border border-dashed border-linea bg-papel p-8 text-center">
          <p className="font-serif text-[24px]">No hay pedidos acá</p>
          <p className="mt-2 text-[14px] text-gris-texto">
            Hacé un pedido de prueba desde el sitio: aparece en esta lista apenas se paga.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {list.map((order) => {
            const badge = paymentBadge(order);
            const paid = order.payment.status === "aprobado";
            return (
              <li key={order.number} className="rounded-panel border border-linea bg-papel p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="tabular font-serif text-[22px] leading-tight">{order.number}</p>
                    <p className="mt-0.5 text-[13px] text-gris-texto">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-3 py-1 text-[12px]", badge.tone)}>{badge.label}</span>
                    <span className="tabular font-serif text-[22px]">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 text-[14px] sm:grid-cols-2">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.14em] text-gris-texto">Cliente</p>
                    <p className="mt-1">{order.buyer.name}</p>
                    <p className="tabular text-gris-texto">{order.buyer.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.14em] text-gris-texto">{order.delivery.mode === "retiro" ? "Retiro" : "Envío"}</p>
                    <p className="mt-1 first-letter:uppercase">{deliverySummary(order)}</p>
                    {order.delivery.mode === "envio" && (
                      <p className="text-gris-texto">
                        {order.recipient.name} · {[order.recipient.address, order.recipient.apartment].filter(Boolean).join(", ")} ·{" "}
                        {order.recipient.phone}
                      </p>
                    )}
                    {order.recipient.notes && <p className="text-gris-texto">Nota: {order.recipient.notes}</p>}
                  </div>
                </div>

                <ul className="mt-4 space-y-3 border-t border-linea pt-4">
                  {order.items.map((item) => {
                    const lines = summaryLines(item.config);
                    return (
                      <li key={item.id} className="flex gap-3">
                        <CartThumb item={item} className="h-[72px] w-[60px]" />
                        <div className="min-w-0 text-[13px] leading-snug">
                          <p className="font-serif text-[18px] leading-tight">{item.name}</p>
                          <p className="text-gris-texto">{lines.main}</p>
                          <p className="text-gris-texto">{lines.wrap}</p>
                          <p className="mt-1 text-tinta">
                            Tarjeta: {item.config.message.trim() ? `“${item.config.message.trim()}”` : "sin mensaje"}
                            {item.config.anonymous ? " · sin firma" : ""}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-5 flex flex-col gap-4 border-t border-linea pt-4 sm:flex-row sm:items-center sm:justify-between">
                  {paid ? (
                    <div role="group" aria-label={`Estado del pedido ${order.number}`} className="flex flex-wrap gap-2">
                      {FULFILLMENT.map((f) => (
                        <Chip
                          key={f.id}
                          selected={(order.fulfillment ?? "nuevo") === f.id}
                          onClick={() => setFulfillment(order.number, f.id)}
                          className="min-h-[36px] px-3.5 py-1.5 text-[13px]"
                        >
                          {f.label}
                        </Chip>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-gris-texto">No se prepara hasta que el pago esté aprobado.</p>
                  )}
                  <a href={customerLink(order)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                    <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    WhatsApp al cliente
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
