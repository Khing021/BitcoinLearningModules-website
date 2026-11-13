import { describe, it, expect } from 'vitest';
import { normalizeSelection, resolveTrackStatus, parseSelectionFile, serializeSelection } from '../src/lib/selection';
import { parseQuery } from '../src/lib/query';
import type { Release } from '../src/lib/contracts';

const mockRelease: Release = {
  info: { releaseId: 'v1', schemaVersion: 1, locale: 'th', licenseStatus: 'pending', catalogHash: 'hash' },
  units: [
    { unitId: 'u01', sequence: 1, title: 'U1', durationMinutes: 1, classPath: '', guidePath: '' },
    { unitId: 'u05', sequence: 5, title: 'U5', durationMinutes: 1, classPath: '', guidePath: '' }
  ],
  tracks: [
    { trackId: 'track-1', name: 'Track 1', unitIds: ['u01', 'u05'] }
  ]
};

describe('selection', () => {
  it('normalizes selection by deduplicating and sorting', () => {
    expect(normalizeSelection(mockRelease, ['u05', 'u01', 'u05'])).toEqual(['u01', 'u05']);
  });

  it('resolves track status correctly', () => {
    expect(resolveTrackStatus(mockRelease, ['u01', 'u05'])).toEqual({ kind: 'preset', trackId: 'track-1' });
    expect(resolveTrackStatus(mockRelease, ['u01'])).toEqual({ kind: 'custom' });
  });

  it('parses valid JSON selection', () => {
    const validJson = JSON.stringify({ schemaVersion: 1, releaseId: 'v1', unitIds: ['u05', 'u01'] });
    expect(parseSelectionFile(mockRelease, validJson)).toEqual(['u01', 'u05']);
  });

  it('rejects JSON from different release', () => {
    const invalidJson = JSON.stringify({ schemaVersion: 1, releaseId: 'v2', unitIds: ['u01'] });
    expect(() => parseSelectionFile(mockRelease, invalidJson)).toThrow('Release ID mismatch');
  });

  it('serializes selection with schemaVersion, releaseId, unitIds, and exportedAt', () => {
    const jsonStr = serializeSelection('v1', ['u01', 'u05']);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.releaseId).toBe('v1');
    expect(parsed.unitIds).toEqual(['u01', 'u05']);
    expect(typeof parsed.exportedAt).toBe('string');
    expect(new Date(parsed.exportedAt).getTime()).not.toBeNaN();
  });
});

describe('query', () => {
  it('parses URL query into normalized selection', () => {
    expect(parseQuery(mockRelease, '?release=v1&units=u05,u01')).toEqual(['u01', 'u05']);
  });

  it('parses URL query without explicit release param', () => {
    expect(parseQuery(mockRelease, '?units=u05,u01')).toEqual(['u01', 'u05']);
  });

  it('returns empty array when release mismatch', () => {
    expect(parseQuery(mockRelease, '?release=v2&units=u01')).toEqual([]);
  });
});
