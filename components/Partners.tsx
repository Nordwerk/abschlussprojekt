import Image from "next/image";

const partners = [
  { src: "/partner2.jpg", alt: "Partner 2" }, // Moved to the first position
  { src: "/partner1.jpg", alt: "Partner 1" }, // Moved to the second position
  { src: "/partner3.jpg", alt: "Partner 3" },
];

export default function Partners() {
  return (
    <section id="partner" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Unsere <span className="text-nordwerk-orange">Partner</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base md:text-lg px-2">
            Wir arbeiten mit starken Marken und zuverlässigen Partnern zusammen –
            für Qualität, auf die Sie sich verlassen können.
          </p>
        </div>

        {/* Partner Logos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex items-center justify-center transition-transform hover:scale-105"
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                width={250}
                height={150}
                className="object-contain max-h-[100px] sm:max-h-[120px] w-auto rounded-xl"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
