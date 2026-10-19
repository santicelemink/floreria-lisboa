import { Link, Navigate, useParams } from "react-router-dom";
import { Camera, Check, Clock, Flower2, MessageCircle, PackageCheck, X, type LucideIcon } from "lucide-react";
import type { Order } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { OrderSummary } from "@/components/order/OrderSummary";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useNow } from "@/hooks/useNow";
import { formatPrice } from "@/lib/format";
import { coordinationLink, paymentHelpLink } from "@/lib/orderMessages";
import { formatDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { isOrderExpired, useCart } from "@/store/cart";

type View = "aprobado" | "pendiente" | "sin_pagar" | "rechazado" | "vencido";

const HEADER: Record<View, { icon: LucideIcon; tone: string; kicker: string }> = {
  aprobado: { icon: Check, tone: "bg-salvia", kicker: "Pedido confirmado" },
  pendiente: { icon: Clock, tone: "bg-manteca", kicker: "Esperando la acreditación del pago" },
  sin_pagar: { icon: Clock, tone: "bg-manteca", kicker: "Falta pagar" },
  rechazado: { icon: X, tone: "bg-rubor", kicker: "Pago rechazado" },
  vencido: { icon: X, tone: "bg-linea", kicker: "Pedido cancelado" },
};

function Timeline({ order, view }: { order: Order; view: View }) {
  const paid = view === "aprobado";
  const steps = [
    { icon: PackageCheck, label: "Pedido creado", done: true },
    { icon: Check, label: paid ? "Pago aprobado" : "Pago", done: paid, current: !paid },
    { icon: Flower2, label: "Lo preparamos", done: false, current: paid },
    { icon: Camera, label: "Foto por WhatsApp", done: false },
    {
      icon: MessageCircle,
      label: order.delivery.mode === "retiro" ? "Retiro coordinado" : "Envío coordinado",
      done: false,
    },
  ];
  return (
    <ol className="mx-auto mt-10 grid max-w-[680px] grid-cols-5 gap-1.5" aria-label="Estado del pedido">
      {steps.map(({ icon: Icon, label, done, current }) => (
        <li key={label} className="flex flex-col items-center text-center" aria-current={current ? "step" : undefined}>
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border",
              done ? "border-oro bg-oro text-papel" : current ? "border-malva bg-papel text-malva-oscuro" : "border-linea bg-papel text-gris",
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </span>
          <span className={cn("mt-2 text-[13px] leading-snug", done || current ? "text-tinta" : "text-gris-texto")}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderStatusPage() {
  useDocumentTitle("Tu pedido");
  const { numero = "" } = useParams();
  const order = useCart((s) => s.orders.find((o) => o.number === numero));
  const setPaymentStatus = useCart((s) => s.setPaymentStatus);
  const now = useNow(30000);

  if (!order) {
    return (
      <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-serif text-[40px] leading-tight">No encontramos ese pedido</h1>
        <p className="lead mt-3">Si ya pagaste, revisá tu email o escribinos por WhatsApp.</p>
        <Link to="/" className={buttonVariants({ className: "mt-8" })}>
          Volver al inicio
        </Link>
      </section>
    );
  }

  const view: View = isOrderExpired(order, now.getTime()) ? "vencido" : order.payment.status;
  const { icon: Icon, tone, kicker } = HEADER[view];
  const firstName = order.buyer.name.split(" ")[0];
  const pickup = order.delivery.mode === "retiro";
  const method = order.payment.methodLabel
    ? ` (${order.payment.methodLabel.charAt(0).toLowerCase()}${order.payment.methodLabel.slice(1)})`
    : "";

  const title: Record<View, React.ReactNode> = {
    aprobado: (
      <>
        Gracias, <em>{firstName}</em>
      </>
    ),
    pendiente: (
      <>
        Tu pedido está <em>reservado</em>
      </>
    ),
    sin_pagar: (
      <>
        Tu pedido te <em>espera</em>
      </>
    ),
    rechazado: (
      <>
        No pudimos <em>cobrarlo</em>
      </>
    ),
    vencido: (
      <>
        Este pedido se <em>canceló</em>
      </>
    ),
  };

  const message: Record<View, React.ReactNode> = {
    aprobado: (
      <>
        El pago se aprobó{method} y tu pedido
        está confirmado. Te escribimos por WhatsApp para coordinar {pickup ? "el retiro" : "el envío"} y te mandamos una
        foto del ramo antes de que salga.
      </>
    ),
    pendiente: (
      <>
        Lo confirmamos apenas se acredite el pago{method}.
        Tenés tiempo hasta el {formatDateTime(order.expiresAt)}; si no se acredita, el pedido se cancela solo.
      </>
    ),
    sin_pagar: (
      <>
        Todavía no está confirmado: lo empezamos a preparar cuando se apruebe el pago. Podés pagarlo hasta el{" "}
        {formatDateTime(order.expiresAt)}.
      </>
    ),
    rechazado: <>No se realizó ningún cobro. Probá de nuevo con otro medio de pago; tu pedido sigue guardado.</>,
    vencido: <>No se acreditó el pago a tiempo, así que no se hizo ningún cobro. Podés volver a armarlo cuando quieras.</>,
  };

  return (
    <section className="container max-w-[880px] pb-20 pt-10 sm:pt-16">
      <div className="text-center">
        <span className={cn("mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full text-tinta", tone)}>
          <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="kicker mt-6">{kicker}</p>
        <h1 className="section-title mt-3">{title[view]}</h1>
        <p className="mt-3 text-[15px] text-gris-texto">
          Pedido <span className="tabular text-tinta">{order.number}</span> ·{" "}
          <span className="tabular text-tinta">{formatPrice(order.total)}</span>
        </p>
        <p className="lead mx-auto mt-5 max-w-[560px]" role="status">
          {message[view]}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {view === "aprobado" && (
            <a href={coordinationLink(order)} target="_blank" rel="noreferrer" className={buttonVariants()}>
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Coordinar {pickup ? "el retiro" : "el envío"} por WhatsApp
            </a>
          )}
          {(view === "sin_pagar" || view === "rechazado") && (
            <Link to={`/pago/${order.number}`} className={buttonVariants()}>
              {view === "rechazado" ? "Intentar con otro medio" : `Pagar ${formatPrice(order.total)}`}
            </Link>
          )}
          {view === "pendiente" && (
            <Link to={`/pago/${order.number}`} className={buttonVariants({ variant: "secondary" })}>
              Cambiar medio de pago
            </Link>
          )}
          {view === "vencido" && (
            <Link to="/crear" className={buttonVariants()}>
              Armar un ramo nuevo
            </Link>
          )}
          {view !== "aprobado" && view !== "vencido" && (
            <a href={paymentHelpLink(order)} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "secondary" })}>
              Consultar por WhatsApp
            </a>
          )}
        </div>

        {view === "pendiente" && (
          <div className="pitch-note mx-auto mt-6 max-w-[520px] rounded-card p-4 text-left text-[14px]">
            <p className="text-[12px] uppercase tracking-[0.18em] text-malva-oscuro">Pago simulado · prototipo</p>
            <p className="mt-1.5 text-tinta">En el sitio real, Mercado Pago avisa cuando se acredita y esta pantalla se actualiza sola.</p>
            <Button size="sm" variant="secondary" className="mt-3" onClick={() => setPaymentStatus(order.number, "aprobado")}>
              Simular acreditación del pago
            </Button>
          </div>
        )}
      </div>

      {view !== "vencido" && <Timeline order={order} view={view} />}

      <div className="mt-12 rounded-panel border border-linea bg-papel p-5 sm:p-8">
        <h2 className="font-serif text-[26px]">Resumen</h2>
        <OrderSummary order={order} className="mt-2" />
      </div>

      <div className="mt-10 flex justify-center">
        <Link to="/" className={buttonVariants({ variant: "secondary" })}>
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}

/** Compatibilidad con el link viejo /pedido-confirmado: lleva al último pedido. */
export function LatestOrderRedirect() {
  const latest = useCart((s) => s.orders[0]);
  return <Navigate to={latest ? `/pedido/${latest.number}` : "/"} replace />;
}
