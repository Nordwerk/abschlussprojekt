/* eslint-disable @next/next/no-img-element */

import {
  WORKWEAR_PRODUCTS,
  type WorkwearProductId,
} from "../constants";
import {
  WORKWEAR_FRONTPAGE_ORDER,
  getWorkwearProductPreviewImage,
} from "../productHelpers";

type ProductSelectionSectionProps = {
  onStartConfigurator: (product: WorkwearProductId) => void;
};

export default function ProductSelectionSection({
  onStartConfigurator,
}: ProductSelectionSectionProps) {
  return (
    <>
      <p className="mx-auto mt-3 max-w-2xl text-center text-white/75">
        Bitte Produkt auswaehlen und danach im Konfigurator bearbeiten.
      </p>

      <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-white/15 bg-black/45 p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          {WORKWEAR_FRONTPAGE_ORDER.map((productId) =>
            WORKWEAR_PRODUCTS.find((entry) => entry.id === productId),
          )
            .filter((product): product is (typeof WORKWEAR_PRODUCTS)[number] =>
              Boolean(product),
            )
            .map((product) => {
              const productLabel = product.label;
              const previewImage = getWorkwearProductPreviewImage(product.id);

              return (
                <article
                  key={product.id}
                  className="
                    rounded-2xl border border-white/20 bg-white/10 p-4
                    transition-all duration-200
                    hover:border-white/40 hover:bg-white/[0.12] hover:shadow-xl hover:shadow-black/20
                  "
                >
                  <div className="rounded-xl border border-white/15 bg-black/30 p-3">
                    <div
                      className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-lg bg-white/90"
                      style={{ aspectRatio: "768 / 1320" }}
                    >
                      <img
                        src={previewImage}
                        alt={`${productLabel} Vorschau`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                  <h2 className="mt-4 text-center text-xl font-semibold text-white">
                    {productLabel}
                  </h2>
                  <button
                    type="button"
                    onClick={() => onStartConfigurator(product.id)}
                    className="mt-4 w-full rounded-md bg-nordwerk-orange px-4 py-2 text-sm font-semibold text-black hover:scale-105 hover:text-white transition"
                  >
                    {productLabel} konfigurieren
                  </button>
                </article>
              );
            })}
        </div>
      </section>
    </>
  );
}
