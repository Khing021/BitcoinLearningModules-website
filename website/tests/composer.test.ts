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

  it('includes data-default-duration in body tag for guide preview', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('units/u01/guide.html')) {
        return { ok: true, text: async () => '<section class="slide"><div class="slide-chip">Slide 1</div></section>' };
      }
      return { ok: false, statusText: 'Not Found' };
    });

    const releaseWithDuration: Release = {
      ...mockRelease,
      info: { ...mockRelease.info, defaultSlideDurationMinutes: 3 }
    };

    const result = await composeDeck(releaseWithDuration, ['u01'], 'guide', '/base/');
    expect(result.headHtml).toContain('data-default-duration="3"');
    expect(result.html).toContain('runtime/guide.css');
  });

  it('splits guide slides when data-theme appears before class="slide"', async () => {
    // Simulates real guide.html where attributes are ordered: data-theme first, then class="slide"
    // The old regex /(?=<section class="slide)/ would miss these and return only 1 slide per unit
    const guideHtml = [
      `<section data-theme="chapter-1" class="slide">`,
      `  <div class="slide-chip">Slide 1</div>`,
      `  <section class="guide-section"><p>notes 1</p></section>`,
      `</section>`,
      `<section data-theme="chapter-1" class="slide">`,
      `  <div class="slide-chip">Slide 2</div>`,
      `  <section class="guide-section"><p>notes 2</p></section>`,
      `</section>`,
      `<section data-theme="chapter-1" class="slide slide-with-background">`,
      `  <div class="slide-chip">Slide 3</div>`,
      `</section>`,
    ].join('\n');

    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('units/u01/guide.html')) {
        return { ok: true, text: async () => guideHtml };
      }
      return { ok: false, statusText: 'Not Found' };
    });

    const result = await composeDeck(mockRelease, ['u01'], 'guide', '/base/');
    // Should extract all 3 slides, not collapse to 1
    expect(result.slides.length).toBe(3);
  });

  it('splits class slides correctly when class="slide" is first attribute', async () => {
    // class.html uses class="slide" as first attribute — the old regex worked for this
    const classHtml = [
      `<section class="slide" data-theme="chapter-1" data-slide-id="c1-u1-s1">`,
      `  <div class="footer-right">1/3</div>`,
      `</section>`,
      `<section class="slide" data-theme="chapter-1" data-slide-id="c1-u1-s2">`,
      `  <div class="footer-right">2/3</div>`,
      `</section>`,
      `<section class="slide slide-with-background" data-theme="chapter-1">`,
      `  <div class="footer-right">3/3</div>`,
      `</section>`,
    ].join('\n');

    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('units/u01/class.html')) {
        return { ok: true, text: async () => classHtml };
      }
      return { ok: false, statusText: 'Not Found' };
    });

    const result = await composeDeck(mockRelease, ['u01'], 'class', '/base/');
    expect(result.slides.length).toBe(3);
  });

  it('does not split on nested guide-section tags inside a slide', async () => {
    // guide-section is nested inside slide — must NOT be treated as a slide boundary
    const guideHtml = [
      `<section data-theme="chapter-2" class="slide">`,
      `  <section class="guide-section"><p>Purpose</p></section>`,
      `  <section class="guide-section"><p>Speaker Notes</p></section>`,
      `  <section class="guide-section guide-section-note"><p>Delivery Note</p></section>`,
      `</section>`,
    ].join('\n');

    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.endsWith('units/u01/guide.html')) {
        return { ok: true, text: async () => guideHtml };
      }
      return { ok: false, statusText: 'Not Found' };
    });

    const result = await composeDeck(mockRelease, ['u01'], 'guide', '/base/');
    // Only 1 slide — guide-section must NOT trigger a split
    expect(result.slides.length).toBe(1);
  });
});
