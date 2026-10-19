import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Chip, OptionCard } from "@/components/ui/choice";
import { Switch } from "@/components/ui/switch";
import { OrderSummary } from "@/components/order/OrderSummary";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatPrice } from "@/lib/format";
import { MOCK_PAYMENT_METHODS, simulatePayment, type MockPaymentMethod } from "@/services/payments";
import { isOrderExpired, useCart } from "@/store/cart";

/**
 * Simulación del paso por Mercado Pago (solo prototipo).
 * En producción, "Ir a pagar" redirige al init_point de Mercado Pago y el resultado
 * llega por webhook; esta pantalla no existe.
 */
export function PaymentPage() {
  useDocumentTitle("Pago");
  const { numero = "" } = useParams();
  const navigate = useNavigate();
  const order = useCart((s) => s.orders.find((o) => o.number === numero));
  const setPaymentStatus = useCart((s) => s.setPaymentStatus);
  const [method, setMethod] = useState<MockPaymentMethod>("cuenta");
  const [installments, setInstallments] = useState<1 | 3>(1);
  const [reject, setReject] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!order) {
    return (
      <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-serif text-[40px] leading-tight">No encontramos ese pedido</h1>
        <p className="lead mt-3">Revisá el link o escribinos por WhatsApp.</p>
        <Link to="/" className={buttonVariants({ className: "mt-8" })}>
          Volver al inicio
        </Link>
      </section>
    );
  }
  // Un pedido aprobado o vencido no se puede volver a pagar.
  if (order.payment.status === "aprobado" || isOrderExpired(order)) return <Navigate to={`/pedido/${order.number}`} replace />;

  const pay = async () => {
    setProcessing(true);
    const result = await simulatePayment(method, { reject });
    setPaymentStatus(order.number, result.status, {
      methodLabel: result.methodLabel,
      installments: method === "tarjeta" ? installments : undefined,
    });
    navigate(`/pedido/${order.number}`, { replace: true });
  };

  return (
    <div className="container max-w-[960px] pb-20 pt-6 sm:pt-10">
      <Link
        to={`/pedido/${order.number}`}
        className="inline-flex items-center gap-1 rounded-sm text-[13px] uppercase tracking-[0.14em] text-tinta hover:text-malva-oscuro"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        Volver al pedido
      </Link>

      <aside aria-label="Aviso de prototipo" className="pitch-note mt-6 rounded-card p-4 text-[14px] leading-relaxed text-tinta">
        <p className="text-[12px] uppercase tracking-[0.18em] text-malva-oscuro">Pago simulado · prototipo</p>
        <p className="mt-1.5">
          En el sitio real, acá se abre Mercado Pago y el cliente paga ahí. Esta pantalla simula el resultado para mostrar
          qué pasa con el pedido en cada caso.
        </p>
      </aside>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
        <section aria-labelledby="pago-titulo" className="rounded-panel border border-linea bg-papel p-5 sm:p-8">
          <p className="kicker">Pedido {order.number}</p>
          <h1 id="pago-titulo" className="mt-3 font-serif text-[34px] leading-tight sm:text-[40px]">
            Pagá <span className="tabular">{formatPrice(order.total)}</span>
          </h1>
          <p className="mt-2 text-[15px] text-gris-texto">Elegí cómo pagar.</p>

          <div role="group" aria-label="Medio de pago" className="mt-6 grid gap-3">
            {MOCK_PAYMENT_METHODS.map((m) => (
              <OptionCard key={m.id} selected={method === m.id} onClick={() => setMethod(m.id)} className="pr-12">
                <span className="block text-[16px] text-tinta">{m.label}</span>
                <span className="mt-0.5 block text-[13px] text-gris-texto">{m.detail}</span>
              </OptionCard>
            ))}
          </div>

          {method === "tarjeta" && (
            <fieldset className="mt-5">
              <legend className="text-[12px] uppercase tracking-[0.16em] text-tinta">Cuotas</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip selected={installments === 1} onClick={() => setInstallments(1)}>
                  1 pago de {formatPrice(order.total)}
                </Chip>
                <Chip selected={installments === 3} onClick={() => setInstallments(3)}>
                  3 cuotas sin interés de {formatPrice(order.total / 3)}
                </Chip>
              </div>
            </fieldset>
          )}

          <div className="mt-6 flex items-center justify-between gap-4 rounded-option border border-dashed border-malva/60 bg-marfil px-4 py-3">
            <label htmlFor="simular-rechazo" className="text-[14px]">
              Simular que el pago es rechazado
              <span className="block text-[13px] text-gris-texto">Solo para la demo.</span>
            </label>
            <Switch id="simular-rechazo" checked={reject} onCheckedChange={setReject} />
          </div>

          <Button className="mt-6 w-full" onClick={pay} disabled={processing}>
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                Procesando el pago…
              </>
            ) : (
              <>Pagar {formatPrice(order.total)}</>
            )}
          </Button>
        </section>

        <aside aria-labelledby="pago-resumen" className="rounded-panel border border-linea bg-papel p-5 sm:p-7">
          <h2 id="pago-resumen" className="font-serif text-[26px]">
            Tu pedido
          </h2>
          <OrderSummary order={order} className="mt-2" />
        </aside>
      </div>
    </div>
  );
}
