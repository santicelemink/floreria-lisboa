/**
 * Pedidos. Hoy es un mock; en producción se guardan en Supabase.
 *
 * Flujo (como una compra en Mercado Libre):
 * 1. createOrder: el pedido se crea con el pago "sin_pagar" y un plazo para pagarlo.
 * 2. El cliente paga en Mercado Pago (ver payments.ts).
 * 3. Mercado Pago avisa por webhook al backend, que actualiza el estado del pago.
 *    El pedido queda confirmado SOLO cuando el pago está "aprobado".
 * 4. La florería recibe el pedido confirmado y coordina la entrega por WhatsApp.
 */
import type { CartItem, DeliveryInfo, Order } from "@/types";
import { PAYMENT_WINDOW_HOURS } from "@/data/catalog";
import { delay, mockId } from "./mock";

export interface OrderPayload {
  buyer: Order["buyer"];
  recipient: Order["recipient"];
  items: CartItem[];
  delivery: DeliveryInfo & { dateISO: string };
  total: number;
}

export async function createOrder(payload: OrderPayload): Promise<Order> {
  await delay(500);
  const now = new Date();
  const stamp = payload.delivery.dateISO.slice(5).replace("-", "");
  return {
    ...payload,
    id: mockId("ord"),
    number: `FL-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PAYMENT_WINDOW_HOURS * 3600 * 1000).toISOString(),
    payment: { status: "sin_pagar", updatedAt: now.toISOString() },
  };
}
