# Workwear Konfigurator

Interaktiver Konfigurator für die Platzierung von Logos auf Workwear-Produkten (Jacken, Hosen, Westen, Latzhosen).

## Features

- 🎨 **Drag & Drop Logos** - Logos auf verschiedenen Zonen platzieren
- 🔄 **Rotation** - Logos um 5° drehen (Links/Rechts)
- 🗑️ **Löschen** - Logos aus Zonen entfernen
- 📏 **Resize** - Zonen vergrößern/verkleinern mit Eckbuttons
- 🚫 **Anti-Zonen** - Forbidden Zones verhindern Platzierung in bestimmten Bereichen
- 💾 **Draft-Speicherung** - Aktuelle Konfiguration speichern
- 📸 **Screenshots** - Snapshots der Konfiguration erstellen

## Project-Struktur (nach Refactoring)

### Architektur-Übersicht

```
page.tsx (Orchestrator)
│
├─ Hooks (State Management)
│  ├─ useZoneState()           → Zone Drag/Resize/Rotate
│  ├─ useAssetManagement()     → Asset Upload & Zuordnung
│  └─ useWorkwearPersistence() → LocalStorage & Submission
│
└─ Komponenten
   ├─ KonfiguratorSidebar      → Links: Assets, Controls
   ├─ KonfiguratorPreview      → Rechts: Canvas, Thumbnails
   ├─ ProductSelectionSection  → Produkt-Auswahl
   └─ UploadModal              → File-Upload
```

### Core Dateien

| Datei | Beschreibung |
|-------|-------------|
| [**page.tsx**](page.tsx) | **Orchestrator** - verbindet Hooks & Komponenten (~300 Zeilen) |
| [**types.ts**](types.ts) | TypeScript Typdefinitionen (ZoneRect, Asset, etc.) |
| [**constants.ts**](constants.ts) | Workwear-Daten, Forbidden Zones, UIConstants |
| [**productHelpers.ts**](productHelpers.ts) | Product-bezogene Helper-Funktionen |
| [**submission.ts**](submission.ts) | Canvas-Rendering & Snapshot-Erstellung |
| [**submissionDraft.ts**](submissionDraft.ts) | Draft-Verwaltung in sessionStorage |
| [**workwearState.ts**](workwearState.ts) | Zone-State Normalisierung & Validierung |

### Hooks (Custom React Hooks)

| Hook | Datei | Beschreibung |
|------|-------|-------------|
| **useZoneState** | [hooks/useZoneState.ts](hooks/useZoneState.ts) | Zone Management (Drag, Resize, Select, Rotate) |
| **useAssetManagement** | [hooks/useAssetManagement.ts](hooks/useAssetManagement.ts) | Asset Upload, Zuordnung, Cleanup |
| **useWorkwearPersistence** | [hooks/useWorkwearPersistence.ts](hooks/useWorkwearPersistence.ts) | LocalStorage Persistierung, Snapshots |

### Utility-Module

| Modul | Datei | Funktionen |
|-------|-------|-----------|
| **zoneCalculations** | [utils/zoneCalculations.ts](utils/zoneCalculations.ts) | `clamp()`, `clampZoneWidth()`, `createZone()` |
| **transformations** | [utils/transformations.ts](utils/transformations.ts) | `getArtworkTransform()` |

### Komponenten

| Komponente | Datei | Beschreibung |
|-----------|-------|-------------|
| **KonfiguratorSidebar** | [components/KonfiguratorSidebar.tsx](components/KonfiguratorSidebar.tsx) | Asset-Liste, Zone-Controls, Material-Select |
| **KonfiguratorPreview** | [components/KonfiguratorPreview.tsx](components/KonfiguratorPreview.tsx) | Canvas, Thumbnail-Gallery, Zone-Rendering |
| **WorkwearZone** | [components/WorkwearZone.tsx](components/WorkwearZone.tsx) | Einzelne Zone (Drag, Resize, Logo-Anzeige) |
| **DraggableAssetCard** | [components/DraggableAssetCard.tsx](components/DraggableAssetCard.tsx) | Draggbare Logo-Karten |
| **ProductSelectionSection** | [components/ProductSelectionSection.tsx](components/ProductSelectionSection.tsx) | Produktauswahl (Jacke, Hose, etc.) |
| **UploadModal** | [components/UploadModal.tsx](components/UploadModal.tsx) | Modal zum Logo hochladen |

## Datenstrukturen

### ZoneRect (Zone)
```typescript
{
  id: string;              // Eindeutige ID
  label: string;           // Anzeigename
  x: number;              // Position X (%-Wert)
  y: number;              // Position Y (%-Wert)
  w: number;              // Breite (%-Wert, 7.5-15%)
  h: number;              // Höhe (%-Wert, proportional zu W)
  scale: number;          // Skalierung des Logos
  rotation: number;       // Rotation in Grad
  assetId: string | null; // Referenz zu Logo
  artworkOffset: Point;   // Offsetposition des Logos
}
```

### ZoneDragState
Verfolgt laufende Drag-Operation (Position, Pointer-ID, etc.)

### ZoneResizeState
Verfolgt laufende Resize-Operation (Corner, Start-Dimensionen, etc.)

## Hauptfunktionen

### Drag & Drop
- **In [page.tsx](page.tsx#L560):**
  - `handleZoneDragStart()` - Drag initiieren
  - `handleZoneDragMove()` - Position während Drag
  - `handleZoneDragEnd()` - Drag beenden
  - Prüfung auf Forbidden Zones während dem Bewegen

### Resize (Eckbuttons)
- **In [page.tsx](page.tsx#L629):**
  - `handleZoneResizeStart()` - Resize mit Corner (tl, tr, bl, br)
  - `handleZoneResizeMove()` - Größe anpassen
  - `handleZoneResizeEnd()` - Resize abschließen
  - Constraints: Breite 7.5%-15%, Höhe proportional

### Anti-Zonen (Forbidden Zones)
- **In [constants.ts](constants.ts):**
  - `FORBIDDEN_ZONES` - Array mit Forbidden-Zone-Definitionen pro Produkt
  - `getForbiddenZonesForImage()` - Zonen für ein Produkt abrufen
  - `isZoneOverlappingForbiddenZone()` - Kollisionsprüfung

**Forbidden Zone hinzufügen:**
```typescript
// In constants.ts - FORBIDDEN_ZONES
[
  // Jacket (Index 0)
  [
    { x: 45, y: 32, w: 10, h: 45 }  // z.B. Reißverschluss
  ],
  // Pants (Index 1)
  [],
  // ... weitere Produkte
]
```

### Rotation
- **In [page.tsx](page.tsx#L722):**
  - `rotateZoneById()` - Logo um Grad drehen
  - RotateCcw/RotateCw Buttons in WorkwearZone

### Draft-Speicherung
- **In [submissionDraft.ts](submissionDraft.ts):**
  - `KONFIGURATOR_SUBMISSION_DRAFT_KEY` - localStorage Key
  - Speichert: Aktive Workwear, Zonen, Assets, Print-Material

## Größenlimits

- **Zonenbreite:** 7.5% - 15% des Containers
- **Höhe:** Proportional zur Breite (Aspektratio erhalten)
- **Min/Max in [utils.ts](utils.ts#L8):** `clampZoneWidth()`

## Workwear-Produkte

In [constants.ts](constants.ts):
- Jacke (2 Seiten: vorne, hinten)
- Hose (2 Seiten: vorne, hinten)
- Weste (2 Seiten: vorne, hinten)
- Latzhose (2 Seiten: vorne, hinten)

```typescript
// In constants.ts
WORKWEAR_IMAGES = [
  { index: 0, label: 'Jacke Vorne', src: '...' },
  { index: 1, label: 'Jacke Hinten', src: '...' },
  // ...
]
```

## API-Routen

| Route | Beschreibung |
|-------|-------------|
| `POST /api/contact` | Kontaktformular abmelden |
| `POST /api/konfigurator/submit` | Konfiguration abmelden |

- **In [app/api/contact/route.ts](../api/contact/route.ts)**
- **In [app/api/konfigurator/submit/route.ts](../api/konfigurator/submit/route.ts)**

## LocalStorage Keys

- `konfigurator-workwear-state-v2` - Aktuelle Konfiguration
- `konfigurator-submission-draft` - Draft für Abmeldung

## Häufige Anpassungen

### 1. Neue Forbidden Zone hinzufügen
📍 [constants.ts](constants.ts#L82) - `FORBIDDEN_ZONES` Array

**Beispiel - Anti-Zone für Reißverschluss hinzufügen:**
```typescript
export const FORBIDDEN_ZONES = [
  // Jacke vorne (Index 0)
  [
    { x: 45, y: 32, w: 10, h: 45 } // Reißverschluss Mitte
  ],
  // Jacke hinten (Index 1)
  [],
  // Hose vorne (Index 2)
  [
    { x: 40, y: 10, w: 20, h: 15 } // Hosenlatz
  ],
  // ... weitere Produkte
] as const;
```
- **x, y:** Position in % (von oben-links)
- **w, h:** Breite/Höhe in %
- **Array-Index:** Entspricht Produkt-Index (0=Jacke vorne, 1=Jacke hinten, etc.)

### 2. Größenlimits ändern
📍 [utils.ts](utils.ts#L8) - `clampZoneWidth()`

```typescript
export function clampZoneWidth(width: number) {
  return Number(clamp(width, 7.5, 15).toFixed(1));
  //                        ↑     ↑
  //                      min   max (in %)
}
```

### 3. Neues Workwear-Produkt
📍 [constants.ts](constants.ts#L15) - `WORKWEAR_PRODUCTS` Array

```typescript
export const WORKWEAR_PRODUCTS = [
  {
    id: 'jacke',
    label: 'Jacke',
    shortLabel: 'Jacke',
    folder: 'jacke',
    imageExtension: 'png',
  },
  // Neues Produkt hinzufügen:
  {
    id: 'kapuzenpulli',
    label: 'Kapuzenpulli',
    shortLabel: 'Pulli',
    folder: 'kapuzenpulli',
    imageExtension: 'png',
  },
]
```

Und entsprechende Anti-Zone in `FORBIDDEN_ZONES` hinzufügen!

📍 [constants.ts](constants.ts#L54) - `WORKWEAR_IMAGES` Array (automatisch generiert aus WORKWEAR_PRODUCTS)

### 5. Farbe/Style ändern
📍 [components/WorkwearZone.tsx](components/WorkwearZone.tsx#L75) - Tailwind Classes

**Border Hover-Farbe ändern:**
```typescript
className="absolute -left-1.5 -top-1.5 h-3 w-3 cursor-nwse-resize rounded-full bg-white hover:bg-white/80"
//                                                                                              ↑
//                                                                          In hover:bg-[andere-farbe] ändern
```

---

## 🔄 Refactoring Summary (März 2026)

### Was wurde refaktoriert?

#### ✨ **Vor:** Monolithische page.tsx (1200+ Zeilen)
- Alle Logic in einer Komponente
- Schwer zu lesen und zu testen
- Viele verflochtene Verantwortlichkeiten

#### ✅ **Nach:** Modular mit Custom Hooks (300 Zeilen)
- **useZoneState** - Zone Management
- **useAssetManagement** - Asset Handling
- **useWorkwearPersistence** - State Persistierung
- **KonfiguratorSidebar** - UI Controls (~140 Zeilen)
- **KonfiguratorPreview** - Canvas & Gallery (~150 Zeilen)
- **utils/** - Split in zoneCalculations + transformations

### Verbesserungen

| Metrik | Vorher | Nachher | Verbesserung |
|--------|--------|---------|--------------|
| **page.tsx Größe** | 1200+ | ~300 | -75% |
| **Lesbarkeit** | Schwierig | ⭐⭐⭐⭐⭐ | Deutlich besser |
| **Testbarkeit** | Schwierig | ⭐⭐⭐⭐⭐ | Hooks isoliert testbar |
| **Wartbarkeit** | Schwierig | ⭐⭐⭐⭐⭐ | Klar strukturiert |
| **Dead Code** | Einige | 0 | Cleaner |
| **Kompilierungsfehler** | 0 | 0 | Sauber ✓ |

### Neue Features einfacher hinzufügen
```
Neues Feature
  ↓
Neuen Hook in hooks/ erstellen
  ↓
In page.tsx importieren & aufrufen
  ↓
An Komponente übergeben
  ↓
Fertig! 🎉
```

---

## 📚 Best Practices

### Hook erstellen
- ✅ Hook-Logik ist isoliert
- ✅ `useCallback` für Event Handler
- ✅ `useMemo` für teure Berechnungen
- ✅ Externe Dependencies in dependency array

### Komponente erstellen
- ✅ Nur UI-Logik
- ✅ Props für alle Daten
- ✅ Callbacks für Events
- ✅ Keine direkte State-Mutation

### Dateierweiterungen
- `.ts` - Utility-Funktionen & Types
- `.tsx` - React Komponenten & Hooks
- `.css/.module.css` - Styling
```

**Zone Border-Farbe (Normal):**
```typescript
className="... border-white ..." // Aktuelle Farbe
className="... border-nordwerk-orange ..." // Alternative
```

### 5. Rotation-Winkel anpassen
📍 [page.tsx](page.tsx#L722) - `rotateZoneById()` Parameter ändern

```typescript
function rotateZoneById(zoneId: string, degrees: number) {
  updateZone(zoneId, (zone) => ({
    ...zone,
    rotation: (zone.rotation + degrees + 360) % 360,
  }));
}

// Aufruf in WorkwearZone.tsx (mit -5 / +5°):
onRotate(-5);  // Links drehen
onRotate(5);   // Rechts drehen
// Werte hier ändern für andere Winkel (z.B. -10, 10)
```

### 6. Initial Zone-Größe ändern
📍 [constants.ts](constants.ts#L73) - `INITIAL_ZONE_RECT`

```typescript
export const INITIAL_ZONE_RECT = {
  x: 10,
  y: 10,
  w: 10,    // ← Initiale Breite ändern
  h: 10,    // ← Initiale Höhe ändern
  scale: 1,
  rotation: 0,
  assetId: null,
  artworkOffset: { x: 0, y: 0 },
};
```

### 7. Button-Styling ändern
📍 [components/WorkwearZone.tsx](components/WorkwearZone.tsx#L73) - Button Group

```typescript
<div className="absolute -top-10 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2">
  {/* gap-2 = Abstand zwischen Buttons */}
  {/* -top-10 = Position über der Zone */}
```

## Performance

- Keine 404-Fehler auf fehlende Assets
- Bilder sind optimiert (WEBP, JPG)
- Pointer Events statt Touch für bessere Performance
- Local Storage statt Sessions

## Debugging

**Active Zone:**
- Weiße Border (`border-white`)
- Nordwerk-Orange bei Hover/Select (`border-nordwerk-orange`)

**Forbidden Zones (nur beim Drag):**
- Rote semi-transparente Zonen
- Werden nur während aktiven Zone-Drag angezeigt

## Browser-Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Browser mit Pointer Events

---

💡 **Tipp:** Mit `Cmd/Ctrl + Click` auf die Links oben kannst du direkt zum Code springen!
