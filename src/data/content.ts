export const BENEFITS = [
  { title: "Listo en el día", text: "Pagando antes de las 14 h" },
  { title: "Foto antes de salir", text: "Te la mandamos por WhatsApp" },
  { title: "Flores de estación", text: "Compradas cada mañana" },
  { title: "Hasta 3 cuotas", text: "Mercado Pago y tarjetas" },
];

export interface Plan {
  id: "mensual" | "quincenal" | "semanal";
  name: string;
  price: number;
  features: string[];
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "mensual",
    name: "Mensual",
    price: 31900,
    features: ["Ramo de estación", "Envío o retiro a coordinar", "Pausa cuando quieras"],
  },
  {
    id: "quincenal",
    name: "Quincenal",
    price: 28900,
    features: ["Ramo de estación", "Envío o retiro a coordinar", "Florero de regalo en la primera entrega"],
    featured: true,
  },
  {
    id: "semanal",
    name: "Semanal",
    price: 25900,
    features: ["Ramo de estación", "Envío o retiro a coordinar", "Ideal para oficinas"],
  },
];

export const REVIEWS = [
  {
    quote: "Lo diseñé desde el celular en cinco minutos y llegó igual a la vista previa.",
    author: "Clienta · Palermo",
  },
  {
    quote: "La foto antes de salir me dio una tranquilidad enorme, lo mandaba a otra ciudad.",
    author: "Cliente · Belgrano",
  },
  {
    quote: "Tenemos la quincenal para la oficina. Siempre flores distintas y bien elegidas.",
    author: "Estudio · Núñez",
  },
];

export const FAQS = [
  {
    q: "¿Hasta qué hora puedo pedir para hoy?",
    a: "Si el pago queda aprobado antes de las 14 h, preparamos el ramo en el día. Después de esa hora, lo preparamos al día siguiente a primera hora.",
  },
  {
    q: "¿Cómo es el envío?",
    a: "No tenemos reparto propio: enviamos con mensajería y coordinamos por WhatsApp el día, el horario y el costo, que depende de la zona y se abona aparte. También podés retirarlo sin cargo en el atelier.",
  },
  {
    q: "¿Cuándo queda confirmado mi pedido?",
    a: "Cuando Mercado Pago aprueba el pago. Con tarjeta o dinero en cuenta es al instante; con efectivo o transferencia, el pedido queda reservado 24 h hasta que se acredite.",
  },
  {
    q: "¿El ramo va a ser igual a la vista previa?",
    a: "Respetamos paleta, flores, tamaño y envoltorio. Como trabajamos con flores de estación, alguna variedad puede cambiar por otra equivalente; siempre te mandamos la foto antes de salir.",
  },
  {
    q: "¿Puedo enviarlo en forma anónima?",
    a: "Sí. En el paso de la tarjeta activás “Enviar sin firma”.",
  },
  {
    q: "¿Hacen pedidos para empresas y eventos?",
    a: "Sí: abonos para oficinas, regalos corporativos y ambientación. Escribinos por WhatsApp para un presupuesto.",
  },
];

export interface PitchNoteData {
  n: number;
  title: string;
  what: string;
  why: string;
}

export const PITCH_NOTES: Record<number, PitchNoteData> = {
  1: {
    n: 1,
    title: "Urgencia real y transparente",
    what: "Contador al corte de las 14 h en la barra superior.",
    why: "Responde antes de que la pregunten la duda más común (“¿llega hoy?”). Menos mensajes de consulta y más pedidos que se deciden en el momento, sin trucos de escasez falsa.",
  },
  2: {
    n: 2,
    title: "Una acción principal (ley de Hick)",
    what: "Dos caminos, nada más: diseñar o elegir uno armado.",
    why: "Cuantas más opciones aparecen al principio, más tarda la gente en decidir. El botón oscuro guía hacia el diseño personalizado, que es el pedido de mayor valor.",
  },
  3: {
    n: 3,
    title: "Divulgación progresiva y vista previa en vivo",
    what: "Una decisión por paso, con barra de progreso y el ramo dibujándose en tiempo real.",
    why: "Personalizar es lo que más agota en una compra online; separarlo en pasos baja la carga mental. Además, lo que uno arma lo valora más (efecto IKEA, estudiado por Norton, Mochon y Ariely), lo que sostiene precios más altos que un ramo de catálogo. El botón “Sorprendeme” rescata a quien se traba.",
  },
  4: {
    n: 4,
    title: "Opción predeterminada y anclaje de precio",
    what: "En “Tamaño”, el Clásico viene elegido y marcado como el más pedido; el Abundante funciona como referencia alta.",
    why: "La mayoría acepta la opción sugerida (efecto default, Johnson y Goldstein). Mostrar una opción superior hace que la del medio se perciba razonable. Los extras de la tarjeta suman ticket justo cuando el cliente está pensando en el regalo.",
  },
  5: {
    n: 5,
    title: "Pocas opciones, bien curadas",
    what: "Seis diseños filtrables por ocasión, cada uno editable en el configurador.",
    why: "Un catálogo enorme paraliza (el estudio de las mermeladas de Iyengar y Lepper mostró que menos variedad puede vender más). Además, la florería trabaja con menos variedad de flores, lo que reduce la merma.",
  },
  6: {
    n: 6,
    title: "Ingresos recurrentes y recompra",
    what: "Suscripción con el plan del medio destacado y recordatorios de fechas importantes.",
    why: "La venta de flores depende de fechas puntuales. La suscripción aporta ingresos previsibles para planificar la compra en el mercado, y los recordatorios convierten una compra única en un cliente que vuelve cada año.",
  },
  7: {
    n: 7,
    title: "Prueba social (Cialdini)",
    what: "Reseñas reales, con barrio y tipo de cliente.",
    why: "Ante la duda, la gente se apoya en lo que hicieron otros parecidos a ella. En el sitio real se reemplazan por reseñas verificadas de Google.",
  },
  8: {
    n: 8,
    title: "Expectativas claras",
    what: "Envío o retiro coordinado por WhatsApp, y pedido confirmado recién con el pago aprobado, como en Mercado Libre.",
    why: "Prometer solo lo que la florería puede cumplir evita reclamos: sin reparto propio, el envío se acuerda caso por caso. Y como nada se prepara sin pago acreditado, no se compran flores para pedidos que nunca se pagan.",
  },
};

export const BUSINESS_GAINS = [
  {
    numeral: "I",
    title: "Vende mientras atendés el local",
    text: "Los pedidos llegan completos y ya pagos, con tarjeta y preferencia de día y franja. Por WhatsApp queda solo coordinar la entrega, no armar cada ramo.",
  },
  {
    numeral: "II",
    title: "Ticket más alto",
    text: "Tamaños, flores premium, envoltorios y extras suman valor sin que nadie tenga que ofrecerlos en el mostrador.",
  },
  {
    numeral: "III",
    title: "Clientes que vuelven",
    text: "Suscripción y recordatorios convierten fechas sueltas en ingresos que se repiten, y ordenan la compra de flores.",
  },
];

export const CARE_TIPS = [
  "Al recibirlo, cortá los tallos en diagonal, unos 2 cm, con una tijera limpia.",
  "Usá un florero limpio con agua fresca hasta la mitad y cambiala cada dos días.",
  "Quitá las hojas que quedan debajo del agua para que no se enturbie.",
  "Ubicalo lejos del sol directo, de la calefacción y de la fruta madura.",
];

export const SHIPPING_INFO = [
  "No tenemos reparto propio: enviamos con mensajería y coordinamos día, horario y costo por WhatsApp. El envío depende de la zona y se abona aparte.",
  "También podés retirarlo sin cargo en el atelier, de lunes a sábado de 8 a 20 h y los domingos de 9 a 14 h.",
  "Si el pago queda aprobado antes de las 14 h, el ramo está listo en el día.",
  "Antes de que salga te mandamos una foto real del ramo por WhatsApp.",
];
