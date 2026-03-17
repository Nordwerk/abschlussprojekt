/* eslint-disable @next/next/no-img-element */

import { useDroppable } from '@dnd-kit/core';
import type { PointerEvent as ReactPointerEvent } from 'react';

import type { Asset, ZoneRect } from '../types';

type WorkwearZoneProps = {
  zone: ZoneRect;
  asset: Asset | undefined;
  isSelected: boolean;
  previewIsOver: boolean;
  zoneDropPrefix: string;
  onSelect: (zoneId: string) => void;
  onRegisterNode: (zoneId: string, node: HTMLDivElement | null) => void;
  onZoneDragStart: (event: ReactPointerEvent<HTMLButtonElement>, zoneId: string) => void;
  onZoneDragMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onZoneDragEnd: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onArtworkDragStart: (event: ReactPointerEvent<HTMLButtonElement>, zoneId: string) => void;
  onArtworkDragMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onArtworkDragEnd: (event: ReactPointerEvent<HTMLButtonElement>) => void;
};

export default function WorkwearZone({
  zone,
  asset,
  isSelected,
  previewIsOver,
  zoneDropPrefix,
  onSelect,
  onRegisterNode,
  onZoneDragStart,
  onZoneDragMove,
  onZoneDragEnd,
  onArtworkDragStart,
  onArtworkDragMove,
  onArtworkDragEnd,
}: WorkwearZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: zoneDropPrefix + zone.id });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        onRegisterNode(zone.id, node);
      }}
      onClick={() => onSelect(zone.id)}
      style={{
        left: zone.x + '%',
        top: zone.y + '%',
        width: zone.w + '%',
        height: zone.h + '%',
      }}
      className={
        'absolute rounded-md border transition ' +
        (isOver || previewIsOver
          ? 'border-nordwerk-orange bg-nordwerk-orange/20 shadow-[0_0_0_2px_rgba(245,130,32,0.25)]'
          : isSelected
          ? 'border-white bg-white/12 shadow-[0_0_0_2px_rgba(255,255,255,0.12)]'
          : 'border-white/70 bg-white/8')
      }
    >
      <button
        type="button"
        onPointerDown={(event) => onZoneDragStart(event, zone.id)}
        onPointerMove={onZoneDragMove}
        onPointerUp={onZoneDragEnd}
        onPointerCancel={onZoneDragEnd}
        className="absolute left-0 top-0 z-30 -translate-y-[115%] touch-none rounded bg-black/85 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white shadow"
      >
        Zone
      </button>

      <div className="relative h-full w-full overflow-hidden rounded-[inherit]">

      {!asset ? (
        <div className="absolute inset-0 flex items-center justify-center px-1 text-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/90 sm:text-[11px]">
            {zone.label}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onPointerDown={(event) => onArtworkDragStart(event, zone.id)}
          onPointerMove={onArtworkDragMove}
          onPointerUp={onArtworkDragEnd}
          onPointerCancel={onArtworkDragEnd}
          className="absolute inset-0 z-20 touch-none cursor-grab active:cursor-grabbing"
          aria-label={`${zone.label} logo verschieben`}
        >
          <img
            src={asset.src}
            alt={asset.name}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
            style={{
              transform: `translate(${zone.artworkOffset.x}px, ${zone.artworkOffset.y}px) rotate(${zone.rotation}deg) scale(${zone.scale})`,
              transformOrigin: 'center',
            }}
          />
        </button>
      )}
      </div>
    </div>
  );
}
