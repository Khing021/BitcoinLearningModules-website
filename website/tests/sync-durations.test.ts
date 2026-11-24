import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { syncDurations } from '../scripts/sync-durations.mjs';

describe('syncDurations', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-durations-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should parse baseline duration and override data-duration correctly', () => {
    const releaseDir = path.join(tmpDir, 'delivery', 'releases', 'v-test');
    const catalogDir = path.join(releaseDir, 'catalog');
    const unit1Dir = path.join(releaseDir, 'units', 'u1');
    const unit2Dir = path.join(releaseDir, 'units', 'u2');

    fs.mkdirSync(catalogDir, { recursive: true });
    fs.mkdirSync(unit1Dir, { recursive: true });
    fs.mkdirSync(unit2Dir, { recursive: true });

    // release.json with baseline = 3
    fs.writeFileSync(
      path.join(releaseDir, 'release.json'),
      JSON.stringify({ releaseId: 'v-test', defaultSlideDurationMinutes: 3 }),
      'utf8'
    );

    // unit 1: 2 slides, no overrides -> 3 + 3 = 6 mins
    fs.writeFileSync(
      path.join(unit1Dir, 'guide.html'),
      `
      <section class="slide"><p>Slide 1</p></section>
      <section class="slide"><p>Slide 2</p></section>
      `,
      'utf8'
    );

    // unit 2: 3 slides with override: 1st default (3), 2nd override (5), 3rd override (1.5) -> 3 + 5 + 1.5 = 9.5 mins
    fs.writeFileSync(
      path.join(unit2Dir, 'guide.html'),
      `
      <section class="slide"><p>Slide 1</p></section>
      <section class="slide" data-duration="5"><p>Slide 2 Deep</p></section>
      <section class="slide" data-duration-minutes="1.5"><p>Slide 3 Wrap</p></section>
      `,
      'utf8'
    );

    fs.writeFileSync(
      path.join(catalogDir, 'units.json'),
      JSON.stringify([
        { unitId: 'u1', sequence: 1, title: 'Unit 1', durationMinutes: 15, guidePath: 'units/u1/guide.html' },
        { unitId: 'u2', sequence: 2, title: 'Unit 2', durationMinutes: 15, guidePath: 'units/u2/guide.html' }
      ]),
      'utf8'
    );

    // Run syncDurations directly with our test directory
    const result = syncDurations('v-test', tmpDir);

    expect(result.units[0].slideCount).toBe(2);
    expect(result.units[0].durationMinutes).toBe(6);
    expect(result.units[0].slideDurations).toEqual([3, 3]);

    expect(result.units[1].slideCount).toBe(3);
    expect(result.units[1].durationMinutes).toBe(9.5);
    expect(result.units[1].slideDurations).toEqual([3, 5, 1.5]);
    expect(result.totalCurriculumMinutes).toBe(15.5);
    expect(result.totalCurriculumSlides).toBe(5);
    expect(result.overriddenSlidesCount).toBe(2);
  });
});
