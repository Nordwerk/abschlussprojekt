import { useEffect, useRef, useCallback } from "react";
import {
  DEFAULT_WORKWEAR_INDEX,
  WORKWEAR_IMAGES,
} from "../constants";
import type { ZoneRect } from "../types";
import {
  getOrCreateWorkwearZoneState,
  getValidSelectedZoneId,
  snapshotWorkwearZoneState,
  type WorkwearZoneState,
} from "../workwearState";
import { createConfiguredSnapshots } from "../submission";
import { KONFIGURATOR_SUBMISSION_DRAFT_KEY } from "../submissionDraft";
import type { Asset, PrintMaterial } from "../types";

const WORKWEAR_STATE_STORAGE_KEY = "konfigurator-workwear-state-v2";

type PersistedWorkwearState = {
  activeWorkwearIndex: number;
  workwearStateByIndex: Record<string, WorkwearZoneState>;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function useWorkwearPersistence(
  zones: ZoneRect[],
  selectedZoneId: string,
  activeWorkwearIndex: number,
  onSetZones: (zones: ZoneRect[]) => void,
  onSetSelectedZoneId: (id: string) => void,
  onSetActiveWorkwearIndex: (index: number) => void,
  onSetAvailableImageIndexes: (indexes: Set<number> | null) => void,
  zoneCounterRef: React.MutableRefObject<number>,
  workwearStateRef: React.MutableRefObject<Record<number, WorkwearZoneState>>
) {
  const hasHydratedFromLocalStorageRef = useRef(false);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const rawState = window.localStorage.getItem(WORKWEAR_STATE_STORAGE_KEY);
      if (!rawState) {
        hasHydratedFromLocalStorageRef.current = true;
        return;
      }

      const parsedState: unknown = JSON.parse(rawState);
      if (!isObjectRecord(parsedState)) {
        hasHydratedFromLocalStorageRef.current = true;
        return;
      }

      const activeIndex = DEFAULT_WORKWEAR_INDEX;
      const restoredStore: Record<number, WorkwearZoneState> = {};
      const storeCandidate = parsedState.workwearStateByIndex;

      if (isObjectRecord(storeCandidate)) {
        for (const [indexKey, rawEntry] of Object.entries(storeCandidate)) {
          const index = Number(indexKey);
          if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= WORKWEAR_IMAGES.length
          ) {
            continue;
          }

          if (!isObjectRecord(rawEntry)) continue;

          const zonesCandidate = rawEntry.zones;
          if (!Array.isArray(zonesCandidate)) {
            continue;
          }

          const zones = zonesCandidate as ZoneRect[];
          const selectedZoneCandidate = rawEntry.selectedZoneId;
          const selectedZoneId =
            typeof selectedZoneCandidate === "string"
              ? selectedZoneCandidate
              : zones[0]?.id ?? "zone-1";

          const nextZoneIndexCandidate = rawEntry.nextZoneIndex;
          const nextZoneIndex =
            typeof nextZoneIndexCandidate === "number" &&
            Number.isFinite(nextZoneIndexCandidate) &&
            nextZoneIndexCandidate > 0
              ? Math.floor(nextZoneIndexCandidate)
              : 2;

          // Uploaded logos don't survive reloads
          const zonesWithoutUploadedAssets = zones.map((zone) => ({
            ...zone,
            assetId: null,
            rotation: 0,
            artworkOffset: { x: 0, y: 0 },
          }));

          restoredStore[index] = snapshotWorkwearZoneState(
            zonesWithoutUploadedAssets,
            selectedZoneId,
            nextZoneIndex,
            index
          );
        }
      }

      if (Object.keys(restoredStore).length > 0) {
        workwearStateRef.current = restoredStore;
      }

      const restoredState = getOrCreateWorkwearZoneState(
        workwearStateRef.current,
        activeIndex
      );
      const validSelectedZoneId = getValidSelectedZoneId(
        restoredState.zones,
        restoredState.selectedZoneId
      );

      onSetActiveWorkwearIndex(activeIndex);
      onSetZones(restoredState.zones);
      onSetSelectedZoneId(validSelectedZoneId);
      zoneCounterRef.current = restoredState.nextZoneIndex;
    } catch {
      // Keep defaults if stored JSON is invalid
    } finally {
      hasHydratedFromLocalStorageRef.current = true;
    }
  }, [zoneCounterRef, workwearStateRef, onSetZones, onSetSelectedZoneId, onSetActiveWorkwearIndex]);

  // Save persisted state to localStorage
  useEffect(() => {
    if (!hasHydratedFromLocalStorageRef.current) return;

    workwearStateRef.current[activeWorkwearIndex] = snapshotWorkwearZoneState(
      zones,
      selectedZoneId,
      zoneCounterRef.current,
      activeWorkwearIndex
    );

    const stateByIndex: Record<string, WorkwearZoneState> = {};
    for (const [index, state] of Object.entries(workwearStateRef.current)) {
      stateByIndex[index] = state;
    }

    const payload: PersistedWorkwearState = {
      activeWorkwearIndex,
      workwearStateByIndex: stateByIndex,
    };

    try {
      window.localStorage.setItem(
        WORKWEAR_STATE_STORAGE_KEY,
        JSON.stringify(payload)
      );
    } catch {
      // Ignore write failures in private mode or quota limits
    }
  }, [activeWorkwearIndex, selectedZoneId, zones, zoneCounterRef, workwearStateRef]);

  // Check which images are available
  useEffect(() => {
    let isCancelled = false;

    const checks = WORKWEAR_IMAGES.map((imageUrl, index) =>
      new Promise<number | null>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(index);
        img.onerror = () => resolve(null);
        img.src = imageUrl;
      })
    );

    Promise.all(checks).then((results) => {
      if (isCancelled) return;

      const nextIndexes = new Set<number>();
      for (const result of results) {
        if (typeof result === "number") {
          nextIndexes.add(result);
        }
      }

      onSetAvailableImageIndexes(nextIndexes);
    });

    return () => {
      isCancelled = true;
    };
  }, [onSetAvailableImageIndexes]);

  const saveCurrentWorkwearState = useCallback(
    (index: number) => {
      workwearStateRef.current[index] = snapshotWorkwearZoneState(
        zones,
        selectedZoneId,
        zoneCounterRef.current,
        index
      );
    },
    [zones, selectedZoneId, zoneCounterRef, workwearStateRef]
  );

  const getSubmissionStateByIndex = useCallback(() => {
    const stateByIndex: Record<number, WorkwearZoneState> = {
      ...workwearStateRef.current,
    };

    stateByIndex[activeWorkwearIndex] = snapshotWorkwearZoneState(
      zones,
      selectedZoneId,
      zoneCounterRef.current,
      activeWorkwearIndex
    );

    return stateByIndex;
  }, [zones, selectedZoneId, activeWorkwearIndex, zoneCounterRef, workwearStateRef]);

  const loadWorkwearState = useCallback(
    (index: number) => {
      const savedState = getOrCreateWorkwearZoneState(workwearStateRef.current, index);

      const validSelectedZoneId = getValidSelectedZoneId(
        savedState.zones,
        savedState.selectedZoneId
      );

      onSetZones(savedState.zones);
      onSetSelectedZoneId(validSelectedZoneId);
      zoneCounterRef.current = savedState.nextZoneIndex;
    },
    [zoneCounterRef, workwearStateRef, onSetZones, onSetSelectedZoneId]
  );

  const prepareDraftAndSubmit = useCallback(
    async (
      assets: Asset[],
      printMaterial: PrintMaterial,
      activeWorkwearIndex: number
    ) => {
      const stateByIndex = getSubmissionStateByIndex();
      const snapshots = await createConfiguredSnapshots(stateByIndex, assets);

      if (snapshots.length === 0) {
        throw new Error("Bitte mindestens ein Logo auf einer Zone platzieren.");
      }

      sessionStorage.setItem(
        KONFIGURATOR_SUBMISSION_DRAFT_KEY,
        JSON.stringify({
          activeWorkwearIndex,
          workwearStateByIndex: stateByIndex,
          snapshots,
          printMaterial,
          createdAt: new Date().toISOString(),
        })
      );

      return snapshots;
    },
    [getSubmissionStateByIndex]
  );

  return {
    hasHydratedFromLocalStorageRef,
    saveCurrentWorkwearState,
    getSubmissionStateByIndex,
    loadWorkwearState,
    prepareDraftAndSubmit,
  };
}
