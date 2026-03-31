"use client";

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
import ProductSelectionSection from "./components/ProductSelectionSection";
import UploadModal from "./components/UploadModal";
import { TutorialModal } from "./components/TutorialModal";
import {
  DEFAULT_WORKWEAR_INDEX,
  getMaxZonesForImage,
  WORKWEAR_VIEWS_PER_PRODUCT,
  PREVIEW_DROP_ID,
  type WorkwearProductId,
} from "./constants";
import type { PrintMaterial } from "./types";
import {
  getWorkwearProductByIndex,
  getWorkwearProductStartIndex,
} from "./productHelpers";
import {
  createInitialWorkwearZoneState,
  type WorkwearZoneState,
} from "./workwearState";
import { useZoneState, useAssetManagement, useWorkwearPersistence } from "./hooks";
import { KonfiguratorSidebar } from "./components/KonfiguratorSidebar";
import { KonfiguratorPreview } from "./components/KonfiguratorPreview";

export default function Konfigurator() {
  const initialWorkwearZoneState = createInitialWorkwearZoneState(
    DEFAULT_WORKWEAR_INDEX,
  );

  // Zone Management Hook
  const {
    zones,
    setZones,
    selectedZoneId,
    setSelectedZoneId,
    selectedZone,
    zoneDrag,
    zoneCounterRef,
    previewFrameRef,
    updateZoneSize,
    rotateArtwork,
    rotateZoneById,
    clearZone,
    handleZoneDragStart,
    handleZoneDragMove,
    handleZoneDragEnd,
    handleZoneResizeStart,
    handleZoneResizeMove,
    handleZoneResizeEnd,
  } = useZoneState(
    initialWorkwearZoneState.zones,
    initialWorkwearZoneState.selectedZoneId,
  );

  // Asset Management Hook
  const {
    assets,
    assetMap,
    urlsRef,
    handleFiles,
    removeAsset,
    cleanupAssets,
    clearAssetFromZones,
    assignAssetToZone: assignAssetToZoneUtil,
    handleDragEnd,
  } = useAssetManagement();

  // Workwear State Management
  const workwearStateRef = useRef<Record<number, WorkwearZoneState>>({
    [DEFAULT_WORKWEAR_INDEX]: initialWorkwearZoneState,
  });

  const [activeWorkwearIndex, setActiveWorkwearIndex] = useState(
    DEFAULT_WORKWEAR_INDEX,
  );
  const [previewOnly, setPreviewOnly] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [hasStartedConfigurator, setHasStartedConfigurator] = useState(false);
  const [isPreparingDraft, setIsPreparingDraft] = useState(false);
  const [draftPreparationError, setDraftPreparationError] = useState("");
  const [draftPreparationSuccess, setDraftPreparationSuccess] = useState("");
  const [availableImageIndexes, setAvailableImageIndexes] = useState<Set<number> | null>(null);
  const [printMaterial, setPrintMaterial] = useState<PrintMaterial>("druck");
  const thumbnailStripRef = useRef<HTMLDivElement | null>(null);

  // Persistence Hook
  const {
    saveCurrentWorkwearState,
    loadWorkwearState,
    prepareDraftAndSubmit,
  } = useWorkwearPersistence(
    zones,
    selectedZoneId,
    activeWorkwearIndex,
    setZones,
    setSelectedZoneId,
    setActiveWorkwearIndex,
    setAvailableImageIndexes,
    zoneCounterRef,
    workwearStateRef,
  );

  // Sensors setup for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const { isOver: isOverPreview, setNodeRef: setPreviewDropRef } = useDroppable({
    id: PREVIEW_DROP_ID,
  });

  // Computed values
  const activeProduct = getWorkwearProductByIndex(activeWorkwearIndex);
  const productImageIndexes = useMemo(() => {
    const startIndex = getWorkwearProductStartIndex(activeProduct);
    return Array.from(
      { length: WORKWEAR_VIEWS_PER_PRODUCT },
      (_, offset) => startIndex + offset,
    );
  }, [activeProduct]);

  const visibleProductImageIndexes = useMemo(() => {
    if (!availableImageIndexes) return productImageIndexes;
    return productImageIndexes.filter((index) => availableImageIndexes.has(index));
  }, [availableImageIndexes, productImageIndexes]);

  const maxZonesForCurrentImage = getMaxZonesForImage(activeWorkwearIndex);

  // Handle custom zone drag move with forbidden zones validation
  const handleZoneDragMoveWithValidation = (event: ReactPointerEvent<HTMLDivElement>) => {
    handleZoneDragMove(event, activeWorkwearIndex);
  };

  // Assign asset to zone with proper callbacks
  const assignAssetToSelectedZone = (assetId: string) => {
    if (!selectedZone) return;
    assignAssetToZoneUtil(selectedZone.id, assetId, zones, setZones, setSelectedZoneId);
  };

  // Wrap asset removal with chain cleanup
  const removeAssetWithChainCleanup = (assetId: string) => {
    removeAsset(assetId);
    clearAssetFromZones(assetId, zones, setZones);
  };

  // Drag end handler with proper zone assignment
  const handleDragEndWithAssignment = (event: DragEndEvent) => {
    handleDragEnd(event, zones, selectedZone, (zoneId: string, assetId: string) => {
      assignAssetToZoneUtil(zoneId, assetId, zones, setZones, setSelectedZoneId);
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAssets();
    };
  }, [cleanupAssets]);

  // Scroll thumbnail strip on product change
  useEffect(() => {
    thumbnailStripRef.current?.scrollTo({ left: 0 });
  }, [activeProduct]);

  // Revoke blob URLs on cleanup
  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [urlsRef]);

  // Handle switch to unavailable image
  useEffect(() => {
    if (!availableImageIndexes || availableImageIndexes.has(activeWorkwearIndex)) {
      return;
    }

    const switchToIndex = (nextIndex: number) => {
      if (nextIndex === activeWorkwearIndex) return;
      saveCurrentWorkwearState(activeWorkwearIndex);
      loadWorkwearState(nextIndex);
      setActiveWorkwearIndex(nextIndex);
    };

    const fallbackInProduct = productImageIndexes.find((index) =>
      availableImageIndexes.has(index),
    );
    if (typeof fallbackInProduct === "number") {
      switchToIndex(fallbackInProduct);
      return;
    }

    const [firstAvailable] = availableImageIndexes;
    if (typeof firstAvailable === "number") {
      switchToIndex(firstAvailable);
    }
  }, [
    activeWorkwearIndex,
    availableImageIndexes,
    productImageIndexes,
    saveCurrentWorkwearState,
    loadWorkwearState,
  ]);

  // Hash navigation
  useEffect(() => {
    const applyHashSelectionState = () => {
      if (window.location.hash === "#auswahl") {
        setHasStartedConfigurator(false);
      }
    };

    const handleSelectionEvent = () => {
      setHasStartedConfigurator(false);
    };

    applyHashSelectionState();
    window.addEventListener("hashchange", applyHashSelectionState);
    window.addEventListener("konfigurator:show-selection", handleSelectionEvent);

    return () => {
      window.removeEventListener("hashchange", applyHashSelectionState);
      window.removeEventListener("konfigurator:show-selection", handleSelectionEvent);
    };
  }, []);

  // Workwear image selection
  const selectWorkwearImage = (nextIndex: number) => {
    if (nextIndex === activeWorkwearIndex) return;
    if (availableImageIndexes && !availableImageIndexes.has(nextIndex)) return;

    saveCurrentWorkwearState(activeWorkwearIndex);
    loadWorkwearState(nextIndex);
    setActiveWorkwearIndex(nextIndex);
  };

  // Start configurator for product
  const startConfiguratorForProduct = (product: WorkwearProductId) => {
    setHasStartedConfigurator(true);
    const startIndex = getWorkwearProductStartIndex(product);
    const productIndexes = Array.from(
      { length: WORKWEAR_VIEWS_PER_PRODUCT },
      (_, offset) => startIndex + offset,
    );
    const targetIndex = availableImageIndexes
      ? productIndexes.find((index) => availableImageIndexes.has(index)) ?? startIndex
      : startIndex;

    if (availableImageIndexes && !availableImageIndexes.has(targetIndex)) return;
    selectWorkwearImage(targetIndex);
  };

  // Prepare draft and submit
  const prepareDraftAndOpenMainForm = async () => {
    setIsPreparingDraft(true);
    setDraftPreparationError("");
    setDraftPreparationSuccess("");

    try {
      await prepareDraftAndSubmit(assets, printMaterial, activeWorkwearIndex);

      setDraftPreparationSuccess(
        "Konfiguration vorbereitet. Weiterleitung zum Kontaktformular...",
      );
      window.location.href = "/#kontakt";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unbekannter Fehler";
      setDraftPreparationError(message);
    } finally {
      setIsPreparingDraft(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed px-4 pb-16 pt-36 sm:px-6 sm:pt-44">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-center text-3xl text-black sm:text-4xl">
            Die Konfiguration dient als Grundlage für deine Anfrage.
            <br />
            Nach Prüfung erhältst du ein individuelles Angebot.
          </h1>
          {!hasStartedConfigurator ? (
            <ProductSelectionSection
              onStartConfigurator={startConfiguratorForProduct}
            />
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEndWithAssignment}>
              <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <KonfiguratorSidebar
                  assets={assets}
                  zones={zones}
                  selectedZone={selectedZone}
                  selectedAsset={
                    selectedZone?.assetId ? assetMap.get(selectedZone.assetId) : undefined
                  }
                  maxZonesForCurrentImage={maxZonesForCurrentImage}
                  previewOnly={previewOnly}
                  isPreparingDraft={isPreparingDraft}
                  draftPreparationError={draftPreparationError}
                  draftPreparationSuccess={draftPreparationSuccess}
                  printMaterial={printMaterial}
                  onSelectedZoneChange={setSelectedZoneId}
                  onAssetAssign={assignAssetToSelectedZone}
                  onAssetRemove={removeAssetWithChainCleanup}
                  onUploadModalOpen={() => setIsUploadModalOpen(true)}
                  onTutorialOpen={() => setIsTutorialOpen(true)}
                  onPreviewOnlyToggle={() => setPreviewOnly((prev) => !prev)}
                  onRotateLeft={() => rotateArtwork(-5)}
                  onRotateRight={() => rotateArtwork(5)}
                  onZoneSizeDecrease={() =>
                    updateZoneSize((selectedZone?.w ?? 11.3) - 1)
                  }
                  onZoneSizeincrease={() =>
                    updateZoneSize((selectedZone?.w ?? 11.3) + 1)
                  }
                  onZoneSizeChange={updateZoneSize}
                  onClearZone={clearZone}
                  onPrintMaterialChange={setPrintMaterial}
                  onPrepareDraft={prepareDraftAndOpenMainForm}
                  onBackToSelection={() => {
                    saveCurrentWorkwearState(activeWorkwearIndex);
                    setHasStartedConfigurator(false);
                  }}
                />

                <div
                  ref={(node) => {
                    setPreviewDropRef(node);
                  }}
                >
                  <KonfiguratorPreview
                    activeWorkwearIndex={activeWorkwearIndex}
                    zones={zones}
                    selectedZone={selectedZone}
                    assetMap={assetMap}
                    previewOnly={previewOnly}
                    isOverPreview={isOverPreview}
                    visibleProductImageIndexes={visibleProductImageIndexes}
                    zoneDrag={zoneDrag}
                    previewFrameRef={previewFrameRef}
                    thumbnailStripRef={thumbnailStripRef}
                    onSelectZone={setSelectedZoneId}
                    onSelectWorkwearImage={selectWorkwearImage}
                    onZoneDragStart={handleZoneDragStart}
                    onZoneDragMove={handleZoneDragMoveWithValidation}
                    onZoneDragEnd={handleZoneDragEnd}
                    onZoneResizeStart={handleZoneResizeStart}
                    onZoneResizeMove={handleZoneResizeMove}
                    onZoneResizeEnd={handleZoneResizeEnd}
                    onClearZone={clearZone}
                    onRotateZone={rotateZoneById}
                  />
                </div>
              </div>
            </DndContext>
          )}
        </div>
      </main>
      <Footer />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFilesSelected={handleFiles}
      />
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </>
  );
}
