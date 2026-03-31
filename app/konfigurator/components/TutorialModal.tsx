"use client";

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  if (!isOpen) return null;

  return (


    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-linear-to-b from-white/70 to-white/60 shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="sticky top-0 border-b border-white/15 bg-linear-to-r from-nordwerk-orange/10 to-orange-100/5 px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎨</span>
                <h2 className="text-2xl font-bold text-black">Schnelleinstieg</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-black/60 transition hover:bg-black/10 hover:text-black"
                aria-label="Close tutorial"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-8 space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="shrink-0 text-3xl">👕</div>
              <div>
                <h3 className="font-bold text-black text-lg">1. Produkt & Seite wählen</h3>
                <p className="text-black/70 text-sm mt-1">Jacke, Hose, Weste oder Latzhose. Wechsle Seiten über die Thumbnails unten rechts.</p>
              </div>
            </div>

            <div className="h-px bg-black/10" />

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="shrink-0 text-3xl">⬆️</div>
              <div>
                <h3 className="font-bold text-black text-lg">2. Logo hochladen</h3>
                <p className="text-black/70 text-sm mt-1">&quot;+ Bilder hochladen&quot; → PNG, JPG, WebP wählen. Logo erscheint in der Liste links.</p>
              </div>
            </div>

            <div className="h-px bg-black/10" />

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="shrink-0 text-3xl">🖱️</div>
              <div>
                <h3 className="font-bold text-black text-lg">3. Logo auf Produkt platzieren</h3>
                <p className="text-black/70 text-sm mt-1">Drag & Drop: Logo per Maus ziehen. Oder: Zone selecten + auf Logo klicken.</p>
              </div>
            </div>

            <div className="h-px bg-black/10" />

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="shrink-0 text-3xl">🎚️</div>
              <div>
                <h3 className="font-bold text-black text-lg">4. Drehen, Vergrößern, Verschieben</h3>
                <p className="text-black/70 text-sm mt-1">Buttons: ↺/↻ zum Drehen. Schieber: Größe ändern (7.5% - 15%). Im Preview: Zone mit Maus bewegen.</p>
              </div>
            </div>

            <div className="h-px bg-black/10" />

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="shrink-0 text-3xl">✅</div>
              <div>
                <h3 className="font-bold text-black text-lg">5. Druckmaterial wählen & Speichern</h3>
                <p className="text-black/70 text-sm mt-1">Material: Druck oder Strick wählen. &quot;Zum Kontaktformular&quot; klicken → Design gespeichert!</p>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-orange-50/50 border border-orange-200/30 rounded-xl p-4 mt-8">
              <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                <span>💡</span> Wichtige Tipps
              </h4>
              <ul className="text-sm text-black/70 space-y-2">
                <li><strong>Rote Bereiche:</strong> Gesperrte Zonen (z.B. Nähte, Reißverschlüsse)</li>
                <li><strong>&quot;Nur Bild anzeigen&quot;:</strong> Toggle zum Edit-Modus ein-/ausschalten</li>
                <li><strong>Mehrere Seiten:</strong> Alle 4 Seiten separat konfigurieren & speichern</li>
                <li><strong>Selbstgespeichert:</strong> Deine Änderungen speichern automatisch</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-white/15 bg-white/20 px-6 py-4 sm:px-8">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-linear-to-r from-nordwerk-orange to-orange-400 px-4 py-3 font-semibold text-black transition hover:from-nordwerk-orange/90 hover:to-orange-400/90"
            >
              Los geht&apos;s! 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
