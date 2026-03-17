"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import DraggableAssetCard from "./components/DraggableAssetCard";
import WorkwearZone from "./components/WorkwearZone";
import {
  DEFAULT_WORKWEAR_INDEX,
  WORKWEAR_IMAGES,
  INITIAL_ZONE_RECT,
  PREVIEW_DROP_ID,
  ZONE_DROP_PREFIX,
} from "./constants";
import type {
  Asset,
  ArtworkDragState,
  PanDragState,
  ZoneDragState,
  ZoneRect,
} from "./types";
import {
  clamp,
  clampScale,
  clampZoneWidth,
  createZone,
  maxPanForZoom,
} from "./utils";

export default function Konfigurator() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [zones, setZones] = useState<ZoneRect[]>([createZone(1)]);
  const [selectedZoneId, setSelectedZoneId] = useState("zone-1");
  const [previewOnly, setPreviewOnly] = useState(false);
  const [activeWorkwearIndex, setActiveWorkwearIndex] = useState(
    DEFAULT_WORKWEAR_INDEX,
  );
  const [viewZoom, setViewZoom] = useState(1);
  const [viewPan, setViewPan] = useState({ x: 0, y: 0 });
  const [viewPanDrag, setViewPanDrag] = useState<PanDragState | null>(null);
  const [zoneDrag, setZoneDrag] = useState<ZoneDragState | null>(null);
  const [artworkDrag, setArtworkDrag] = useState<ArtworkDragState | null>(null);

  const zoneCounterRef = useRef(2);
  const urlsRef = useRef<string[]>([]);
  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const zoneBoxRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const { isOver: isOverPreview, setNodeRef: setPreviewDropRef } = useDroppable(
    {
      id: PREVIEW_DROP_ID,
    },
  );

  const assetMap = useMemo(
    () => new Map<string, Asset>(assets.map((a) => [a.id, a])),
    [assets],
  );

  const selectedZone =
    zones.find((zone) => zone.id === selectedZoneId) ?? zones[0] ?? null;
  const selectedAsset = selectedZone?.assetId
    ? assetMap.get(selectedZone.assetId)
    : undefined;
  const activeWorkwearImage = WORKWEAR_IMAGES[activeWorkwearIndex];

  useEffect(() => {
    const urls = urlsRef.current;

    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  function updateZone(zoneId: string, updater: (zone: ZoneRect) => ZoneRect) {
    setZones((previous) =>
      previous.map((zone) => (zone.id === zoneId ? updater(zone) : zone)),
    );
  }

  function updateSelectedZone(updater: (zone: ZoneRect) => ZoneRect) {
    if (!selectedZone) return;
    updateZone(selectedZone.id, updater);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const added = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => {
        const src = URL.createObjectURL(file);
        urlsRef.current.push(src);
        return { id: crypto.randomUUID(), name: file.name, src };
      });

    if (added.length > 0) setAssets((prev) => [...added, ...prev]);
  }

  function handleDragEnd(event: DragEndEvent) {
    const over = event.over;
    if (!over) return;

    const activeId = String(event.active.id);
    if (!activeId.startsWith("asset:")) return;

    const overId = String(over.id);
    const assetId = activeId.slice("asset:".length);

    if (overId === PREVIEW_DROP_ID) {
      if (selectedZone) {
        assignAssetToZone(selectedZone.id, assetId);
      }
      return;
    }

    if (!overId.startsWith(ZONE_DROP_PREFIX)) return;

    const zoneId = overId.slice(ZONE_DROP_PREFIX.length);
    if (!zones.some((zone) => zone.id === zoneId)) return;

    assignAssetToZone(zoneId, assetId);
  }

  function addZone() {
    const nextIndex = zoneCounterRef.current;
    zoneCounterRef.current += 1;

    const nextZone = createZone(nextIndex);
    setZones((previous) => [...previous, nextZone]);
    setSelectedZoneId(nextZone.id);
  }

  function assignAssetToSelectedZone(assetId: string) {
    if (!selectedZone) return;
    assignAssetToZone(selectedZone.id, assetId);
  }

  function assignAssetToZone(zoneId: string, assetId: string) {
    setSelectedZoneId(zoneId);
    updateZone(zoneId, (zone) => ({
      ...zone,
      assetId,
      rotation: 0,
      artworkOffset: { x: 0, y: 0 },
    }));
  }

  function updateScale(nextScale: number) {
    updateSelectedZone((zone) => ({ ...zone, scale: clampScale(nextScale) }));
  }

  function rotateArtwork(degrees: number) {
    updateSelectedZone((zone) => ({
      ...zone,
      rotation: (zone.rotation + degrees + 360) % 360,
    }));
  }

  function updateZoneSize(nextWidth: number) {
    updateSelectedZone((zone) => {
      const width = clampZoneWidth(nextWidth);
      const height = Number((width * (zone.h / zone.w)).toFixed(1));

      return {
        ...zone,
        w: width,
        h: height,
        x: clamp(zone.x, 0, 100 - width),
        y: clamp(zone.y, 0, 100 - height),
      };
    });
  }

  useEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const zoomStep = event.shiftKey ? 0.2 : 0.1;
      const zoomDelta = event.deltaY < 0 ? zoomStep : -zoomStep;

      setViewZoom((previousZoom) => {
        const zoom = Number(clamp(previousZoom + zoomDelta, 1, 2.5).toFixed(1));
        const maxPan = maxPanForZoom(zoom);

        setViewPan((previousPan) => ({
          x: Number(clamp(previousPan.x, -maxPan, maxPan).toFixed(1)),
          y: Number(clamp(previousPan.y, -maxPan, maxPan).toFixed(1)),
        }));

        return zoom;
      });
    };

    frame.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      frame.removeEventListener("wheel", handleWheel);
    };
  }, []);

  function handleViewPanStart(event: ReactPointerEvent<HTMLDivElement>) {
    if (viewZoom <= 1 || event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest("button, input, label, textarea, select, a")) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    setViewPanDrag({
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startPanX: viewPan.x,
      startPanY: viewPan.y,
    });
  }

  function handleViewPanMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!viewPanDrag || viewPanDrag.pointerId !== event.pointerId) return;

    const frame = previewFrameRef.current;
    if (!frame) return;

    const bounds = frame.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;

    const deltaXPct =
      ((event.clientX - viewPanDrag.startPointerX) / bounds.width) * 100;
    const deltaYPct =
      ((event.clientY - viewPanDrag.startPointerY) / bounds.height) * 100;
    const maxPan = maxPanForZoom(viewZoom);

    setViewPan({
      x: Number(
        clamp(viewPanDrag.startPanX + deltaXPct, -maxPan, maxPan).toFixed(1),
      ),
      y: Number(
        clamp(viewPanDrag.startPanY + deltaYPct, -maxPan, maxPan).toFixed(1),
      ),
    });
  }

  function handleViewPanEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (!viewPanDrag || viewPanDrag.pointerId !== event.pointerId) return;

    event.currentTarget.releasePointerCapture(event.pointerId);
    setViewPanDrag(null);
  }

  function resetView() {
    setViewZoom(1);
    setViewPan({ x: 0, y: 0 });
  }

  function changeWorkwearImage(direction: -1 | 1) {
    setActiveWorkwearIndex((prev) => {
      const next =
        (prev + direction + WORKWEAR_IMAGES.length) % WORKWEAR_IMAGES.length;
      return next;
    });
    resetView();
  }

  function clearZone(zoneId: string) {
    updateZone(zoneId, (zone) => ({
      ...zone,
      assetId: null,
      rotation: 0,
      artworkOffset: { x: 0, y: 0 },
    }));
  }

  function deleteZone(zoneId: string) {
    if (zones.length <= 1) return;

    const remaining = zones.filter((zone) => zone.id !== zoneId);
    setZones(remaining);

    if (selectedZoneId === zoneId) setSelectedZoneId(remaining[0].id);
    if (zoneDrag?.zoneId === zoneId) setZoneDrag(null);
    if (artworkDrag?.zoneId === zoneId) setArtworkDrag(null);

    delete zoneBoxRefs.current[zoneId];
  }

  function handleZoneDragStart(
    event: ReactPointerEvent<HTMLButtonElement>,
    zoneId: string,
  ) {
    const zone = zones.find((entry) => entry.id === zoneId);
    if (!zone) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedZoneId(zoneId);

    setZoneDrag({
      zoneId,
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startZoneX: zone.x,
      startZoneY: zone.y,
    });
  }

  function handleZoneDragMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!zoneDrag || zoneDrag.pointerId !== event.pointerId) return;

    const frame = previewFrameRef.current;
    if (!frame) return;

    const bounds = frame.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;

    const deltaXPct =
      ((event.clientX - zoneDrag.startPointerX) / bounds.width) * 100;
    const deltaYPct =
      ((event.clientY - zoneDrag.startPointerY) / bounds.height) * 100;

    updateZone(zoneDrag.zoneId, (zone) => {
      const maxX = 100 - zone.w;
      const maxY = 100 - zone.h;

      return {
        ...zone,
        x: clamp(zoneDrag.startZoneX + deltaXPct, 0, maxX),
        y: clamp(zoneDrag.startZoneY + deltaYPct, 0, maxY),
      };
    });
  }

  function handleZoneDragEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!zoneDrag || zoneDrag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setZoneDrag(null);
  }

  function handleArtworkDragStart(
    event: ReactPointerEvent<HTMLButtonElement>,
    zoneId: string,
  ) {
    const zone = zones.find((entry) => entry.id === zoneId);
    if (!zone || !zone.assetId) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedZoneId(zoneId);

    setArtworkDrag({
      zoneId,
      pointerId: event.pointerId,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startOffsetX: zone.artworkOffset.x,
      startOffsetY: zone.artworkOffset.y,
    });
  }

  function handleArtworkDragMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!artworkDrag || artworkDrag.pointerId !== event.pointerId) return;

    const zoneBounds =
      zoneBoxRefs.current[artworkDrag.zoneId]?.getBoundingClientRect();
    if (!zoneBounds) return;

    const maxX = zoneBounds.width * 0.45;
    const maxY = zoneBounds.height * 0.45;

    const nextX = clamp(
      artworkDrag.startOffsetX + (event.clientX - artworkDrag.startPointerX),
      -maxX,
      maxX,
    );
    const nextY = clamp(
      artworkDrag.startOffsetY + (event.clientY - artworkDrag.startPointerY),
      -maxY,
      maxY,
    );

    updateZone(artworkDrag.zoneId, (zone) => ({
      ...zone,
      artworkOffset: { x: nextX, y: nextY },
    }));
  }

  function handleArtworkDragEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!artworkDrag || artworkDrag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setArtworkDrag(null);
  }

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed px-4 pb-16 pt-36 sm:px-6 sm:pt-44"
        style={{ backgroundImage: "url('/hintergrund.jpg')" }}
      >
        <div className="mx-auto max-w-7xl">
          <h1 className="text-center text-3xl font-bold text-white sm:text-4xl">
            Workwear Konfigurator Demo
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-white/75">
            Logos hochladen, direkt auf das Kleidungsstueck ziehen und die
            Groesse je Zone anpassen.
          </p>

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <aside className="rounded-3xl border border-white/15 bg-black/45 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Assets</h2>
                  <button
                    type="button"
                    onClick={addZone}
                    className="rounded-md bg-nordwerk-orange px-3 py-2 text-xs font-semibold text-black transition hover:opacity-90"
                  >
                    Neue Zone
                  </button>
                </div>
                <p className="mt-1 text-sm text-white/65">
                  Bei Bedarf neue Zone erstellen und dann ein Logo per Drag and
                  Drop oder Klick zuweisen.
                </p>

                <label className="mt-4 block">
                  <span className="sr-only">Bilder hochladen</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      handleFiles(event.target.files);
                      event.currentTarget.value = "";
                    }}
                    className="block w-full text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-nordwerk-orange file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:opacity-90"
                  />
                </label>

                <div className="mt-4 max-h-105 space-y-3 overflow-auto pr-1">
                  {assets.length === 0 ? (
                    <div className="rounded-lg border border-white/15 bg-black/30 p-4 text-sm text-white/60">
                      Noch keine Bilder hochgeladen.
                    </div>
                  ) : (
                    assets.map((asset) => (
                      <DraggableAssetCard
                        key={asset.id}
                        asset={asset}
                        onAssign={assignAssetToSelectedZone}
                      />
                    ))
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {zones.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`rounded-full px-3 py-2 text-xs transition ${selectedZone?.id === zone.id ? "bg-nordwerk-orange text-black" : "bg-white/10 text-white hover:bg-white/15"}`}
                    >
                      {zone.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
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
                            clearZone(selectedZone.id);
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
                      onClick={() => rotateArtwork(-5)}
                      disabled={!selectedAsset}
                    >
                      ↺ Links
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-md bg-white/10 py-2 text-xs font-medium text-white transition hover:bg-white/20 disabled:opacity-40"
                      onClick={() => rotateArtwork(5)}
                      disabled={!selectedAsset}
                    >
                      ↻ Rechts
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      className="h-9 w-9 rounded-md bg-white/10 text-white disabled:opacity-40"
                      onClick={() =>
                        updateScale((selectedZone?.scale ?? 1) - 0.1)
                      }
                      disabled={!selectedAsset}
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={0.4}
                      max={2.4}
                      step={0.1}
                      value={selectedZone?.scale ?? 1}
                      onChange={(event) =>
                        updateScale(Number(event.target.value))
                      }
                      disabled={!selectedAsset}
                      className="w-full accent-orange-400 disabled:opacity-40"
                    />
                    <button
                      type="button"
                      className="h-9 w-9 rounded-md bg-white/10 text-white disabled:opacity-40"
                      onClick={() =>
                        updateScale((selectedZone?.scale ?? 1) + 0.1)
                      }
                      disabled={!selectedAsset}
                    >
                      +
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      className="h-9 w-9 rounded-md bg-white/10 text-white disabled:opacity-40"
                      onClick={() =>
                        updateZoneSize(
                          (selectedZone?.w ?? INITIAL_ZONE_RECT.w) - 1,
                        )
                      }
                      disabled={!selectedZone}
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={8}
                      max={45}
                      step={0.5}
                      value={selectedZone?.w ?? INITIAL_ZONE_RECT.w}
                      onChange={(event) =>
                        updateZoneSize(Number(event.target.value))
                      }
                      disabled={!selectedZone}
                      className="w-full accent-orange-400 disabled:opacity-40"
                    />
                    <button
                      type="button"
                      className="h-9 w-9 rounded-md bg-white/10 text-white disabled:opacity-40"
                      onClick={() =>
                        updateZoneSize(
                          (selectedZone?.w ?? INITIAL_ZONE_RECT.w) + 1,
                        )
                      }
                      disabled={!selectedZone}
                    >
                      +
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-white/50">
                    Skalierung: {(selectedZone?.scale ?? 1).toFixed(1)}x
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Zonengroesse:{" "}
                    {(selectedZone?.w ?? INITIAL_ZONE_RECT.w).toFixed(1)}%
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Kleidungszoom: {viewZoom.toFixed(1)}x
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Produktbild: {activeWorkwearIndex + 1} /{" "}
                    {WORKWEAR_IMAGES.length}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Zoom: Mausrad ueber der Vorschau (Shift = groessere
                    Schritte)
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Ansicht (X/Y): {viewPan.x.toFixed(1)} /{" "}
                    {viewPan.y.toFixed(1)}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Ansicht bewegen: Linksklick gedrueckt halten und ziehen.
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    Zone verschieben: Griff ziehen. Logo verschieben: Logo in
                    der jeweiligen Zone ziehen.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedZone) {
                        deleteZone(selectedZone.id);
                      }
                    }}
                    disabled={!selectedZone || zones.length <= 1}
                    className="mt-3 w-full rounded-md border border-red-300/35 bg-red-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-red-100 transition hover:bg-red-300/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Aktive Zone loeschen
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewOnly((previous) => !previous)}
                    className="mt-4 w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/15"
                  >
                    {previewOnly ? "Bearbeitung anzeigen" : "Nur Bild anzeigen"}
                  </button>

                  <button
                    type="button"
                    onClick={resetView}
                    className="mt-3 w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/15"
                  >
                    Ansicht zentrieren
                  </button>
                </div>
              </aside>

              <section className="rounded-3xl border border-white/15 bg-black/45 p-4 sm:p-6">
                <div className="mt-5 rounded-4xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(0,0,0,0.18)_48%,rgba(0,0,0,0.4)_100%)] p-4 sm:p-8">
                  <div className="mx-auto max-w-155">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => changeWorkwearImage(-1)}
                        aria-label="Vorheriges Produktbild"
                        className="absolute left-1 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/35 bg-black/55 px-3 py-2 text-lg font-semibold text-white transition hover:bg-black/70 sm:left-2"
                      >
                        {"<"}
                      </button>

                      <button
                        type="button"
                        onClick={() => changeWorkwearImage(1)}
                        aria-label="Naechstes Produktbild"
                        className="absolute right-1 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/35 bg-black/55 px-3 py-2 text-lg font-semibold text-white transition hover:bg-black/70 sm:right-2"
                      >
                        {">"}
                      </button>

                      <div
                        ref={(node) => {
                          previewFrameRef.current = node;
                          setPreviewDropRef(node);
                        }}
                        className={`relative mx-auto w-full overflow-hidden ${viewZoom > 1 ? (viewPanDrag ? "cursor-grabbing" : "cursor-grab") : ""}`}
                        style={{ aspectRatio: "768 / 1366" }}
                        onPointerDown={handleViewPanStart}
                        onPointerMove={handleViewPanMove}
                        onPointerUp={handleViewPanEnd}
                        onPointerCancel={handleViewPanEnd}
                      >
                        <div
                          className="absolute inset-0 origin-center transition-transform duration-200"
                          style={{
                            transform: `translate(${viewPan.x}%, ${viewPan.y}%) scale(${viewZoom})`,
                          }}
                        >
                          <Image
                            src={activeWorkwearImage}
                            alt="Workwear Shirt"
                            fill
                            priority
                            sizes="(max-width: 1280px) 100vw, 620px"
                            className="pointer-events-none select-none object-contain"
                          />

                          {previewOnly
                            ? zones.map((zone) => {
                                const zoneAsset = zone.assetId
                                  ? assetMap.get(zone.assetId)
                                  : undefined;
                                if (!zoneAsset) return null;

                                return (
                                  <div
                                    key={zone.id}
                                    style={{
                                      left: zone.x + "%",
                                      top: zone.y + "%",
                                      width: zone.w + "%",
                                      height: zone.h + "%",
                                    }}
                                    className="absolute overflow-hidden"
                                  >
                                    <img
                                      src={zoneAsset.src}
                                      alt={zoneAsset.name}
                                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
                                      style={{
                                        transform: `translate(${zone.artworkOffset.x}px, ${zone.artworkOffset.y}px) scale(${zone.scale})`,
                                        transformOrigin: "center",
                                      }}
                                    />
                                  </div>
                                );
                              })
                            : zones.map((zone) => (
                                <WorkwearZone
                                  key={zone.id}
                                  zone={zone}
                                  asset={
                                    zone.assetId
                                      ? assetMap.get(zone.assetId)
                                      : undefined
                                  }
                                  isSelected={selectedZone?.id === zone.id}
                                  previewIsOver={
                                    isOverPreview &&
                                    selectedZone?.id === zone.id
                                  }
                                  zoneDropPrefix={ZONE_DROP_PREFIX}
                                  onSelect={setSelectedZoneId}
                                  onRegisterNode={(zoneId, node) => {
                                    zoneBoxRefs.current[zoneId] = node;
                                  }}
                                  onZoneDragStart={handleZoneDragStart}
                                  onZoneDragMove={handleZoneDragMove}
                                  onZoneDragEnd={handleZoneDragEnd}
                                  onArtworkDragStart={handleArtworkDragStart}
                                  onArtworkDragMove={handleArtworkDragMove}
                                  onArtworkDragEnd={handleArtworkDragEnd}
                                />
                              ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </DndContext>
        </div>
      </main>
      <Footer />
    </>
  );
}
