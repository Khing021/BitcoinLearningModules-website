import { describe, it, expect, vi } from 'vitest';
import { loadRelease } from '../src/lib/release';

describe('loadRelease', () => {
  it('should reject when a track references an unknown unit', async () => {
    // Mock global fetch
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('release.json')) {
        return { ok: true, json: async () => ({ releaseId: 'v-test', schemaVersion: 1 }) };
      }
      if (url.endsWith('units.json')) {
        return { ok: true, json: async () => ([
          { unitId: 'u01', sequence: 1, title: 'Unit 1', durationMinutes: 10, classPath: '', guidePath: '' }
        ]) };
      }
      if (url.endsWith('tracks.json')) {
        return { ok: true, json: async () => ([
          { trackId: 'track-a', name: 'Track A', unitIds: ['u01', 'u99'] }
        ]) };
      }
      return { ok: false };
    });

    await expect(loadRelease('/base/')).rejects.toThrow('Track track-a references unknown unit u99');
  });

  it('should reject missing release ID', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('release.json')) return { ok: true, json: async () => ({ schemaVersion: 1 }) };
      if (url.endsWith('units.json')) return { ok: true, json: async () => ([]) };
      if (url.endsWith('tracks.json')) return { ok: true, json: async () => ([]) };
      return { ok: false };
    });
    await expect(loadRelease('/base/')).rejects.toThrow('Missing release ID');
  });

  it('should reject duplicate unit ID', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('release.json')) return { ok: true, json: async () => ({ releaseId: 'v1', schemaVersion: 1 }) };
      if (url.endsWith('units.json')) return { ok: true, json: async () => ([
        { unitId: 'u01', sequence: 1, classPath: 'c', guidePath: 'g' },
        { unitId: 'u01', sequence: 2, classPath: 'c2', guidePath: 'g2' }
      ]) };
      if (url.endsWith('tracks.json')) return { ok: true, json: async () => ([]) };
      return { ok: false };
    });
    await expect(loadRelease('/base/')).rejects.toThrow('Duplicate unit ID: u01');
  });

  it('should reject non-integer sequence', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('release.json')) return { ok: true, json: async () => ({ releaseId: 'v1', schemaVersion: 1 }) };
      if (url.endsWith('units.json')) return { ok: true, json: async () => ([
        { unitId: 'u01', sequence: 1.5, classPath: 'c', guidePath: 'g' }
      ]) };
      if (url.endsWith('tracks.json')) return { ok: true, json: async () => ([]) };
      return { ok: false };
    });
    await expect(loadRelease('/base/')).rejects.toThrow('Non-integer sequence for unit u01');
  });
});
