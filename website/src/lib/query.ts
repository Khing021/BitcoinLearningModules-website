import type { Release } from './contracts';
import { normalizeSelection } from './selection';

export function parseQuery(release: Release, queryString: string): string[] {
  const searchParams = new URLSearchParams(queryString);
  
  const releaseParam = searchParams.get('release');
  if (releaseParam && releaseParam !== release.info.releaseId) {
    return [];
  }
  
  const unitsParam = searchParams.get('units');
  if (!unitsParam) return [];
  
  const unitIds = unitsParam.split(',').map(u => u.trim()).filter(Boolean);
  return normalizeSelection(release, unitIds);
}
