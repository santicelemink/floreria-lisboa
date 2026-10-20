import { useEffect, useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { DeliveryPicker, deliveryProblem, type DeliveryProblem } from "@/components/cart/DeliveryPicker";
import { PaymentBadges } from "@/components/cart/PaymentBadges";
import { PAYMENT_WINDOW_HOURS } from "@/data/catalog";
import { useCatalog } from "@/lib/catalogData";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isValidArgentinePhone } from "@/lib/phone";
import { cartTotal } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { formatLongDate } from "@/lib/time";
import { cn } from "@/lib/utils";
import { createOrder } from "@/services/orders";
import { createPaymentPreference, MOCK_PAYMENT_METHODS } from "@/services/payments";
import { deliveryDateISO, useCart } from "@/store/cart";

const PHONE_HINT = "Revisá el número. Por ejemplo: 11 2345 6789.";

const schema = z
  .object({
    deliveryMode: z.enum(["envio", "retiro"]),
    buyerName: z.string().trim().min(2, "Escribí tu nombre y apellido."),
    email: z.string().trim().min(1, "Necesitamos tu email para mandarte el comprobante.").email("Revisá el email: parece incompleto."),
    whatsapp: z
      .string()
      .trim()
      .min(1, "Dejanos tu WhatsApp: por ahí coordinamos la entrega y te mandamos la foto.")
      .refine(isValidArgentinePhone, PHONE_HINT),
    recipientName: z.string().trim().optional(),
    address: z.string().trim().optional(),
    apartment: z.string().trim().max(40, "Usá menos de 40 caracteres.").optional(),
    recipientPhone: z.string().trim().optional(),
    notes: z.string().trim().max(200, "Usá menos de 200 caracteres.").optional(),
  })
  .superRefine((v, ctx) => {
    if (v.deliveryMode !== "envio") return;
    if (!v.recipientName || v.recipientName.length < 2)
      ctx.addIssue({ code: "custom", path: ["recipientName"], message: "Escribí el nombre de quien recibe el ramo." });
    if (!v.address || v.address.length < 5)
      ctx.addIssue({ code: "custom", path: ["address"], message: "Escribí la dirección con calle y altura." });
    else if (!/\d/.test(v.address))
      ctx.addIssue({ code: "custom", path: ["address"], message: "Sumá la altura de la calle, por ejemplo: Honduras 4800." });
    if (!v.recipientPhone)
      ctx.addIssue({ code: "custom", path: ["recipientPhone"], message: "Necesitamos un teléfono por si no responden el timbre." });
    else if (!isValidArgentinePhone(v.recipientPhone))
      ctx.addIssue({ code: "custom", path: ["recipientPhone"], message: PHONE_HINT });
  });

type FormValues = z.infer<typeof schema>;

function Block({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`bloque-${n}`} className="rounded-panel border border-linea bg-papel p-5 sm:p-8">
      <h2 id={`bloque-${n}`} className="flex items-center gap-3 font-serif text-[26px] leading-tight sm:text-[28px]">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-malva font-serif text-[17px] text-malva-oscuro">
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function CheckoutPage() {
  useDocumentTitle("Finalizar pedido");
  const navigate = useNavigate();
  const ids = useId();
  const items = useCart((s) => s.items);
  const delivery = useCart((s) => s.delivery);
  const createOrderInStore = useCart((s) => s.createOrder);
  const normalizeDelivery = useCart((s) => s.normalizeDelivery);
  const total = cartTotal(items.map((i) => i.price));
  const [problem, setProblem] = useState<DeliveryProblem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isPickup = delivery.mode === "retiro";
  const { business } = useCatalog();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { deliveryMode: delivery.mode },
  });

  // El modo de entrega vive en el carrito; el formulario lo usa para saber qué datos pedir.
  useEffect(() => {
    setValue("deliveryMode", delivery.mode, { shouldValidate: false });
  }, [delivery.mode, setValue]);

  useEffect(() => {
    normalizeDelivery();
  }, [normalizeDelivery]);

  useEffect(() => {
    if (problem && !deliveryProblem(delivery)) setProblem(null);
  }, [delivery, problem]);

  if (items.length === 0 && !submitting) {
    return (
      <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-serif text-[40px] leading-tight">Tu pedido está vacío</h1>
        <p className="lead mt-3">Diseñá un ramo o elegí uno de la colección.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/coleccion" className={buttonVariants({ variant: "secondary" })}>
            Ver la colección
          </Link>
          <Link to="/crear" className={buttonVariants()}>
            Diseñar mi ramo
          </Link>
        </div>
      </section>
    );
  }

  const fieldProps = (name: keyof FormValues) => ({
    id: `${ids}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${ids}-${name}-error` : undefined,
    ...register(name),
  });

  // Función de render (no componente) para que los inputs no se remonten en cada render.
  const field = (
    name: keyof FormValues,
    label: string,
    children: React.ReactNode,
    { optional, className }: { optional?: boolean; className?: string } = {},
  ) => (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={`${ids}-${name}`} className="text-[13px] tracking-[0.02em] text-tinta">
        {label}
        {optional && <span className="text-gris-texto"> (opcional)</span>}
      </label>
      <div className="mt-2">{children}</div>
      {errors[name] && (
        <p id={`${ids}-${name}-error`} className="mt-1.5 text-[13px] text-error">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );

  const onValid = async (values: FormValues) => {
    const issue = deliveryProblem(delivery);
    if (issue) {
      setProblem(issue);
      document.querySelector<HTMLElement>(`[data-delivery-field="${issue.field}"]`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const order = await createOrder({
        buyer: { name: values.buyerName, email: values.email, whatsapp: values.whatsapp },
        recipient: isPickup
          ? { name: values.recipientName || values.buyerName, notes: values.notes }
          : {
              name: values.recipientName ?? "",
              address: values.address,
              apartment: values.apartment,
              phone: values.recipientPhone,
              notes: values.notes,
            },
        items,
        delivery: { ...delivery, barrio: isPickup ? null : delivery.barrio, dateISO: deliveryDateISO(delivery) },
        total,
      });
      createOrderInStore(order);
      const preference = await createPaymentPreference(order);
      // En producción, init_point es la URL de Mercado Pago (redirección externa).
      navigate(preference.initPoint, { replace: true });
    } catch {
      toast("No pudimos crear el pedido. Probá de nuevo en unos segundos.");
      setSubmitting(false);
    }
  };

  const onInvalid = () => {
    toast("Revisá los datos marcados para continuar.");
    window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 30);
  };

  return (
    <div className="container pb-20 pt-6 sm:pt-10">
      <Link to="/" className="inline-flex items-center gap-1 rounded-sm text-[13px] uppercase tracking-[0.14em] text-tinta hover:text-malva-oscuro">
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        Seguir comprando
      </Link>
      <header className="mt-6">
        <p className="kicker">Último paso</p>
        <h1 className="section-title mt-3">
          Finalizá tu <em>pedido</em>
        </h1>
      </header>

      <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
        <input type="hidden" {...register("deliveryMode")} />
        <div className="space-y-5">
          <Block n={1} title="Tus datos">
            <div className="grid gap-4 sm:grid-cols-2">
              {field("buyerName", "Nombre y apellido", <Input {...fieldProps("buyerName")} autoComplete="name" />, { className: "sm:col-span-2" })}
              {field("email", "Email", <Input type="email" inputMode="email" {...fieldProps("email")} autoComplete="email" placeholder="nombre@mail.com" />)}
              {field("whatsapp", "WhatsApp", <Input type="tel" inputMode="tel" {...fieldProps("whatsapp")} autoComplete="tel" placeholder="11 2345 6789" />)}
            </div>
          </Block>

          <Block n={2} title="Entrega">
            <DeliveryPicker problem={problem} />
            <div className="mt-7 border-t border-linea pt-6">
              {isPickup ? (
                <div className="grid gap-4">
                  {field("recipientName", "Quién lo retira", <Input {...fieldProps("recipientName")} autoComplete="off" placeholder="Si no sos vos" />, { optional: true })}
                  {field("notes", "Notas", <Textarea {...fieldProps("notes")} className="min-h-[88px]" placeholder="Algo que tengamos que saber" />, { optional: true })}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {field("recipientName", "Nombre de quien recibe", <Input {...fieldProps("recipientName")} autoComplete="off" />, { className: "sm:col-span-2" })}
                  {field("address", "Dirección", <Input {...fieldProps("address")} autoComplete="street-address" placeholder="Honduras 4800" />)}
                  {field("apartment", "Piso o depto", <Input {...fieldProps("apartment")} placeholder="3.° B" />, { optional: true })}
                  {field("recipientPhone", "Teléfono de quien recibe", <Input type="tel" inputMode="tel" {...fieldProps("recipientPhone")} placeholder="11 2345 6789" />, { className: "sm:col-span-2" })}
                  {field("notes", "Notas para la entrega", <Textarea {...fieldProps("notes")} className="min-h-[88px]" placeholder="Timbre que no anda, portería, horario preferido…" />, { optional: true, className: "sm:col-span-2" })}
                </div>
              )}
            </div>
          </Block>

          <Block n={3} title="Pago">
            <p className="text-[15px] leading-relaxed text-tinta">
              Pagás en <span className="font-normal">Mercado Pago</span>, con el medio que prefieras:
            </p>
            <ul className="mt-3 grid gap-2 text-[14px] text-gris-texto sm:grid-cols-2">
              {MOCK_PAYMENT_METHODS.map((m) => (
                <li key={m.id} className="rounded-option border border-linea bg-marfil px-3.5 py-2.5">
                  {m.label}
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-start gap-2.5 rounded-option bg-salvia/70 p-4 text-[14px] leading-relaxed text-tinta">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-malva-profundo" strokeWidth={1.5} aria-hidden="true" />
              <span>
                Tu pedido se confirma cuando Mercado Pago aprueba el pago. Si pagás en efectivo o por transferencia, queda
                reservado {PAYMENT_WINDOW_HOURS} h hasta que se acredite.
              </span>
            </p>
            <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-gris-texto">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-malva-oscuro" strokeWidth={1.5} aria-hidden="true" />
              Los datos de tu tarjeta los carga Mercado Pago: nunca pasan por este sitio.
            </p>
            <Button type="submit" className="mt-6 w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                  Preparando tu pago…
                </>
              ) : (
                <>Ir a pagar {formatPrice(total)}</>
              )}
            </Button>
          </Block>
        </div>

        <aside aria-labelledby="resumen-titulo" className="rounded-panel border border-linea bg-papel p-5 sm:p-7 lg:sticky lg:top-24">
          <h2 id="resumen-titulo" className="font-serif text-[26px]">
            Resumen
          </h2>
          <ul className="mt-2 divide-y divide-linea">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </ul>
          <div className="border-t border-linea pt-4 text-[14px]">
            <p className="text-gris-texto">{isPickup ? "Retiro en el atelier" : "Envío a domicilio"}</p>
            <p className="mt-1 first-letter:uppercase">
              {formatLongDate(deliveryDateISO(delivery))} · {delivery.slot}
              {!isPickup && delivery.barrio ? ` · ${delivery.barrio}` : ""}
            </p>
            <p className="mt-1 text-[13px] text-gris-texto">
              {isPickup ? business.address : "Día y horario a confirmar por WhatsApp."}
            </p>
          </div>
          <dl className="mt-4 space-y-1.5 border-t border-linea pt-4 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt className="text-gris-texto">Ramos</dt>
              <dd className="tabular">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gris-texto">{isPickup ? "Retiro" : "Envío"}</dt>
              <dd className="text-right">{isPickup ? "Sin cargo" : "Se coordina y abona aparte"}</dd>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <dt className="uppercase tracking-[0.14em]">Total a pagar</dt>
              <dd className="tabular font-serif text-[26px] leading-none">{formatPrice(total)}</dd>
            </div>
          </dl>
          <PaymentBadges className="mt-5" />
        </aside>
      </form>
    </div>
  );
}
