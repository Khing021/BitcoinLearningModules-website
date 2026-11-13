import type { Release } from './contracts';

export type TrackStatus = { kind: 'preset'; trackId: string } | { kind: 'custom' };

export function normalizeSelection(release: Release, unitIds: string[]): string[] {
  const uniqueIds = Array.from(new Set(unitIds));
  const validIds = uniqueIds.filter(id => release.units.some(u => u.unitId === id));
  
  return validIds.sort((a, b) => {
    const seqA = release.units.find(u => u.unitId === a)?.sequence ?? 0;
    const seqB = release.units.find(u => u.unitId === b)?.sequence ?? 0;
    return seqA - seqB;
  });
}

export function resolveTrackStatus(release: Release, unitIds: string[]): TrackStatus {
  const normalized = normalizeSelection(release, unitIds);
  
  for (const track of release.tracks) {
    if (track.unitIds.length === normalized.length && 
        track.unitIds.every((id, idx) => id === normalized[idx])) {
      return { kind: 'preset', trackId: track.trackId };
    }
  }
  
  return { kind: 'custom' };
}

export function parseSelectionFile(release: Release, text: string): string[] {
  const data = JSON.parse(text);
  if (data.schemaVersion !== 1) throw new Error('Unsupported schema version');
  if (data.releaseId !== release.info.releaseId) throw new Error('Release ID mismatch');
  if (!Array.isArray(data.unitIds)) throw new Error('Invalid format');
  
  const hasUnknown = data.unitIds.some((id: string) => !release.units.some(u => u.unitId === id));
  if (hasUnknown) throw new Error('References unknown unit');

  return normalizeSelection(release, data.unitIds);
}

export function serializeSelection(releaseId: string, unitIds: string[]): string {
  return JSON.stringify({
    schemaVersion: 1,
    releaseId,
    unitIds,
    exportedAt: new Date().toISOString()
  }, null, 2);
}

export function downloadSelectionJson(releaseId: string, unitIds: string[], filename?: string): void {
  const jsonContent = serializeSelection(releaseId, unitIds);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `bitcoin-deck-selection-${releaseId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
