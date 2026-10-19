# Florería Lisboa · prototipo de tienda online

Prototipo de e-commerce para Florería Lisboa, atelier floral de Buenos Aires.
React + Vite + TypeScript + Tailwind + shadcn/ui (Radix), estado con Zustand.

## Correrlo en tu computadora

Requisitos: Node.js 20 o superior (recomendado 22) y npm.

```bash
git clone https://github.com/santicelemink/floreria-lisboa.git
cd floreria-lisboa
npm install
npm run dev        # abre http://localhost:5173
```

Otros comandos:

```bash
npm run build      # chequeo de tipos + build de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4173 para revisarlo
```

## Publicarlo en Netlify

El repositorio ya trae `netlify.toml` con todo configurado, así que no hace falta tocar nada:

1. En [app.netlify.com](https://app.netlify.com), elegí **Add new site → Import an existing project**.
2. Conectá GitHub y elegí el repositorio `floreria-lisboa`.
3. Dejá los campos como los completa Netlify (vienen de `netlify.toml`):
   - Base directory: vacío
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy**. Cada push a `main` vuelve a publicar el sitio.

`netlify.toml` también fija Node 22 y redirige todas las rutas a `index.html`,
para que `/crear`, `/producto/alfama` o `/checkout` funcionen al recargar o al abrirlas desde un link.

Para otro hosting estático (Vercel, Cloudflare Pages): build `npm run build`, salida `dist`
y una regla de reescritura de `/*` a `/index.html`.

## Imágenes

El sitio usa dos tipos de imágenes. Todas van en `public/` y se pueden subir de a poco:
lo que todavía no existe se reemplaza solo (fotos provisorias o el ramo dibujado en SVG).

Para ver en cualquier momento qué está y qué falta, abrí **`/dev/composer`** (página interna, no enlazada):
muestra la grilla completa, cuántos assets hay y una lista de pendientes para copiar.

### 1. Fotos de ramos completos (listas)

Se usan en el hero, la colección, las fichas de producto y el carrito.

- Carpeta: `public/images/ramos/`
- Dos archivos por foto: `{slug}.webp` de **640 × 800** y `{slug}@2x.webp` de **1280 × 1600**.
- Encuadre **vertical 4:5**, ramo completo y centrado (con aire arriba y abajo), **fondo claro neutro** (papel o pared crema/gris muy claro, sin texturas fuertes), **luz natural suave** de costado, sin sombras duras. Misma altura de cámara y misma distancia en todas, para que la grilla se vea pareja.
- Hoy hay **imágenes provisorias** con ese mismo encuadre. Al subir cada foto definitiva, cambiá `final: false` por `final: true` en `src/data/photos.ts` (así `/dev/composer` deja de marcarla como provisoria).

| Archivos | Ramo | Qué tiene que mostrar |
|---|---|---|
| `hero.webp`<br>`hero@2x.webp` | Hero de la home | Ramo abundante (17 tallos) de peonías, rosas y ranúnculos en rubor, lavanda y manteca, con eucalipto. Papel de lino rubor y moño de satén marfil. Es la imagen principal del sitio: la más cuidada. |
| `alfama.webp`<br>`alfama@2x.webp` | Alfama | Ramo clásico (11 tallos) de rosas y ranúnculos en rubor claro, rubor y blanco, con eucalipto. Papel de lino rubor y moño de satén rubor. |
| `sintra.webp`<br>`sintra@2x.webp` | Sintra | Ramo clásico (11 tallos) de peonías y lisianthus en lavanda claro, lavanda y blanco, con eucalipto. Papel seda marfil y moño de cinta lavanda. |
| `belem.webp`<br>`belem@2x.webp` | Belém | Ramo abundante (17 tallos) de hortensias y rosas en blanco y crema, con eucalipto. Papel salvia y moño de cinta salvia. Sobrio y luminoso. |
| `tejo.webp`<br>`tejo@2x.webp` | Tejo | Ramo clásico (11 tallos) de tulipanes en durazno claro, durazno y crema, con eucalipto. Papel kraft natural y moño de cinta dorada. |
| `chiado.webp`<br>`chiado@2x.webp` | Chiado | Arreglo clásico (11 tallos) de peonías, rosas y lisianthus en rubor, lavanda y manteca, con eucalipto, dentro de una caja sombrerera lavanda pálido con banda de satén rubor y la palabra “Lisboa”. |
| `bairro.webp`<br>`bairro@2x.webp` | Bairro | Ramo petite (7 tallos) de ranúnculos y lisianthus en manteca, crema y blanco, con eucalipto. Papel seda marfil y moño de satén marfil. |

### 2. Assets del compositor (vista previa del configurador)

La vista previa del configurador se arma por capas con **14 imágenes de fondo transparente** (WebP o PNG con alfa),
usando la misma ubicación de flores que el dibujo: papel de atrás, follaje, flores, tallos, papel de adelante y moño.
Las flores, el papel y el moño se fotografían **en blanco** y el sitio los tiñe: las flores con los tres colores
de la paleta, el papel con el color del envoltorio y el moño con el color de la cinta.
Mientras falte **cualquiera** de las imágenes de una combinación, ese ramo se dibuja en SVG: el sitio nunca queda roto.

| Archivo | Medida | Cómo tiene que estar |
|---|---|---|
| `public/composer/flores/rosa.webp` | 600 × 600 o más | Rosa de jardín abierta, blanca. |
| `public/composer/flores/peonia.webp` | 600 × 600 o más | Peonía bien abierta, blanca, con estambres dorados. |
| `public/composer/flores/tulipan.webp` | 600 × 600 o más | Tulipán blanco en copa, a 45°. |
| `public/composer/flores/ranunculo.webp` | 600 × 600 o más | Ranúnculo blanco con capas concéntricas y centro verdoso. |
| `public/composer/flores/lisianthus.webp` | 600 × 600 o más | Lisianthus blanco abierto. |
| `public/composer/flores/hortensia.webp` | 600 × 600 o más | Cabeza redonda de hortensia blanca. |
| `public/composer/follaje/eucalipto-1.webp` a `eucalipto-3.webp` | 300 × 600 (1:2) | Tres ramas de eucalipto distintas, verticales, con la base del tallo en el centro del borde inferior. En su color real. |
| `public/composer/envoltorios/papel-atras.webp` | 1000 × 1200 (5:6) | Parte trasera del papel (la que queda detrás de las flores), blanca o marfil. |
| `public/composer/envoltorios/papel-adelante.webp` | 1000 × 1200 (5:6) | Frente del cono de papel, blanco o marfil, sin tallos. |
| `public/composer/envoltorios/tallos.webp` | 1000 × 1200 (5:6) | Solo los tallos verdes atados que asoman debajo del cono. En su color real. |
| `public/composer/caja/caja-sombrerera.webp` | 1000 × 1200 (5:6) | Frente de la caja sombrerera lavanda pálido con “Lisboa”, sin tapa, sin cinta. En su color real. |
| `public/composer/cintas/mono.webp` | 400 × 400 | Moño de satén blanco visto de frente, el nudo en el centro. |

Flores: la flor centrada ocupando ~90% del ancho, vista desde arriba en leve ángulo, sin tallo ni sombra (la sombra la agrega el sitio).
Papel, tallos y caja: lienzo completo alineado al ramo Clásico, con el cuello del ramo (donde va el moño) en **(500, 870)**;
la caja con el centro del borde de la boca en **(500, 560)**. No hace falta que queden exactos: se ajustan al cargarlos.
Petite y Abundante usan las mismas imágenes: el sitio las escala.

**Colores.** Cada paleta usa tres tonos de flor (se cambian en `PALETTE_COMPOSER_COLORS`) y cada tono tiene su hex
en `COMPOSER_COLOR_HEX`, los dos en `src/data/catalog.ts`. Para afinar cómo se ve un tinte, alcanza con cambiar el hex.

| Paleta | Colores |
|---|---|
| Rubor | rubor-claro, rubor, blanco |
| Lavanda | lavanda-claro, lavanda, blanco |
| Durazno | durazno-claro, durazno, crema |
| Manteca | manteca, crema, blanco |
| Marfil | blanco, crema, durazno-claro |
| Jardín | rubor, lavanda, manteca |

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Home con todas las secciones (hero, beneficios, configurador, colección, suscripción, reseñas, preguntas) |
| `/crear` | Configurador a pantalla completa |
| `/coleccion` | Diseños de la casa con filtros por ocasión |
| `/producto/:slug` | Ficha de producto (`alfama`, `sintra`, `belem`, `tejo`, `chiado`, `bairro`) |
| `/suscripcion` | Planes y recordatorios |
| `/checkout` | Datos, entrega y pago simulado |
| `/pedido-confirmado` | Número de pedido y resumen |
| `/dev/composer` | Uso interno: revisión de imágenes del compositor y fotos (no enlazada, `noindex`) |

Links útiles para la presentación:

- `/?pitch=1` abre el sitio con el **modo presentación** activo (notas de UX y sección “Lo que gana el negocio”). `/?pitch=0` lo apaga.
- `Compartir` en el configurador copia un link `/crear?diseno=...` con el ramo codificado.

## Estructura

```
src/
  components/
    bouquet/        BouquetPhoto (fotos), BouquetComposer (vista previa por capas) y BouquetPreview (SVG de respaldo)
    configurator/   Los 6 pasos, vista previa, barra de progreso
    cart/           Drawer del pedido, entrega (corte de las 14 h), envío sin cargo
    pitch/          Modo presentación
    ui/             Componentes shadcn/ui adaptados a la identidad
  data/             Catálogo (ocasiones, paletas, flores, tamaños...), productos y textos
  lib/              Precios, horario de Buenos Aires, formato, almacenamiento seguro
  services/         Mocks async: orders, payments, reminders, subscriptions
  store/            Zustand: carrito, configurador, modo presentación
```

## Conectar backend más adelante

Los servicios de `src/services` devuelven promesas con éxito simulado. Para producción
se reemplaza el cuerpo de cada función (Supabase para pedidos, recordatorios y
suscripciones; Mercado Pago Checkout Pro o Bricks para pagos) manteniendo la firma:
la UI no cambia.

## Notas

- Precio: `base del tamaño + promedio del recargo de flores × (tallos / 11) × 1.4 + envoltorio + tarjeta + extras`, redondeado a la centena.
- Toda la lógica de horarios usa `America/Argentina/Buenos_Aires`.
- Se persisten en `localStorage` (con try/catch) el pedido, el diseño guardado y el modo presentación.
- Para cumplir contraste AA, el texto secundario usa `gris-texto` (#6B6264) y el texto chico en acento usa `malva-oscuro`; el gris #7D7476 y el malva #A8707C quedan para íconos, bordes, placeholders y títulos grandes.
- El número de WhatsApp es de ejemplo: se cambia en `src/data/catalog.ts` (`WHATSAPP_NUMBER`).
