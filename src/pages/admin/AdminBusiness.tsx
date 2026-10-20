import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ATELIER, WHATSAPP_NUMBER } from "@/data/catalog";
import { useCatalog } from "@/lib/catalogData";
import { normalizeArgentinePhone } from "@/lib/phone";
import { useCatalogStore } from "@/store/catalog";
import { AdminCard } from "./AdminUI";

/** 5491123456789 → 11 2345 6789 (para mostrar). */
function prettyPhone(full: string) {
  const local = full.replace(/^549/, "");
  return local.length === 10 ? `${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}` : full;
}

export function AdminBusiness() {
  const catalog = useCatalog();
  const setBusiness = useCatalogStore((s) => s.setBusiness);
  const [phone, setPhone] = useState(prettyPhone(catalog.business.whatsapp));
  const [address, setAddress] = useState(catalog.business.address);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const save = () => {
    const digits = normalizeArgentinePhone(phone);
    if (!digits) {
      setPhoneError("Revisá el número: código de área y número, por ejemplo 11 2345 6789.");
      return;
    }
    setPhoneError(null);
    setBusiness({ whatsapp: `549${digits}`, address: address.trim() || ATELIER.address });
    toast("Datos guardados. El botón de WhatsApp y los mensajes ya usan el nuevo número.");
  };

  return (
    <AdminCard title="Datos del negocio" description="Se usan en el botón de WhatsApp, en los mensajes de coordinación y en el retiro.">
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="block text-[14px]">
          WhatsApp de la florería
          <Input
            className="mt-1"
            inputMode="tel"
            value={phone}
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? "wa-error" : "wa-hint"}
            onChange={(e) => setPhone(e.target.value)}
          />
          {phoneError ? (
            <span id="wa-error" className="mt-1 block text-[13px] text-error">
              {phoneError}
            </span>
          ) : (
            <span id="wa-hint" className="mt-1 block text-[13px] text-gris-texto">
              Ahí llegan las consultas y la coordinación de cada pedido.
            </span>
          )}
        </label>
        <label className="block text-[14px]">
          Dirección para retirar
          <Input className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <p className="text-[13px] text-gris-texto">Horario: {catalog.business.hours}</p>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Guardar datos</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setPhone(prettyPhone(WHATSAPP_NUMBER));
              setAddress(ATELIER.address);
              setPhoneError(null);
              setBusiness({ whatsapp: undefined, address: undefined });
            }}
          >
            Volver a los de fábrica
          </Button>
        </div>
      </form>
    </AdminCard>
  );
}
