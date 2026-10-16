import { Button } from "@/components/ui/button";
import { BouquetPhoto } from "@/components/bouquet/BouquetPhoto";
import type { BouquetPreviewProps } from "@/components/bouquet/BouquetPreview";
import { PitchNote } from "@/components/pitch/PitchNote";
import { Stars } from "@/components/common/Section";
import { useSectionNav } from "@/hooks/useSectionNav";

const HERO_BOUQUET: BouquetPreviewProps = {
  palette: "jardin",
  flowers: ["peonia", "rosa", "ranunculo"],
  size: "abundante",
  wrap: "lino-rubor",
  ribbon: "saten-marfil",
};

export function Hero() {
  const goTo = useSectionNav();
  return (
    <section aria-labelledby="hero-titulo" className="relative overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-[340px] w-[340px] rounded-full bg-lavanda opacity-55 blur-[40px] sm:h-[460px] sm:w-[460px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-[320px] w-[320px] rounded-full bg-salvia opacity-55 blur-[40px] sm:h-[420px] sm:w-[420px] lg:right-[8%]" />

      <div className="container relative grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="max-w-[600px]">
          <PitchNote n={2} className="mb-8" />
          <p className="kicker">Hecho a mano, cada mañana</p>
          <h1 id="hero-titulo" className="mt-5 text-balance font-serif text-hero font-normal">
            Un ramo pensado <em>solo para ella</em>
          </h1>
          <p className="lead mt-6 max-w-[520px] text-pretty">
            Elegí las flores, la paleta, el papel y escribí la tarjeta. Mirá cómo queda antes de pedirlo y recibí una foto
            real antes de que salga.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => goTo("crear")}>Diseñar mi ramo</Button>
            <Button variant="secondary" onClick={() => goTo("coleccion")}>
              Ver la colección
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <span className="flex" aria-hidden="true">
              {["bg-rubor", "bg-salvia", "bg-lavanda", "bg-manteca"].map((c, i) => (
                <span key={c} className={`h-9 w-9 rounded-full border-2 border-marfil ${c} ${i ? "-ml-3" : ""}`} />
              ))}
            </span>
            <p className="text-[14px] leading-snug text-gris-texto">
              <Stars className="mb-1 flex" />
              <span className="text-tinta">4,9 de 5</span> en reseñas de clientes
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[460px] lg:max-w-[500px]">
          <BouquetPhoto
            slug="hero"
            priority
            fallback={HERO_BOUQUET}
            className="aspect-[4/5] w-full border border-papel/70 shadow-lift [border-radius:220px_220px_24px_24px]"
          />
        </div>
      </div>
    </section>
  );
}
