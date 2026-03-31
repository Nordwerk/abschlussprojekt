"use client";

import type { Asset, ZoneRect, PrintMaterial } from "../types";
import DraggableAssetCard from "./DraggableAssetCard";
import { INITIAL_ZONE_RECT } from "../constants";

interface KonfiguratorSidebarProps {
  assets: Asset[];
  zones: ZoneRect[];
  selectedZone: ZoneRect | null;
  selectedAsset: Asset | undefined;
  maxZonesForCurrentImage: number;
  previewOnly: boolean;
  isPreparingDraft: boolean;
  draftPreparationError: string;
  draftPreparationSuccess: string;
  printMaterial: PrintMaterial;
  onSelectedZoneChange: (zoneId: string) => void;
  onAssetAssign: (assetId: string) => void;
  onAssetRemove: (assetId: string) => void;
  onUploadModalOpen: () => void;
  onTutorialOpen: () => void;
  onPreviewOnlyToggle: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoneSizeDecrease: () => void;
  onZoneSizeincrease: () => void;
  onZoneSizeChange: (width: number) => void;
  onClearZone: (zoneId: string) => void;
  onPrintMaterialChange: (material: PrintMaterial) => void;
  onPrepareDraft: () => void;
  onBackToSelection: () => void;
}

export function KonfiguratorSidebar({
  assets,
  zones,
  selectedZone,
  selectedAsset,
  maxZonesForCurrentImage,
  previewOnly,
  isPreparingDraft,
  draftPreparationError,
  draftPreparationSuccess,
  printMaterial,
  onSelectedZoneChange,
  onAssetAssign,
  onAssetRemove,
  onUploadModalOpen,
  onTutorialOpen,
  onPreviewOnlyToggle,
  onRotateLeft,
  onRotateRight,
  onZoneSizeDecrease,
  onZoneSizeincrease,
  onZoneSizeChange,
  onClearZone,
  onPrintMaterialChange,
  onPrepareDraft,
  onBackToSelection,
}: KonfiguratorSidebarProps) {
  return (
    <aside className="rounded-3xl border border-white/15 bg-black/45 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Assets</h2>
        <button
          type="button"
          onClick={onTutorialOpen}
          title="Tutorial öffnen"
          className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        >
          💡
        </button>
      </div>
      <p className="mt-1 text-sm text-white/80">
        Logo per Drag and Drop oder Klick einer Zone zuweisen.
      </p>
      <p className="mt-1 text-xs text-white/70">
        Zonen pro Bild: {zones.length} / {maxZonesForCurrentImage}
      </p>

      <button
        type="button"
        onClick={onUploadModalOpen}
        className="mt-4 w-full rounded-md bg-nordwerk-orange px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
      >
        + Bilder hochladen
      </button>

      <div className="mt-4 max-h-105 space-y-3 overflow-auto pr-1">
        {assets.length === 0 ? (
          <div className="rounded-lg border border-white/15 bg-black/30 p-4 text-sm text-white/80">
            Noch keine Bilder hochgeladen.
          </div>
        ) : (
          assets.map((asset) => (
            <DraggableAssetCard
              key={asset.id}
              asset={asset}
              onAssign={() => onAssetAssign(asset.id)}
              onRemove={() => onAssetRemove(asset.id)}
            />
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => onSelectedZoneChange(zone.id)}
            className={`rounded-full px-3 py-2 text-xs transition ${
              selectedZone?.id === zone.id
                ? "bg-nordwerk-orange text-black"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            {zone.label}
          </button>
        ))}
      </div>

      {/* Aktive Zone Controls */}
      <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Aktive Zone
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-white">
              {selectedZone ? selectedZone.label : "-"}
            </p>
          </div>
          {selectedAsset ? (
            <button
              type="button"
              onClick={() => {
                if (selectedZone) {
                  onClearZone(selectedZone.id);
                }
              }}
              className="rounded-md border border-red-300/35 px-3 py-2 text-xs font-medium text-red-200 transition hover:border-red-200/60 hover:text-white"
            >
              Bild Entfernen
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            className="flex-1 rounded-md bg-white/10 py-2 text-xs font-medium text-white transition hover:bg-white/20 disabled:opacity-40"
            onClick={onRotateLeft}
            disabled={!selectedAsset}
          >
            ↺ Links
          </button>
          <button
            type="button"
            className="flex-1 rounded-md bg-white/10 py-2 text-xs font-medium text-white transition hover:bg-white/20 disabled:opacity-40"
            onClick={onRotateRight}
            disabled={!selectedAsset}
          >
            ↻ Rechts
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            className="h-9 w-9 rounded-md bg-white/10 text-white disabled:opacity-40"
            onClick={onZoneSizeDecrease}
            disabled={!selectedZone}
          >
            -
          </button>
          <input
            type="range"
            min={7.5}
            max={15}
            step={0.5}
            value={selectedZone?.w ?? INITIAL_ZONE_RECT.w}
            onChange={(event) => onZoneSizeChange(Number(event.target.value))}
            disabled={!selectedZone}
            className="w-full accent-orange-400 disabled:opacity-40"
          />
          <button
            type="button"
            className="h-9 w-9 rounded-md bg-white/10 text-white disabled:opacity-40"
            onClick={onZoneSizeincrease}
            disabled={!selectedZone}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onPreviewOnlyToggle}
          className="mt-4 w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/15"
        >
          {previewOnly ? "Bearbeitung anzeigen" : "Nur Bild anzeigen"}
        </button>
      </div>

      {/* Druckmaterial */}
      <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Druckmaterial
        </p>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="printMaterial"
              value="druck"
              checked={printMaterial === "druck"}
              onChange={(e) => onPrintMaterialChange(e.target.value as PrintMaterial)}
              className="cursor-pointer"
            />
            <span className="text-sm text-white/85">Druck</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="printMaterial"
              value="strick"
              checked={printMaterial === "strick"}
              onChange={(e) => onPrintMaterialChange(e.target.value as PrintMaterial)}
              className="cursor-pointer"
            />
            <span className="text-sm text-white/85">Strick</span>
          </label>
        </div>
      </div>

      {/* Anfrage Form */}
      <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Anfrage ueber Hauptformular
        </p>
        <p className="mt-2 text-xs text-white/80">
          Die Konfiguration wird gespeichert und im Kontaktformular auf der
          Startseite mitgesendet.
        </p>
        <button
          type="button"
          onClick={onPrepareDraft}
          disabled={isPreparingDraft}
          className="mt-3 w-full rounded-md bg-nordwerk-orange px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPreparingDraft
            ? "Konfiguration wird vorbereitet..."
            : "Zum Kontaktformular"}
        </button>
        {draftPreparationSuccess ? (
          <p className="mt-2 text-xs text-emerald-300">{draftPreparationSuccess}</p>
        ) : null}
        {draftPreparationError ? (
          <p className="mt-2 text-xs text-red-300">{draftPreparationError}</p>
        ) : null}
      </div>

      {/* Zurück zur Produktauswahl */}
      <button
        type="button"
        onClick={onBackToSelection}
        className="mt-6 w-full rounded-md bg-nordwerk-orange px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
      >
        ← Zurück zur Produktauswahl
      </button>
    </aside>
  );
}
