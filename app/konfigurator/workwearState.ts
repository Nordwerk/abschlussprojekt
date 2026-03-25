import type { ZoneRect } from "./types";
import { createZone } from "./utils";
import { getMaxZonesForImage } from "./constants";

export type WorkwearZoneState = {
  zones: ZoneRect[];
  selectedZoneId: string;
  nextZoneIndex: number;
};

function normalizeZonesForImage(zones: ZoneRect[], imageIndex: number): ZoneRect[] {
  const maxZones = getMaxZonesForImage(imageIndex);
  const zonesByIndex = new Map<number, ZoneRect>();

  for (const zone of zones) {
    const match = /^zone-(\d+)$/.exec(zone.id);
    if (!match) continue;

    const zoneIndex = Number(match[1]);
    if (zoneIndex < 1 || zoneIndex > maxZones || zonesByIndex.has(zoneIndex)) {
      continue;
    }

    zonesByIndex.set(zoneIndex, zone);
  }

  const normalizedZones: ZoneRect[] = [];
  for (let zoneIndex = 1; zoneIndex <= maxZones; zoneIndex += 1) {
    normalizedZones.push(zonesByIndex.get(zoneIndex) ?? createZone(zoneIndex));
  }

  return normalizedZones;
}

export function createInitialWorkwearZoneState(
  imageIndex: number,
): WorkwearZoneState {
  const zones = normalizeZonesForImage([], imageIndex);

  return {
    zones,
    selectedZoneId: zones[0]?.id ?? "zone-1",
    nextZoneIndex: zones.length + 1,
  };
}

export function getValidSelectedZoneId(
  zones: ZoneRect[],
  preferredZoneId: string,
) {
  if (zones.some((zone) => zone.id === preferredZoneId)) return preferredZoneId;
  return zones[0]?.id ?? "zone-1";
}

export function snapshotWorkwearZoneState(
  zones: ZoneRect[],
  selectedZoneId: string,
  nextZoneIndex: number,
  imageIndex: number,
): WorkwearZoneState {
  const normalizedZones = normalizeZonesForImage(zones, imageIndex);

  return {
    zones: normalizedZones,
    selectedZoneId: getValidSelectedZoneId(normalizedZones, selectedZoneId),
    nextZoneIndex: Math.max(nextZoneIndex, normalizedZones.length + 1),
  };
}

export function getOrCreateWorkwearZoneState(
  store: Record<number, WorkwearZoneState>,
  index: number,
) {
  const savedState = store[index];
  if (savedState) {
    const normalizedState = snapshotWorkwearZoneState(
      savedState.zones,
      savedState.selectedZoneId,
      savedState.nextZoneIndex,
      index,
    );
    store[index] = normalizedState;
    return normalizedState;
  }

  const initialState = createInitialWorkwearZoneState(index);
  store[index] = initialState;
  return initialState;
}
