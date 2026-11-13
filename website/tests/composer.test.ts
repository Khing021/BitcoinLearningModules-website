import { describe, it, expect, vi } from 'vitest';
import { composeDeck } from '../src/lib/composer';
import type { Release } from '../src/lib/contracts';

const mockRelease: Release = {
  info: { releaseId: 'v1', schemaVersion: 1, locale: 'th', licenseStatus: 'pending', catalogHash: 'hash' },
  units: [
    { unitId: 'u01', sequence: 1, title: 'U1', durationMinutes: 1, classPath: 'units/u01/class.html', guidePath: 'units/u01/guide.html' },
    { unitId: 'u02', sequence: 2, title: 'U2', durationMinutes: 1, classPath: 'units/u02/class.html', guidePath: 'units/u02/guide.html' }
  ],
  tracks: []
};

describe('composer', () => {
  it('composes a deck from fragments', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('units/u01/class.html')) {
        return { ok: true, text: async () => '<!-- u01 --><img src="assets/image1.png" />' };
      }
      if (url.endsWith('units/u02/class.html')) {
        return { ok: true, text: async () => '<!-- u02 --><img src="../assets/image2.png" />' };
      }
      return { ok: false, statusText: 'Not Found' };
    });

    const result = await composeDeck(mockRelease, ['u01', 'u02'], 'class', '/base/');
    
    expect(result.html).toContain('<!-- u01 -->');
    expect(result.html).toContain('<!-- u02 -->');
    expect(result.html).toContain('<base href="/base/releases/v1/"');
    
    // Check asset URLs are collected
    expect(result.assets).toContain('units/u01/assets/image1.png');
    // It should handle relative resolution based on the fragment path
  });
});
