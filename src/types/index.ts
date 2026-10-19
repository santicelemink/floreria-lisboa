export type OccasionId =
  | "cumpleanos"
  | "amor"
  | "aniversario"
  | "nacimiento"
  | "agradecimiento"
  | "condolencias"
  | "porque-si";
export type PaletteId = "rubor" | "lavanda" | "durazno" | "manteca" | "marfil" | "jardin";
export type FlowerId = "rosa" | "peonia" | "tulipan" | "ranunculo" | "lisianthus" | "hortensia";
export type SizeId = "petite" | "clasico" | "abundante";
export type WrapId = "seda-marfil" | "lino-rubor" | "kraft" | "salvia" | "caja";
export type RibbonId = "saten-rubor" | "saten-marfil" | "salvia" | "lavanda" | "dorado";
export type CardDesignId = "clasica" | "acuarela" | "minima";
export type FontId = "clasica" | "manuscrita";
export type ExtraId = "florero" | "vela" | "bombones";

export interface BouquetConfig {
  occasion: OccasionId;
  palette: PaletteId;
  flowers: FlowerId[];
  size: SizeId;
  wrap: WrapId;
  ribbon: RibbonId;
  cardDesign: CardDesignId;
  font: FontId;
  message: string;
  anonymous: boolean;
  extras: ExtraId[];
}

export interface CartItem {
  id: string;
  name: string;
  productSlug?: string;
  config: BouquetConfig;
  price: number;
  addedAt: number;
}

export type DeliveryDay = "hoy" | "manana" | "otra";

/** La florería no tiene reparto propio: el envío se coordina por WhatsApp con mensajería. */
export type DeliveryMode = "envio" | "retiro";

export interface DeliveryInfo {
  mode: DeliveryMode;
  day: DeliveryDay;
  date: string | null; // YYYY-MM-DD, solo para "otra"
  slot: string | null;
  barrio: string | null; // solo para envío
}

/**
 * Estado del pago, como en Mercado Pago:
 * - sin_pagar: el pedido se creó pero todavía no se pagó.
 * - pendiente: se eligió un medio que se acredita después (efectivo, transferencia).
 * - aprobado: pago acreditado. Recién acá el pedido queda confirmado.
 * - rechazado: el pago no pasó; se puede reintentar con otro medio.
 */
export type PaymentStatus = "sin_pagar" | "pendiente" | "aprobado" | "rechazado";

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  /** Si el pago no se aprueba antes de esta fecha, el pedido se cancela. */
  expiresAt: string;
  buyer: { name: string; email: string; whatsapp: string };
  recipient: { name: string; address?: string; apartment?: string; phone?: string; notes?: string };
  items: CartItem[];
  delivery: DeliveryInfo & { dateISO: string };
  total: number;
  payment: {
    status: PaymentStatus;
    methodLabel?: string;
    installments?: number;
    updatedAt: string;
  };
}
