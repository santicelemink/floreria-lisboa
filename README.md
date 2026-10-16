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

### 1. Fotos de ramos completos

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

La vista previa del configurador se arma por capas con imágenes de **fondo transparente** (WebP con alfa),
usando la misma ubicación de flores que el dibujo: envoltorio de atrás, follaje, flores, envoltorio de adelante y moño.
Mientras falte **cualquiera** de las imágenes de una combinación, ese ramo se dibuja en SVG: el sitio nunca queda roto.

Cómo fotografiar o recortar cada tipo:

| Tipo | Medida | Cómo tiene que estar |
|---|---|---|
| Flores | 400 × 400 o más (cuadrada) | Una sola flor vista desde arriba en leve ángulo, centrada y ocupando ~90% del ancho. Sin tallo ni sombra (la sombra la agrega el sitio). |
| Follaje | 300 × 600 (1:2) | Una rama de eucalipto vertical, con la base del tallo en el centro del borde inferior. |
| Envoltorios | 1000 × 1200 (5:6) | Lienzo completo alineado al ramo Clásico: el cuello del ramo (donde va el moño) en el punto **(500, 870)**. El de **atrás** es la parte del papel que queda detrás de las flores; el de **adelante**, el frente del cono **con los tallos que asoman abajo**. |
| Caja | 1000 × 1200 (5:6) | Frente de la caja sombrerera (cuerpo y banda, sin tapa), con el centro del borde de la boca en **(500, 560)**. |
| Cintas | 400 × 400 | Moño visto de frente con las dos colas, el nudo en el centro. |

Los tamaños Petite y Abundante usan las mismas imágenes: el sitio las escala.

**Colores.** Cada variedad se fotografía en 9 colores: `blanco`, `crema`, `rubor-claro`, `rubor`, `lavanda-claro`,
`lavanda`, `durazno-claro`, `durazno`, `manteca`. Cada paleta del configurador usa tres de ellos
(se cambia en `PALETTE_COMPOSER_COLORS`, en `src/data/catalog.ts`):

| Paleta | Colores |
|---|---|
| Rubor | rubor-claro, rubor, blanco |
| Lavanda | lavanda-claro, lavanda, blanco |
| Durazno | durazno-claro, durazno, crema |
| Manteca | manteca, crema, blanco |
| Marfil | blanco, crema, durazno-claro |
| Jardín | rubor, lavanda, manteca |

Lista completa de archivos (72):

```
# Flores: Rosas (9)
public/composer/flores/rosa/blanco.webp
public/composer/flores/rosa/crema.webp
public/composer/flores/rosa/rubor-claro.webp
public/composer/flores/rosa/rubor.webp
public/composer/flores/rosa/lavanda-claro.webp
public/composer/flores/rosa/lavanda.webp
public/composer/flores/rosa/durazno-claro.webp
public/composer/flores/rosa/durazno.webp
public/composer/flores/rosa/manteca.webp
# Flores: Peonías (9)
public/composer/flores/peonia/blanco.webp
public/composer/flores/peonia/crema.webp
public/composer/flores/peonia/rubor-claro.webp
public/composer/flores/peonia/rubor.webp
public/composer/flores/peonia/lavanda-claro.webp
public/composer/flores/peonia/lavanda.webp
public/composer/flores/peonia/durazno-claro.webp
public/composer/flores/peonia/durazno.webp
public/composer/flores/peonia/manteca.webp
# Flores: Tulipanes (9)
public/composer/flores/tulipan/blanco.webp
public/composer/flores/tulipan/crema.webp
public/composer/flores/tulipan/rubor-claro.webp
public/composer/flores/tulipan/rubor.webp
public/composer/flores/tulipan/lavanda-claro.webp
public/composer/flores/tulipan/lavanda.webp
public/composer/flores/tulipan/durazno-claro.webp
public/composer/flores/tulipan/durazno.webp
public/composer/flores/tulipan/manteca.webp
# Flores: Ranúnculos (9)
public/composer/flores/ranunculo/blanco.webp
public/composer/flores/ranunculo/crema.webp
public/composer/flores/ranunculo/rubor-claro.webp
public/composer/flores/ranunculo/rubor.webp
public/composer/flores/ranunculo/lavanda-claro.webp
public/composer/flores/ranunculo/lavanda.webp
public/composer/flores/ranunculo/durazno-claro.webp
public/composer/flores/ranunculo/durazno.webp
public/composer/flores/ranunculo/manteca.webp
# Flores: Lisianthus (9)
public/composer/flores/lisianthus/blanco.webp
public/composer/flores/lisianthus/crema.webp
public/composer/flores/lisianthus/rubor-claro.webp
public/composer/flores/lisianthus/rubor.webp
public/composer/flores/lisianthus/lavanda-claro.webp
public/composer/flores/lisianthus/lavanda.webp
public/composer/flores/lisianthus/durazno-claro.webp
public/composer/flores/lisianthus/durazno.webp
public/composer/flores/lisianthus/manteca.webp
# Flores: Hortensias (9)
public/composer/flores/hortensia/blanco.webp
public/composer/flores/hortensia/crema.webp
public/composer/flores/hortensia/rubor-claro.webp
public/composer/flores/hortensia/rubor.webp
public/composer/flores/hortensia/lavanda-claro.webp
public/composer/flores/hortensia/lavanda.webp
public/composer/flores/hortensia/durazno-claro.webp
public/composer/flores/hortensia/durazno.webp
public/composer/flores/hortensia/manteca.webp
# Follaje (4)
public/composer/follaje/eucalipto-1.webp
public/composer/follaje/eucalipto-2.webp
public/composer/follaje/eucalipto-3.webp
public/composer/follaje/eucalipto-4.webp
# Envoltorios (8)
public/composer/envoltorios/seda-marfil-atras.webp
public/composer/envoltorios/seda-marfil-adelante.webp
public/composer/envoltorios/lino-rubor-atras.webp
public/composer/envoltorios/lino-rubor-adelante.webp
public/composer/envoltorios/kraft-atras.webp
public/composer/envoltorios/kraft-adelante.webp
public/composer/envoltorios/salvia-atras.webp
public/composer/envoltorios/salvia-adelante.webp
# Caja (1)
public/composer/caja/caja-sombrerera.webp
# Cintas (5)
public/composer/cintas/saten-rubor.webp
public/composer/cintas/saten-marfil.webp
public/composer/cintas/salvia.webp
public/composer/cintas/lavanda.webp
public/composer/cintas/dorado.webp
```

Para empezar por lo que más se ve: las combinaciones de los seis diseños de la casa y la paleta por defecto (Durazno con rosas y lisianthus en papel seda marfil) quedan completas con las flores en sus colores, el follaje, los cuatro papeles, la caja y las cinco cintas.

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
