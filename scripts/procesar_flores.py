"""
Procesa las fotos de flores para el compositor del configurador.

Entrada: una foto por variedad (flor blanca con tallo, fondo liso), por ejemplo rosa.png.
Salida, en public/composer/flores/:
  {variedad}.webp        cabeza de la flor (el sitio la tiñe con la paleta)
  {variedad}-tallo.webp  tallo y hojas (quedan en su verde natural)
Las dos capas comparten el mismo lienzo de 600 x 1200 px, con el centro de la cabeza
en (300, 264) y la cabeza de 360 px de ancho, así el compositor las ubica igual.

Uso (necesita Python 3 con: pip install "rembg[cpu]" pillow numpy):
  python scripts/procesar_flores.py rosa.png tulipan.png ... --salida public/composer/flores
El nombre de cada archivo de entrada (sin extensión) es el nombre de la variedad.
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

CANVAS_W, CANVAS_H = 600, 1200
HEAD_CX, HEAD_CY, HEAD_W = 300, 264, 360


def hue_sat(rgb: np.ndarray):
    hsv = np.array(Image.fromarray(rgb).convert("HSV")).astype(np.float32)
    return hsv[..., 0] * 360 / 255, hsv[..., 1] / 255


def soften(mask: np.ndarray) -> np.ndarray:
    img = Image.fromarray((mask.astype(np.float32) * 255).astype(np.uint8))
    return np.array(img.filter(ImageFilter.GaussianBlur(1.2))) / 255


def process(path: Path, out_dir: Path, session) -> None:
    cut = np.array(remove(Image.open(path).convert("RGB"), session=session, post_process_mask=True))
    rgb, alpha = cut[..., :3], cut[..., 3].astype(np.float32) / 255
    hue, sat = hue_sat(rgb)
    is_green = (hue > 45) & (hue < 185)
    g = soften(is_green & (sat > 0.12))  # tallo y hojas, incluso el verde grisáceo
    head_a, stem_a = alpha * (1 - g), alpha * g

    # Caja de la cabeza: el bloque superior de filas con pétalos (así una hoja clara más abajo
    # no se confunde con la flor). La usamos para escalar y centrar todas las flores igual.
    petals = head_a > 0.5
    widths = petals.sum(1)
    rows = np.where(widths > widths.max() * 0.15)[0]
    y0 = rows[0]
    y1 = y0
    for r in rows[1:]:
        if r - y1 > 3:
            break
        y1 = r
    xs = np.where(petals[y0 : y1 + 1].any(0))[0]
    x0, x1 = xs.min(), xs.max()
    # Dentro de la cabeza, solo el verde fuerte (centro del ranúnculo, sépalos) va con el tallo:
    # las sombras levemente verdosas de los pétalos se quedan en la cabeza y se tiñen.
    # Debajo de la cabeza, todo va con el tallo (incluida una hoja clara).
    head_rows = np.zeros_like(head_a, dtype=bool)
    head_rows[: y1 + 4] = True
    g = np.where(head_rows, soften(is_green & (sat > 0.35)), 1.0)
    head_a, stem_a = alpha * (1 - g), alpha * g
    scale = HEAD_W / (x1 - x0)
    cx, cy = (x0 + x1) / 2 * scale, (y0 + y1) / 2 * scale

    for suffix, a in (("", head_a), ("-tallo", stem_a)):
        layer = Image.fromarray(np.dstack([rgb, (a * 255).astype(np.uint8)]), "RGBA")
        layer = layer.resize((round(layer.width * scale), round(layer.height * scale)), Image.LANCZOS)
        canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        canvas.paste(layer, (round(HEAD_CX - cx), round(HEAD_CY - cy)), layer)
        target = out_dir / f"{path.stem}{suffix}.webp"
        canvas.save(target, "WEBP", quality=88)
        print("ok", target)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("imagenes", nargs="+", type=Path)
    parser.add_argument("--salida", type=Path, default=Path("public/composer/flores"))
    args = parser.parse_args()
    args.salida.mkdir(parents=True, exist_ok=True)
    session = new_session("isnet-general-use")
    for path in args.imagenes:
        process(path, args.salida, session)


if __name__ == "__main__":
    main()
