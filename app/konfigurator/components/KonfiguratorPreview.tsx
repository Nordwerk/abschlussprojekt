/* eslint-disable @next/next/no-img-element */

import { type PointerEvent as ReactPointerEvent } from "react";
import WorkwearZone from "./WorkwearZone";
import type { Asset, ZoneRect, ZoneDragState } from "../types";
import {
  WORKWEAR_IMAGES,
  ZONE_DROP_PREFIX,
  getForbiddenZonesForImage,
} from "../constants";
import { getArtworkTransform } from "../utils";
import {
  getWorkwearProductByIndex,
  getWorkwearProductShortLabel,
  getWorkwearSideLabel,
} from "../productHelpers";

interface KonfiguratorPreviewProps {
  activeWorkwearIndex: number;
  zones: ZoneRect[];
  selectedZone: ZoneRect | null;
  assetMap: Map<string, Asset>;
  previewOnly: boolean;
  isOverPreview: boolean;
  visibleProductImageIndexes: number[];
  zoneDrag: ZoneDragState | null;
  previewFrameRef: React.RefObject<HTMLDivElement | null>;
  thumbnailStripRef: React.RefObject<HTMLDivElement | null>;
  onThumbnailStripScroll?: () => void;
  onSelectZone: (zoneId: string) => void;
  onSelectWorkwearImage: (index: number) => void;
  onZoneDragStart: (event: ReactPointerEvent<HTMLDivElement>, zoneId: string) => void;
  onZoneDragMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onZoneDragEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onZoneResizeStart: (
    event: ReactPointerEvent<HTMLDivElement>,
    zoneId: string,
    corner: "tl" | "tr" | "bl" | "br"
  ) => void;
  onZoneResizeMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onZoneResizeEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onClearZone: (zoneId: string) => void;
  onRotateZone: (zoneId: string, degrees: number) => void;
}

export function KonfiguratorPreview({
  activeWorkwearIndex,
  zones,
  selectedZone,
  assetMap,
  previewOnly,
  isOverPreview,
  visibleProductImageIndexes,
  zoneDrag,
  previewFrameRef,
  thumbnailStripRef,
  onSelectZone,
  onSelectWorkwearImage,
  onZoneDragStart,
  onZoneDragMove,
  onZoneDragEnd,
  onZoneResizeStart,
  onZoneResizeMove,
  onZoneResizeEnd,
  onClearZone,
  onRotateZone,
}: KonfiguratorPreviewProps) {
  const activeProduct = getWorkwearProductByIndex(activeWorkwearIndex);
  const activeWorkwearImage = WORKWEAR_IMAGES[activeWorkwearIndex];

  return (
    <section className="rounded-3xl border border-white/15 bg-black/45 p-4 sm:p-6">
      <div className="mt-5 rounded-4xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(0,0,0,0.18)_48%,rgba(0,0,0,0.4)_100%)] p-4 sm:p-8">
        <div className="mx-auto max-w-155">
          <div className="relative">
            <div
              ref={previewFrameRef}
              className="relative mx-auto w-full overflow-hidden"
              style={{ aspectRatio: "768 / 1320" }}
            >
              <div
                className="absolute inset-0 origin-center transition-transform duration-200"
                style={{ transform: "none" }}
              >
                <img
                  src={activeWorkwearImage}
                  alt={`Workwear ${getWorkwearProductShortLabel(activeProduct)}`}
                  className="pointer-events-none select-none object-contain absolute inset-0 h-full w-full"
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
                              transform: getArtworkTransform(zone),
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
                          isOverPreview && selectedZone?.id === zone.id
                        }
                        zoneDropPrefix={ZONE_DROP_PREFIX}
                        onSelect={onSelectZone}
                        onZoneDragStart={onZoneDragStart}
                        onZoneDragMove={onZoneDragMove}
                        onZoneDragEnd={onZoneDragEnd}
                        onZoneResizeStart={onZoneResizeStart}
                        onZoneResizeMove={onZoneResizeMove}
                        onZoneResizeEnd={onZoneResizeEnd}
                        onClearAsset={onClearZone}
                        onRotate={(degrees) => onRotateZone(zone.id, degrees)}
                      />
                    ))}

                {/* Forbidden Zones - nur beim Bewegen */}
                {zoneDrag &&
                  getForbiddenZonesForImage(activeWorkwearIndex).map(
                    (forbiddenZone, index) => (
                      <div
                        key={`forbidden-${index}`}
                        style={{
                          left: forbiddenZone.x + "%",
                          top: forbiddenZone.y + "%",
                          width: forbiddenZone.w + "%",
                          height: forbiddenZone.h + "%",
                        }}
                        className="absolute bg-red-500/30 border-2 border-red-500 pointer-events-none"
                        title="Antizone - Gesperrter Bereich"
                      />
                    )
                  )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex justify-center">
              <div
                ref={thumbnailStripRef}
                className="flex w-fit gap-2 overflow-x-auto pb-2"
              >
                {visibleProductImageIndexes.map((index) => {
                  const imageUrl = WORKWEAR_IMAGES[index];

                  return (
                    <div key={index} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectWorkwearImage(index)}
                        className={`relative overflow-hidden border-2 transition ${
                          activeWorkwearIndex === index
                            ? "border-nordwerk-orange shadow-lg shadow-nordwerk-orange/40"
                            : "border-white/20 hover:border-white/40"
                        }`}
                        style={{
                          width: "62px",
                          height: "92px",
                          aspectRatio: "768 / 1366",
                        }}
                        aria-label={`${getWorkwearProductShortLabel(activeProduct)} ${getWorkwearSideLabel(imageUrl)}`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${getWorkwearProductShortLabel(activeProduct)} Thumbnail ${getWorkwearSideLabel(imageUrl)}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                      <p className="mt-1 text-center text-[11px] font-medium text-white/80">
                        {getWorkwearSideLabel(imageUrl)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
