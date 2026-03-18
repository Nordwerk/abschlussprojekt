import type { ZoneRect } from "./types";
import { createZone } from "./utils";

export type WorkwearZoneState = {
  zones: ZoneRect[];
  selectedZoneId: string;
  nextZoneIndex: number;
};

export function createInitialWorkwearZoneState(): WorkwearZoneState {
  const firstZone = createZone(1);

  return {
    zones: [firstZone],
    selectedZoneId: firstZone.id,
    nextZoneIndex: 2,
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
): WorkwearZoneState {
  return {
    zones,
    selectedZoneId: getValidSelectedZoneId(zones, selectedZoneId),
    nextZoneIndex,
  };
}

export function getOrCreateWorkwearZoneState(
  store: Record<number, WorkwearZoneState>,
  index: number,
) {
  const savedState = store[index];
  if (savedState) return savedState;

  const initialState = createInitialWorkwearZoneState();
  store[index] = initialState;
  return initialState;
}
