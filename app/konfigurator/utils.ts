import { INITIAL_ZONE_RECT } from './constants';
import type { ZoneRect } from './types';

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function clampZoneWidth(width: number) {
  return Number(clamp(width, 7.5, 15).toFixed(1));
}

export function createZone(index: number): ZoneRect {
  const gap = 2;
  const clampedWidth = clampZoneWidth(INITIAL_ZONE_RECT.w);
  const clampedHeight = Number((clampedWidth * (INITIAL_ZONE_RECT.h / INITIAL_ZONE_RECT.w)).toFixed(1));
  const zeroBasedIndex = index - 1;
  const column = zeroBasedIndex % 2;
  const row = Math.floor(zeroBasedIndex / 2);

  const stepX = clampedWidth + gap;
  const stepY = clampedHeight + gap;

  return {
    id: 'zone-' + index,
    label: 'Zone ' + index,
    x: clamp(INITIAL_ZONE_RECT.x + column * stepX, 0, 100 - clampedWidth),
    y: clamp(INITIAL_ZONE_RECT.y + row * stepY, 0, 100 - clampedHeight),
    w: clampedWidth,
    h: clampedHeight,
    scale: 1,
    rotation: 0,
    assetId: null,
    artworkOffset: { x: 0, y: 0 },
  };
}

export function getArtworkTransform(zone: Pick<ZoneRect, 'artworkOffset' | 'rotation' | 'scale'>) {
  return `translate(${zone.artworkOffset.x}px, ${zone.artworkOffset.y}px) rotate(${zone.rotation}deg) scale(${zone.scale})`;
}
