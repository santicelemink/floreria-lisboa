/**
 * Pagos con Mercado Pago (Checkout Pro), simulados en el prototipo.
 *
 * Integración real:
 * - createPaymentPreference: el backend crea una preferencia con los ítems, el total,
 *   external_reference = número de pedido y back_urls (success, pending, failure) que vuelven
 *   a /pedido/{número}. Devuelve init_point: la URL de Mercado Pago a la que se redirige.
 * - Mercado Pago notifica cada cambio por webhook (topic "payment"). El backend consulta el pago
 *   y actualiza el pedido: approved → aprobado, pending / in_process → pendiente,
 *   rejected / cancelled → rechazado.
 * - La página del pedido nunca confía en el parámetro de la URL de vuelta: consulta el estado
 *   real del pedido al backend.
 * Ningún dato de tarjeta pasa por este sitio.
 */
import type { Order, PaymentStatus } from "@/types";
import { delay, mockId } from "./mock";

export async function createPaymentPreference(order: Order) {
  await delay(400);
  return { preferenceId: mockId("pref"), initPoint: `/pago/${order.number}` };
}

export type MockPaymentMethod = "cuenta" | "tarjeta" | "efectivo" | "transferencia";

export const MOCK_PAYMENT_METHODS: { id: MockPaymentMethod; label: string; detail: string; result: PaymentStatus }[] = [
  {
    id: "cuenta",
    label: "Dinero disponible en Mercado Pago",
    detail: "Se acredita al instante.",
    result: "aprobado",
  },
  {
    id: "tarjeta",
    label: "Tarjeta de crédito o débito",
    detail: "Hasta 3 cuotas sin interés. Se acredita al instante.",
    result: "aprobado",
  },
  {
    id: "efectivo",
    label: "Efectivo en Rapipago o Pago Fácil",
    detail: "El pedido se confirma cuando se acredita, en general a las pocas horas.",
    result: "pendiente",
  },
  {
    id: "transferencia",
    label: "Transferencia bancaria",
    detail: "El pedido se confirma cuando se acredita la transferencia.",
    result: "pendiente",
  },
];

/** Simula el resultado que Mercado Pago informaría por webhook. */
export async function simulatePayment(method: MockPaymentMethod, options: { reject?: boolean } = {}) {
  await delay(900);
  const info = MOCK_PAYMENT_METHODS.find((m) => m.id === method)!;
  const status: PaymentStatus = options.reject ? "rechazado" : info.result;
  return { status, methodLabel: info.label };
}
