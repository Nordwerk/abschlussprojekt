import { useState, useRef, useCallback, type PointerEvent as ReactPointerEvent } from "react";
import { clamp, clampZoneWidth } from "../utils";
import { isZoneOverlappingForbiddenZone } from "../constants";
import type { ZoneRect, ZoneDragState, ZoneResizeState } from "../types";

export function useZoneState(initialZones: ZoneRect[], initialSelectedZoneId: string) {
  const [zones, setZones] = useState<ZoneRect[]>(initialZones);
  const [selectedZoneId, setSelectedZoneId] = useState(initialSelectedZoneId);
  const [zoneDrag, setZoneDrag] = useState<ZoneDragState | null>(null);
  const [zoneResize, setZoneResize] = useState<ZoneResizeState | null>(null);
  const zoneCounterRef = useRef(1);
  const previewFrameRef = useRef<HTMLDivElement | null>(null);

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? zones[0] ?? null;

  const updateZone = useCallback(
    (zoneId: string, updater: (zone: ZoneRect) => ZoneRect) => {
      setZones((previous) =>
        previous.map((zone) => (zone.id === zoneId ? updater(zone) : zone))
      );
    },
    []
  );

  const updateSelectedZone = useCallback(
    (updater: (zone: ZoneRect) => ZoneRect) => {
      if (!selectedZone) return;
      updateZone(selectedZone.id, updater);
    },
    [selectedZone, updateZone]
  );

  const clearZone = useCallback(
    (zoneId: string) => {
      updateZone(zoneId, (zone) => ({
        ...zone,
        assetId: null,
        rotation: 0,
        artworkOffset: { x: 0, y: 0 },
      }));
    },
    [updateZone]
  );

  const rotateArtwork = useCallback(
    (degrees: number) => {
      updateSelectedZone((zone) => ({
        ...zone,
        rotation: (zone.rotation + degrees + 360) % 360,
      }));
    },
    [updateSelectedZone]
  );

  const updateZoneSize = useCallback(
    (nextWidth: number) => {
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
    },
    [updateSelectedZone]
  );

  const rotateZoneById = useCallback(
    (zoneId: string, degrees: number) => {
      updateZone(zoneId, (zone) => ({
        ...zone,
        rotation: (zone.rotation + degrees + 360) % 360,
      }));
    },
    [updateZone]
  );

  const handleZoneDragStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, zoneId: string) => {
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
    },
    [zones]
  );

  const handleZoneDragMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, activeWorkwearIndex: number) => {
      if (!zoneDrag || zoneDrag.pointerId !== event.pointerId) return;

      const frame = previewFrameRef.current;
      if (!frame) return;

      const bounds = frame.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const deltaXPct = ((event.clientX - zoneDrag.startPointerX) / bounds.width) * 100;
      const deltaYPct = ((event.clientY - zoneDrag.startPointerY) / bounds.height) * 100;

      updateZone(zoneDrag.zoneId, (zone) => {
        const maxX = 100 - zone.w;
        const maxY = 100 - zone.h;

        const newX = clamp(zoneDrag.startZoneX + deltaXPct, 0, maxX);
        const newY = clamp(zoneDrag.startZoneY + deltaYPct, 0, maxY);

        if (isZoneOverlappingForbiddenZone(newX, newY, zone.w, zone.h, activeWorkwearIndex)) {
          return zone;
        }

        return {
          ...zone,
          x: newX,
          y: newY,
        };
      });
    },
    [zoneDrag, updateZone]
  );

  const handleZoneDragEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!zoneDrag || zoneDrag.pointerId !== event.pointerId) return;
      event.currentTarget.releasePointerCapture(event.pointerId);
      setZoneDrag(null);
    },
    [zoneDrag]
  );

  const handleZoneResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, zoneId: string, corner: 'tl' | 'tr' | 'bl' | 'br') => {
      const zone = zones.find((entry) => entry.id === zoneId);
      if (!zone) return;

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      setSelectedZoneId(zoneId);

      setZoneResize({
        zoneId,
        pointerId: event.pointerId,
        corner,
        startPointerX: event.clientX,
        startPointerY: event.clientY,
        startZoneX: zone.x,
        startZoneY: zone.y,
        startZoneW: zone.w,
        startZoneH: zone.h,
      });
    },
    [zones]
  );

  const handleZoneResizeMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!zoneResize || zoneResize.pointerId !== event.pointerId) return;

      const frame = previewFrameRef.current;
      if (!frame) return;

      const bounds = frame.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const deltaXPct = ((event.clientX - zoneResize.startPointerX) / bounds.width) * 100;
      const deltaYPct = ((event.clientY - zoneResize.startPointerY) / bounds.height) * 100;

      updateZone(zoneResize.zoneId, (zone) => {
        let newX = zoneResize.startZoneX;
        let newY = zoneResize.startZoneY;
        let newW = zoneResize.startZoneW;
        let newH = zoneResize.startZoneH;

        if (zoneResize.corner === 'tl') {
          newX = zoneResize.startZoneX + deltaXPct;
          newY = zoneResize.startZoneY + deltaYPct;
          newW = zoneResize.startZoneW - deltaXPct;
          newH = zoneResize.startZoneH - deltaYPct;
        } else if (zoneResize.corner === 'tr') {
          newY = zoneResize.startZoneY + deltaYPct;
          newW = zoneResize.startZoneW + deltaXPct;
          newH = zoneResize.startZoneH - deltaYPct;
        } else if (zoneResize.corner === 'bl') {
          newX = zoneResize.startZoneX + deltaXPct;
          newW = zoneResize.startZoneW - deltaXPct;
          newH = zoneResize.startZoneH + deltaYPct;
        } else if (zoneResize.corner === 'br') {
          newW = zoneResize.startZoneW + deltaXPct;
          newH = zoneResize.startZoneH + deltaYPct;
        }

        const aspectRatio = zoneResize.startZoneH / zoneResize.startZoneW;
        const minW = 7.5;
        const maxW = 15;

        newW = clamp(newW, minW, maxW);
        newH = clamp(newW * aspectRatio, minW * aspectRatio, maxW * aspectRatio);

        newX = clamp(newX, 0, 100 - newW);
        newY = clamp(newY, 0, 100 - newH);

        return {
          ...zone,
          x: newX,
          y: newY,
          w: Number(newW.toFixed(1)),
          h: Number(newH.toFixed(1)),
        };
      });
    },
    [zoneResize, updateZone]
  );

  const handleZoneResizeEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!zoneResize || zoneResize.pointerId !== event.pointerId) return;
      event.currentTarget.releasePointerCapture(event.pointerId);
      setZoneResize(null);
    },
    [zoneResize]
  );

  return {
    zones,
    setZones,
    selectedZoneId,
    setSelectedZoneId,
    selectedZone,
    zoneDrag,
    zoneResize,
    zoneCounterRef,
    previewFrameRef,
    updateZone,
    updateSelectedZone,
    clearZone,
    rotateArtwork,
    updateZoneSize,
    rotateZoneById,
    handleZoneDragStart,
    handleZoneDragMove,
    handleZoneDragEnd,
    handleZoneResizeStart,
    handleZoneResizeMove,
    handleZoneResizeEnd,
  };
}
