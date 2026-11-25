export type ExpectedOutcome = {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
};

export type Unit = {
  unitId: string;
  sequence: number;
  title: string;
  durationMinutes: number;
  classPath: string;
  guidePath: string;
  slideCount?: number;
  slideDurations?: number[];
  chapter?: string;
  eoWeights?: Record<string, number>;
};

export type Track = {
  trackId: string;
  name: string;
  description?: string;
  targetAudience?: string;
  learningOutcome?: string;
  unitIds: string[];
};

export type ReleaseInfo = {
  schemaVersion: number;
  releaseId: string;
  locale: string;
  licenseStatus: string;
  catalogHash: string;
  defaultSlideDurationMinutes?: number;
  expectedOutcomes?: ExpectedOutcome[];
};

export type Release = {
  info: ReleaseInfo;
  units: Unit[];
  tracks: Track[];
};
