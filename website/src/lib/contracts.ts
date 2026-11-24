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
};

export type Release = {
  info: ReleaseInfo;
  units: Unit[];
  tracks: Track[];
};
