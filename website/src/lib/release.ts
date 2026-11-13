import type { Release, Unit, Track, ReleaseInfo } from './contracts';

export async function loadRelease(baseUrl: string, targetReleaseId?: string): Promise<Release> {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  let releaseId = targetReleaseId;

  if (!releaseId) {
    try {
      const activeRes = await fetch(`${cleanBase}releases/active.json`);
      if (activeRes.ok) {
        const activeData = await activeRes.json();
        if (activeData.activeReleaseId) {
          releaseId = activeData.activeReleaseId;
        }
      }
    } catch {
      // Fallback if active.json is not present
    }
  }

  // Fallback to v0.1.0
  if (!releaseId) {
    releaseId = 'v0.1.0';
  }

  const [infoRes, unitsRes, tracksRes] = await Promise.all([
    fetch(`${cleanBase}releases/${releaseId}/release.json`),
    fetch(`${cleanBase}releases/${releaseId}/catalog/units.json`),
    fetch(`${cleanBase}releases/${releaseId}/catalog/tracks.json`)
  ]);

  if (!infoRes.ok || !unitsRes.ok || !tracksRes.ok) {
    throw new Error(`Failed to load release data for release: ${releaseId}`);
  }

  const info: ReleaseInfo = await infoRes.json();
  const units: Unit[] = await unitsRes.json();
  const tracks: Track[] = await tracksRes.json();

  if (!info.releaseId) {
    throw new Error('Missing release ID');
  }

  const unitMap = new Set<string>();

  for (const u of units) {
    if (unitMap.has(u.unitId)) {
      throw new Error(`Duplicate unit ID: ${u.unitId}`);
    }
    if (!Number.isInteger(u.sequence)) {
      throw new Error(`Non-integer sequence for unit ${u.unitId}`);
    }
    unitMap.add(u.unitId);
  }

  for (const track of tracks) {
    for (const unitId of track.unitIds) {
      if (!unitMap.has(unitId)) {
        throw new Error(`Track ${track.trackId} references unknown unit ${unitId}`);
      }
    }
  }

  return { info, units, tracks };
}
