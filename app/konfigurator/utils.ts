import { INITIAL_ZONE_RECT } from './constants';
import type { ZoneRect } from './types';

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function clampScale(scale: number) {
  return Number(clamp(scale, 0.4, 2.4).toFixed(1));
}

export function clampZoneWidth(width: number) {
  return Number(clamp(width, 8, 45).toFixed(1));
}

export function createZone(index: number): ZoneRect {
  const offset = (index - 1) * 2;

  return {
    id: 'zone-' + index,
    label: 'Zone ' + index,
    x: clamp(INITIAL_ZONE_RECT.x + offset, 0, 100 - INITIAL_ZONE_RECT.w),
    y: clamp(INITIAL_ZONE_RECT.y + offset, 0, 100 - INITIAL_ZONE_RECT.h),
    w: INITIAL_ZONE_RECT.w,
    h: INITIAL_ZONE_RECT.h,
    scale: 1,
    rotation: 0,
    assetId: null,
    artworkOffset: { x: 0, y: 0 },
  };
}

export function maxPanForZoom(zoom: number) {
  return (zoom - 1) * 45;
}
