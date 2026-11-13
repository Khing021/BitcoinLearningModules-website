import { describe, it, expect, vi } from 'vitest';
import { createOfflineZip } from '../src/lib/zip';
import JSZip from 'jszip';

describe('zip', () => {
  it('creates an offline zip package', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    });

    const mockDeck = {
      html: '<html><body><img src="assets/u01/image1.png" /></body></html>',
      assets: ['units/u01/assets/image1.png'],
      runtimeFiles: ['runtime/class.css']
    };

    const blob = await createOfflineZip(mockDeck, 'v1');
    expect(blob).toBeInstanceOf(Blob);

    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    expect(zip.file('index.html')).toBeTruthy();
    
    // Check if index.html doesn't contain a <base> tag that points to http
    const htmlContent = await zip.file('index.html')!.async('string');
    expect(htmlContent).not.toContain('<base');
    
    // Check if asset is inside
    expect(zip.file('units/u01/assets/image1.png')).toBeTruthy();
    expect(zip.file('runtime/class.css')).toBeTruthy();
  });
});
