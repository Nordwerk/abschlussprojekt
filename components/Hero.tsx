import Image from 'next/image';

export default function Hero() {
  return (
    <section
      className="relative h-[55vh] sm:h-[80vh] md:h-[85vh] flex items-start justify-center text-white overflow-hidden"
    >
      <Image
        src="/hero.png"
        alt="Nordwerk Workwear Hintergrund"
        fill
        priority
        className="object-cover scale-[1.0] object-[center_calc(50%+80px)] sm:object-[center_calc(50%+20px)] saturate-[1.4] contrast-[1.1] brightness-[0.95]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/30"></div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl pt-[28vh] sm:pt-[30vh]">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
          Arbeitskleidung mit <span className="text-nordwerk-orange">System</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-200 mb-6 sm:mb-8">
          Konzept · Beratung · Veredelung
        </p>

        {/* Button is hidden in responsive versions */}
        <a
          href="#kontakt"
          className="hidden md:inline-block bg-nordwerk-orange text-black px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:scale-105 hover:text-white transition"
        >
          Jetzt unverbindlich anfragen
        </a>
      </div>
    </section>
  );
}