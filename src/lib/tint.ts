/**
 * Matriz de color para teñir una imagen blanca con un tono (filtro SVG feColorMatrix).
 * Multiplica cada canal por el color y conserva un poco del original (`keep`) para
 * que los brillos de los pétalos no queden planos.
 */
export function tintMatrix(hex: string, keep = 0.1) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c * (1 - keep) + keep).toFixed(3);
  return `${f(r)} 0 0 0 0  0 ${f(g)} 0 0 0  0 0 ${f(b)} 0 0  0 0 0 1 0`;
}
