import { useState, useRef, useCallback, useMemo } from "react";
import { PREVIEW_DROP_ID, ZONE_DROP_PREFIX } from "../constants";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Asset, ZoneRect } from "../types";

export function useAssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const urlsRef = useRef<string[]>([]);

  const assetMap = useMemo(
    () => new Map<string, Asset>(assets.map((a) => [a.id, a])),
    [assets]
  );

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const added = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => {
        const src = URL.createObjectURL(file);
        urlsRef.current.push(src);
        return { id: crypto.randomUUID(), name: file.name, src };
      });

    if (added.length > 0) setAssets((prev) => [...added, ...prev]);
  }, []);

  const removeAsset = useCallback((assetId: string) => {
    const assetToRemove = assets.find((asset) => asset.id === assetId);
    if (assetToRemove?.src.startsWith("blob:")) {
      URL.revokeObjectURL(assetToRemove.src);
      urlsRef.current = urlsRef.current.filter((url) => url !== assetToRemove.src);
    }

    setAssets((previous) => previous.filter((asset) => asset.id !== assetId));
  }, [assets]);

  const cleanupAssets = useCallback(() => {
    for (const url of urlsRef.current) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const clearAssetFromZones = useCallback(
    (assetId: string, zones: ZoneRect[], setZones: (zones: ZoneRect[]) => void) => {
      setZones(
        zones.map((zone) =>
          zone.assetId !== assetId
            ? zone
            : {
                ...zone,
                assetId: null,
                rotation: 0,
                artworkOffset: { x: 0, y: 0 },
              }
        )
      );
    },
    []
  );

  const assignAssetToZone = useCallback(
    (
      zoneId: string,
      assetId: string,
      zones: ZoneRect[],
      setZones: (zones: ZoneRect[]) => void,
      setSelectedZoneId: (id: string) => void
    ) => {
      setSelectedZoneId(zoneId);
      setZones(
        zones.map((zone) =>
          zone.id === zoneId
            ? {
                ...zone,
                assetId,
                rotation: 0,
                artworkOffset: { x: 0, y: 0 },
              }
            : zone
        )
      );
    },
    []
  );

  const handleDragEnd = useCallback(
    (
      event: DragEndEvent,
      zones: ZoneRect[],
      selectedZone: ZoneRect | null,
      assignAssetToZoneFn: (zoneId: string, assetId: string) => void
    ) => {
      const over = event.over;
      if (!over) return;

      const activeId = String(event.active.id);
      if (!activeId.startsWith("asset:")) return;

      const overId = String(over.id);
      const assetId = activeId.slice("asset:".length);

      if (overId === PREVIEW_DROP_ID) {
        if (selectedZone) {
          assignAssetToZoneFn(selectedZone.id, assetId);
        }
        return;
      }

      if (!overId.startsWith(ZONE_DROP_PREFIX)) return;

      const zoneId = overId.slice(ZONE_DROP_PREFIX.length);
      if (!zones.some((zone) => zone.id === zoneId)) return;

      assignAssetToZoneFn(zoneId, assetId);
    },
    []
  );

  return {
    assets,
    setAssets,
    assetMap,
    urlsRef,
    handleFiles,
    removeAsset,
    cleanupAssets,
    clearAssetFromZones,
    assignAssetToZone,
    handleDragEnd,
  };
}
