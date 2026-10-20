import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BouquetConfig, CartItem, DeliveryInfo, Fulfillment, Order, PaymentStatus } from "@/types";
import { BARRIOS, SLOTS_OTHER, SLOTS_TODAY } from "@/data/catalog";
import { sanitizeConfig } from "@/lib/bouquet";
import { calculatePrice } from "@/lib/pricing";
import { safeStorage } from "@/lib/storage";
import { useCatalogStore } from "./catalog";
import { baDateISO, isBeforeCutoff } from "@/lib/time";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  delivery: DeliveryInfo;
  /** Pedidos creados en este dispositivo, como "Mis compras" en Mercado Libre. */
  orders: Order[];
  /** Se incrementa cada vez que se agrega un ítem: dispara el "pop" del badge. */
  addPulse: number;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  addItem: (input: { name: string; config: BouquetConfig; productSlug?: string }) => void;
  removeItem: (id: string) => { item: CartItem; index: number } | null;
  restoreItem: (item: CartItem, index: number) => void;
  setDelivery: (partial: Partial<DeliveryInfo>) => void;
  /** Corrige la entrega si quedó desactualizada (pasó el corte, fecha vencida, franja inválida). */
  normalizeDelivery: () => void;
  /** Crea el pedido (pendiente de pago) y vacía el carrito: los ítems pasan al pedido. */
  createOrder: (order: Order) => void;
  setPaymentStatus: (number: string, status: PaymentStatus, details?: { methodLabel?: string; installments?: number }) => void;
  setFulfillment: (number: string, fulfillment: Fulfillment) => void;
}

export function slotsFor(day: DeliveryInfo["day"]) {
  return day === "hoy" ? SLOTS_TODAY : SLOTS_OTHER;
}

export function defaultDelivery(): DeliveryInfo {
  const today = isBeforeCutoff();
  return fixDelivery({ mode: "envio", day: today ? "hoy" : "manana", date: null, slot: null, barrio: null });
}

export function deliveryDateISO(delivery: DeliveryInfo) {
  if (delivery.day === "hoy") return baDateISO(0);
  if (delivery.day === "manana") return baDateISO(1);
  return delivery.date ?? baDateISO(1);
}

function fixDelivery(d: DeliveryInfo): DeliveryInfo {
  let next = { ...d };
  if (next.mode !== "envio" && next.mode !== "retiro") next = { ...next, mode: "envio" };
  if (next.day === "hoy" && !isBeforeCutoff()) next = { ...next, day: "manana", slot: null };
  if (next.day === "otra" && next.date && next.date <= baDateISO(0)) next = { ...next, date: null };
  // La franja siempre tiene un valor válido: la primera disponible por defecto.
  if (!next.slot || !slotsFor(next.day).includes(next.slot)) next = { ...next, slot: slotsFor(next.day)[0] };
  if (next.barrio && !BARRIOS.includes(next.barrio)) next = { ...next, barrio: null };
  return next;
}

/** Un pedido sin pago aprobado vence pasado su plazo. */
export function isOrderExpired(order: Order, now = Date.now()) {
  return order.payment.status !== "aprobado" && now > new Date(order.expiresAt).getTime();
}

/** Pedidos que todavía esperan un pago (para recordarlo en el carrito). */
export function openOrders(orders: Order[]) {
  return orders.filter((o) => o.payment.status !== "aprobado" && !isOrderExpired(o));
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      delivery: defaultDelivery(),
      orders: [],
      addPulse: 0,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
      addItem: ({ name, config, productSlug }) =>
        set((s) => ({
          items: [
            ...s.items,
            { id: uid(), name, productSlug, config: { ...config }, price: calculatePrice(config), addedAt: Date.now() },
          ],
          addPulse: s.addPulse + 1,
        })),
      removeItem: (id) => {
        const index = get().items.findIndex((i) => i.id === id);
        if (index < 0) return null;
        const item = get().items[index];
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
        return { item, index };
      },
      restoreItem: (item, index) =>
        set((s) => {
          const items = [...s.items];
          items.splice(Math.min(index, items.length), 0, item);
          return { items };
        }),
      setDelivery: (partial) => set((s) => ({ delivery: fixDelivery({ ...s.delivery, ...partial }) })),
      normalizeDelivery: () => set((s) => ({ delivery: fixDelivery(s.delivery) })),
      createOrder: (order) =>
        set((s) => ({
          orders: [order, ...s.orders].slice(0, 20),
          items: [],
          delivery: { ...defaultDelivery(), mode: s.delivery.mode, barrio: s.delivery.barrio },
        })),
      setFulfillment: (number, fulfillment) =>
        set((s) => ({ orders: s.orders.map((o) => (o.number === number ? { ...o, fulfillment } : o)) })),
      setPaymentStatus: (number, status, details) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.number === number
              ? { ...o, payment: { ...o.payment, ...details, status, updatedAt: new Date().toISOString() } }
              : o,
          ),
        })),
    }),
    {
      name: "lisboa-pedido",
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ items: s.items, delivery: s.delivery, orders: s.orders }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<CartState>;
        const items = Array.isArray(p.items)
          ? p.items.flatMap((raw) => {
              const config = sanitizeConfig(raw?.config);
              if (!config || typeof raw?.id !== "string") return [];
              // El precio se recalcula siempre con la fórmula vigente.
              return [{ ...raw, config, price: calculatePrice(config) } as CartItem];
            })
          : [];
        const delivery =
          p.delivery && typeof p.delivery === "object" ? fixDelivery({ ...current.delivery, ...p.delivery }) : current.delivery;
        const orders = Array.isArray(p.orders)
          ? p.orders.filter((o): o is Order => !!o && typeof o.number === "string" && !!o.payment && Array.isArray(o.items))
          : [];
        return { ...current, items, delivery, orders };
      },
    },
  ),
);

// Si la florería cambia precios en /admin, el carrito se actualiza (los pedidos ya creados no).
useCatalogStore.subscribe(() => {
  useCart.setState((s) => ({ items: s.items.map((i) => ({ ...i, price: calculatePrice(i.config) })) }));
});
