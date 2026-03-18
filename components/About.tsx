import Image from 'next/image';

export default function About() {
    return (
      <section id="ueber-uns" className="scroll-mt-36 sm:scroll-mt-40 py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          
          <div className="text-center md:text-left order-2 md:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Über <span className="text-nordwerk-orange">Nordwerk</span>
            </h2>
  
            <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
              Nordwerk Workwear steht für durchdachte Bekleidungskonzepte für Handwerk und Industrie.
            </p>

            <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
              Keine Standardlösungen, sondern Ausstattung, die exakt zum Einsatzbereich passt.
            </p>

            <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
              Wir kommen selbst aus dem Handwerk und wissen, worauf es ankommt: Bewegungsfreiheit, Strapazierfähigkeit und Alltagstauglichkeit sind bei uns Standard – nicht Zusatz.
            </p>

            <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
              Ob Elektro, SHK, Metallbau oder Produktion – wir stellen die passende Kleidung zusammen und sorgen für einen einheitlichen, professionellen Auftritt.
            </p>

            <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
              Veredelung gehört bei uns dazu. Mit moderner Drucktechnik und langjähriger Erfahrung liefern wir saubere, langlebige Ergebnisse – alles aus einer Hand.
            </p>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Wir beraten direkt im Betrieb, analysieren den Bedarf und entwickeln ein klares, funktionierendes System für Ihre Arbeitskleidung.
            </p>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Nordwerk – Arbeitskleidung mit System.
            </p>
          </div>
  
          <div className="bg-white h-32 sm:h-48 md:h-64 rounded-2xl flex items-center justify-center overflow-hidden order-1 md:order-2 relative flex flex-row gap-4">
            <div className="flex-1 relative h-full">
              <Image
                src="/schweißer.jpg"
                alt="Schweißer"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
            <div className="flex-1 relative h-full">
              <Image
                src="/arbeiter.jpg"
                alt="Arbeiter"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
  
        </div>
      </section>
    );
  }