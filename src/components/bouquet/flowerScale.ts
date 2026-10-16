import type { FlowerId } from "@/types";

/** Escala relativa de cada variedad dentro del ramo. */
export const FLOWER_SCALE: Record<FlowerId, number> = {
  rosa: 1,
  peonia: 1.14,
  tulipan: 0.92,
  ranunculo: 0.96,
  lisianthus: 0.94,
  hortensia: 1.12,
};
