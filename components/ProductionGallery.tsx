'use client';

import { useState, useEffect, useCallback } from 'react';

const cards = [
  {
    title: 'Berufsbekleidung',
    desc: 'Für Handwerk & Industrie im täglichen Einsatz.',
    items: ['Arbeitshosen', 'Arbeitsjacken', 'Westen', 'Shirts & Polos', 'Sweatshirts & Hoodies', 'Bundhosen / Latzhosen', 'Shorts'],
    focus: 'Fokus: Robustheit, Komfort, Passform, Nachbestellbarkeit.',
  },
  {
    title: 'Sicherheit & Ergänzung',
    desc: 'Optionale Erweiterungen für den kompletten Arbeitsschutz.',
    items: ['Sicherheitsschuhe', 'Handschuhe', 'Zubehör (Mützen, Gürtel, Kniepolster)'],
  },
  {
    title: 'Norm- & Schutzbekleidung',
    desc: 'Hier wird es technisch. Entscheidend für Industrie & spezielle Gewerke.',
    items: ['Warnschutz (EN ISO 20471)', 'Multinorm', 'Schweißerschutz', 'Hitzeschutz', 'Chemikalienschutz', 'Antistatisch / ESD', 'Schnittschutz'],
  },
  {
    title: 'Corporate Workwear & Veredelung',
    desc: 'Der Bereich für Unternehmen, die Wert auf Auftritt legen.',
    items: ['Veredelung (Druck / Stick)', 'Farbabstimmung nach Firmen CI', 'Bekleidungskonzepte', 'Musterstellung', 'Nachbestellsystem'],
  },
  {
    title: 'Funktions- & Wetterschutzbekleidung',
    desc: 'Für Außenbereiche und anspruchsvolle Bedingungen.',
    items: ['Softshelljacken', 'Regenbekleidung', 'Winterjacken', '2-in-1 Jacken', 'Thermobekleidung'],
    focus: 'Fokus: Witterungsschutz, Atmungsaktivität, Bewegungsfreiheit.',
  },
];

export default function ProductionGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const count = cards.length;

  const goTo = useCallback((index: number) => {
    setActiveIndex(((index % count) + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - startX);
  };
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 50) prev();
    else if (dragOffset < -50) next();
    setDragOffset(0);
  };

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setDragOffset(e.touches[0].clientX - startX);
  };
  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 50) prev();
    else if (dragOffset < -50) next();
    setDragOffset(0);
  };

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  return (
    <section id="produktion" className="scroll-mt-32 sm:scroll-mt-36 py-10 sm:py-14 md:py-20 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
          Unsere <span className="text-nordwerk-orange">Leistungen</span>
        </h2>

        {/* Flat Slider Carousel */}
        <div
          className="relative mx-auto select-none overflow-hidden border-gray-300"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex items-stretch"
            style={{
              transform: `translateX(calc(-${activeIndex * 100}% + ${isDragging ? dragOffset : 0}px))`,
              transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {cards.map((card, i) => {
              const isActive = i === activeIndex;

              return (
                <div
                  key={card.title}
                  className="w-full flex-shrink-0 px-4 sm:px-6"
                >
                  <div
                    className={`max-w-md mx-auto bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-left flex flex-col border-2 border-gray-400 transition-all duration-500 ${
                      isActive
                        ? ''
                        : 'border-gray-200 shadow-sm scale-95 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight">{card.title}</h3>
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base mb-4 leading-relaxed">{card.desc}</p>
                    <ul className="text-gray-600 space-y-1 list-none text-sm sm:text-base mb-4 flex-1">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-nordwerk-orange mt-0.5 text-xs">●</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {card.focus && (
                      <p className="text-sm font-semibold text-nordwerk-orange mt-auto pt-3 border-t border-orange-100">
                        {card.focus}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-5">
          <button
            onClick={() => { prev(); }}
            className="w-12 h-12 rounded-full bg-nordwerk-orange text-white flex items-center justify-center text-lg font-bold hover:scale-110 hover:bg-orange-500 active:scale-95 transition-all shadow-lg cursor-pointer"
            aria-label="Vorherige Karte"
          >
            ‹
          </button>

          <div className="flex gap-2">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); }}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex
                    ? 'w-7 h-2.5 bg-nordwerk-orange'
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Karte ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => { next(); }}
            className="w-12 h-12 rounded-full bg-nordwerk-orange text-white flex items-center justify-center text-lg font-bold hover:scale-110 hover:bg-orange-500 active:scale-95 transition-all shadow-lg cursor-pointer"
            aria-label="Nächste Karte"
          >
            ›
          </button>
        </div>

        {/* Titel-Anzeige */}
        <p className="mt-2 text-xs text-gray-500">
          {activeIndex + 1} / {count} – <span className="font-semibold text-nordwerk-orange">{cards[activeIndex].title}</span>
        </p>
      </div>
    </section>
  );
}