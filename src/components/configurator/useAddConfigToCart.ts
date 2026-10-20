import { useCallback } from "react";
import { toast } from "sonner";
import { PRODUCT_BY_SLUG } from "@/data/products";
import { configsEqual } from "@/lib/bouquet";
import { getCatalog, unavailableFlowers, unavailableMessage } from "@/lib/catalogData";
import { useCart } from "@/store/cart";
import { useConfigurator } from "@/store/configurator";

export function itemNameFor(config: ReturnType<typeof useConfigurator.getState>["config"], baseSlug: string | null) {
  const product = baseSlug ? PRODUCT_BY_SLUG[baseSlug] : undefined;
  if (!product) return "Ramo a tu manera";
  const name = getCatalog().productBySlug[product.slug]?.name ?? product.name;
  return configsEqual(config, product.config) ? name : `${name}, a tu manera`;
}

/** Agrega el diseño actual: abre el carrito, avisa con un toast y vuelve al paso 1. */
export function useAddConfigToCart() {
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);
  return useCallback(() => {
    const { config, baseProduct, setStep } = useConfigurator.getState();
    // No se vende lo que la florería marcó sin stock: se avisa y se vuelve al paso de las flores.
    const missing = unavailableMessage(unavailableFlowers(config));
    if (missing) {
      setStep(2);
      toast(missing);
      return;
    }
    addItem({ name: itemNameFor(config, baseProduct), config, productSlug: baseProduct ?? undefined });
    setStep(0);
    openCart();
    toast("Tu diseño agregado al pedido");
  }, [addItem, openCart]);
}
