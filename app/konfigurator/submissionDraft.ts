import type { ConfiguratorSnapshot } from "./submission";
import type { WorkwearZoneState } from "./workwearState";

export const KONFIGURATOR_SUBMISSION_DRAFT_KEY = "konfigurator-submission-draft-v1";

export type KonfiguratorSubmissionDraft = {
  activeWorkwearIndex: number;
  workwearStateByIndex: Record<number, WorkwearZoneState>;
  snapshots: ConfiguratorSnapshot[];
  printMaterial: "druck" | "stick";
  createdAt: string;
};
