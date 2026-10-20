import type { Order } from "@/types";
import { getCatalog, whatsappLink } from "./catalogData";
import { formatPrice } from "./format";
import { formatLongDate } from "./time";

/** Texto de la entrega: "Envío a Palermo · sábado 18 de octubre · 15 a 18 h" */
export function deliverySummary(order: Order) {
  const d = order.delivery;
  const where = d.mode === "retiro" ? `Retiro en ${getCatalog().business.address}` : `Envío a ${d.barrio ?? "domicilio"}`;
  return `${where} · ${formatLongDate(d.dateISO)} · ${d.slot}`;
}

/** Mensaje de WhatsApp precargado para coordinar la entrega de un pedido pago. */
export function coordinationLink(order: Order) {
  const d = order.delivery;
  const lines = [
    `Hola, soy ${order.buyer.name}. Pagué el pedido ${order.number} (${formatPrice(order.total)}).`,
    d.mode === "retiro"
      ? `Lo paso a retirar el ${formatLongDate(d.dateISO)}, ${d.slot}.`
      : `Quiero coordinar el envío para el ${formatLongDate(d.dateISO)}, ${d.slot}, a ${[order.recipient.address, order.recipient.apartment, d.barrio].filter(Boolean).join(", ")}.`,
  ];
  return whatsappLink(lines.join(" "));
}

/** Consulta por un pedido que todavía no está confirmado. */
export function paymentHelpLink(order: Order) {
  return whatsappLink(`Hola, tengo una consulta sobre el pago del pedido ${order.number}.`);
}
