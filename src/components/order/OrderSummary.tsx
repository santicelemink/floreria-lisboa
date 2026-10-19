import type { Order } from "@/types";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { formatPrice } from "@/lib/format";
import { deliverySummary } from "@/lib/orderMessages";

export function OrderSummary({ order, className }: { order: Order; className?: string }) {
  const pickup = order.delivery.mode === "retiro";
  return (
    <div className={className}>
      <ul className="divide-y divide-linea">
        {order.items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </ul>
      <div className="grid gap-4 border-t border-linea pt-5 text-[14px] sm:grid-cols-2">
        <div>
          <p className="text-gris-texto">{pickup ? "Retiro" : "Envío"}</p>
          <p className="mt-1 first-letter:uppercase">{deliverySummary(order)}</p>
          <p className="mt-1 text-[13px] text-gris-texto">
            {pickup ? "Sin cargo." : "Día, horario y costo del envío se confirman por WhatsApp."}
          </p>
        </div>
        <div>
          <p className="text-gris-texto">{pickup ? "Retira" : "Recibe"}</p>
          <p className="mt-1">{order.recipient.name || order.buyer.name}</p>
          {!pickup && order.recipient.address && (
            <p className="text-[13px] text-gris-texto">
              {[order.recipient.address, order.recipient.apartment].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>
      <dl className="mt-5 border-t border-linea pt-5 text-[14px]">
        <div className="flex items-baseline justify-between">
          <dt className="uppercase tracking-[0.14em]">Total</dt>
          <dd className="tabular font-serif text-[26px] leading-none">{formatPrice(order.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
