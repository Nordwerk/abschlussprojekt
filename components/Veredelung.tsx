"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Veredelung() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [placementIndex, setPlacementIndex] = useState<number | null>(null);


  const placementImages = ['/vorne.png', '/Rücken.png', '/Seite.png', '/hemd.png'];


  const goNext = () => {
    if (placementIndex !== null) {
      setPlacementIndex((placementIndex + 1) % placementImages.length);
    }
  };

  const goPrev = () => {
    if (placementIndex !== null) {
      setPlacementIndex((placementIndex - 1 + placementImages.length) % placementImages.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setPlacementIndex(null);
      }
      if (placementIndex !== null) {
        if (e.key === "ArrowRight") goNext();
        if (e.key === "ArrowLeft") goPrev();
      }
    };
    if (lightboxOpen || placementIndex !== null) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, placementIndex]);

  return (
    <section id="veredelung" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            <span className="text-nordwerk-orange">Veredelung</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-sm sm:text-base md:text-lg px-2">
            Arbeitskleidung ist mehr als Schutz – sie ist Teil Ihres Markenauftritts.
            Wir sorgen dafür, dass Ihr Logo professionell, langlebig und sauber umgesetzt wird – auf jeder Textilie.
          </p>
          <p className="text-gray-500 max-w-3xl mx-auto mt-3 sm:mt-4 leading-relaxed text-xs sm:text-sm md:text-base px-2">
            Mit moderner Drucktechnik und über 30 Jahren Erfahrung in der Textilveredelung liefern wir
            Ergebnisse, die dem Arbeitsalltag standhalten. Keine Ablösungen nach wenigen Wäschen.
            Kein Ausbleichen. Keine schiefen Platzierungen.
          </p>
        </div>

        {/* Veredelungsbild */}
        <div className="mb-8 sm:mb-12 flex justify-center px-4 bg-white">
          <Image
            src="/druck.jpg"
            alt="Veredelung – Stick und Textildruck"
            width={400}
            height={400}
            className="w-full max-w-[280px] sm:max-w-sm h-auto rounded-2xl shadow-xl object-cover cursor-pointer transition-transform hover:scale-105"
            onClick={() => setLightboxOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") setLightboxOpen(true); }}
          />
        </div>

        {/* Verfahren */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">

          {/* Textildruck */}
          <div className="bg-gray-200 p-5 sm:p-6 md:p-8 rounded-2xl shadow-xl text-center">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4"></div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">Textildruck</h3>
            <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
              Ideal für Logos, Schriftzüge und mehrfarbige Motive.
              Detailgenau, waschbeständig und auch bei größeren Stückzahlen wirtschaftlich.
            </p>
            <ul className="text-gray-500 space-y-1 sm:space-y-2 list-disc list-inside text-sm sm:text-base text-left mx-auto md:mx-0 max-w-xs md:max-w-none">
              <li>Transferdruck</li>
              <li>DTF-Druck</li>
              <li>Siebdruck (bei größeren Stückzahlen)</li>
            </ul>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-nordwerk-orange">
              Vorteil: Detailtreue, flexibel einsetzbar
            </p>
          </div>

          {/* Stick */}
          <div className="bg-gray-200 p-5 sm:p-6 md:p-8 rounded-2xl shadow-xl text-center">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4"></div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">Stick</h3>
            <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
              Für einen hochwertigen, repräsentativen Auftritt.
              Besonders geeignet für Polos, Jacken, Sweatshirts und Caps.
              Strapazierfähig und langlebig – auch bei intensiver Nutzung.
            </p>
            <ul className="text-gray-500 space-y-1 sm:space-y-2 list-disc list-inside text-sm sm:text-base text-left mx-auto md:mx-0 max-w-xs md:max-w-none">
              <li>Direktstick</li>
              <li>3D-Stick (optional bei Caps etc.)</li>
            </ul>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-nordwerk-orange">
              Vorteil: Hochwertig, langlebig, repräsentativ
            </p>
          </div>
        </div>

        {/* Warum professionelle Veredelung */}
        <div className="bg-gray-200 p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg mb-8 sm:mb-12 md:mb-16">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-center">
            Präzise Umsetzung – abgestimmt auf Material &amp; Einsatz
          </h3>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
            Arbeitskleidung ist kein normales T-Shirt. Funktionsstoffe, Softshell, Multinorm-Gewebe oder
            robuste Mischgewebe stellen hohe Anforderungen an Druck und Stick. Wir prüfen jedes Material
            und wählen das passende Verfahren.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {[
              'Richtige Druckposition',
              'Passende Größe',
              'Gewerkspezifische Platzierung',
              'Waschbeständigkeit',
              'Materialverträglichkeit',
              'Reproduzierbare Qualität',
            ].map((item) => (
              <div key={item} className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-nordwerk-orange font-bold text-base sm:text-lg">✓</span>
                <span className="text-gray-700 text-xs sm:text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platzierungen */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-center">
            Durchdachte <span className="text-nordwerk-orange">Platzierung</span> statt Standardlösung
          </h3>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base px-2">
            Ein Logo wirkt nur dann professionell, wenn es richtig platziert ist.
            Größe, Position und Sichtbarkeit stimmen wir auf das Gewerk und die Textilie ab.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {placementImages.map((img, index) => (
              <div
                key={img}
                className="overflow-hidden rounded-2xl shadow-md cursor-pointer transition-transform hover:scale-105"
                onClick={() => setPlacementIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setPlacementIndex(index); }}
              >
                <Image
                  src={img}
                  alt={`Platzierung ${index + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover scale-[1.15]"
                />
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-center mt-4 sm:mt-6 text-xs sm:text-sm">
            Ziel ist ein einheitliches, klares Erscheinungsbild Ihres Unternehmens.
          </p>
        </div>

        {/* Ablauf */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 sm:mb-8 text-center">
            Strukturierter <span className="text-nordwerk-orange">Ablauf</span>
          </h3>
          <div className="flex flex-col items-center md:flex-row md:items-start md:justify-center gap-6 md:gap-2 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Beratung', desc: 'Bedarfsanalyse' },
              { step: '2', title: 'Empfehlung', desc: 'Platzierung & Größe' },
              { step: '3', title: 'Freigabe', desc: 'Digitalansicht' },
              { step: '4', title: 'Produktion', desc: 'Professionelle Umsetzung' },
              { step: '5', title: 'Nachbestellung', desc: 'Identische Qualität' },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex flex-col md:flex-row items-center gap-2">
                <div className="flex flex-col items-center text-center min-w-[120px]">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-nordwerk-orange text-black font-bold flex items-center justify-center mb-2 text-sm sm:text-base">
                    {item.step}
                  </div>
                  <p className="font-semibold text-xs sm:text-sm">{item.title}</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs">{item.desc}</p>
                </div>
                {i < arr.length - 1 && (
                  <>
                    <span className="hidden md:block text-gray-300 text-2xl mx-1">→</span>
                    <span className="block md:hidden text-gray-300 text-xl">↓</span>
                  </>
                )}
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-center mt-6 sm:mt-8 text-xs sm:text-sm max-w-2xl mx-auto px-2">
            Sie erhalten eine saubere, reproduzierbare Lösung – kein Improvisieren bei jeder Nachbestellung.
          </p>
        </div>

        {/* Zielgruppen */}
        <div className="bg-gray-200 p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">
            Für <span className="text-nordwerk-orange">Handwerk &amp; Industrie</span>
          </h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            {[
              'Handwerksbetriebe',
              'Industrieunternehmen',
              'Bauunternehmen',
              'SHK-Betriebe',
              'Metallverarbeitung',
              'Elektro',
              'Produktion',
              'Rettungsdienste',
              'Kommunen',
            ].map((item) => (
              <span
                key={item}
                className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 max-w-3xl mx-auto mt-6 sm:mt-8 text-center">
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Nordwerk steht für saubere Umsetzung, klare Prozesse und langlebige Ergebnisse.
            </p>
            <p className="font-semibold text-nordwerk-orange leading-relaxed text-sm sm:text-base">
              Ihr Auftritt entscheidet mit über den Eindruck beim Kunden. Wir sorgen dafür, dass er stimmt.
            </p>
          </div>
        </div>

      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <Image
            src="/druck.jpg"
            alt="Veredelung – Stick und Textildruck (vergrößert)"
            width={800}
            height={800}
            className="max-w-[90vw] sm:max-w-[70vw] md:max-w-[60vw] max-h-[70vh] sm:max-h-[60vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-nordwerk-orange text-black font-bold rounded-full shadow-lg hover:bg-orange-400 transition-colors cursor-pointer text-sm sm:text-base"
            onClick={() => setLightboxOpen(false)}
          >
            ← Zurück
          </button>
        </div>
      )}

      {/* Lightbox Overlay for placement images */}
      {placementIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer p-4"
          onClick={() => setPlacementIndex(null)}
        >
          {/* Prev Button */}
          <button
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white text-4xl sm:text-5xl font-bold hover:text-nordwerk-orange transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Vorheriges Bild"
          >
            ‹
          </button>

          {/* Next Button */}
          <button
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white text-4xl sm:text-5xl font-bold hover:text-nordwerk-orange transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Nächstes Bild"
          >
            ›
          </button>

          <div className="overflow-hidden rounded-2xl max-w-[90vw] sm:max-w-[70vw] md:max-w-[60vw] max-h-[70vh] sm:max-h-[60vh]">
            <Image
              src={placementImages[placementIndex]}
              alt={`Platzierung ${placementIndex + 1} (vergrößert)`}
              width={800}
              height={800}
              className="w-full h-full shadow-2xl object-cover scale-[1.1]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Counter */}
          <p className="text-white text-sm sm:text-base mt-3">
            {placementIndex + 1} / {placementImages.length}
          </p>

          <button
            className="mt-3 sm:mt-4 px-5 sm:px-6 py-2.5 sm:py-3 bg-nordwerk-orange text-black font-bold rounded-full shadow-lg hover:bg-orange-400 transition-colors cursor-pointer text-sm sm:text-base"
            onClick={() => setPlacementIndex(null)}
          >
            ← Zurück
          </button>
        </div>
      )}
    </section>
  );
}
