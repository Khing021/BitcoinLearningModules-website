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

  it('class.js correctly renders duration chips with clock icon and mm:ss formatting', () => {
    // Setup DOM
    document.body.innerHTML = `
      <body data-default-duration="3">
        <div class="shell">
          <section class="slide" id="s1">
            <div class="guide-left">
              <div class="slide-chip">Slide 1</div>
            </div>
          </section>
          <section class="slide" id="s2" data-duration="2.5">
            <div class="guide-left">
              <div class="slide-chip">Slide 2</div>
            </div>
          </section>
          <section class="slide" id="s3" data-duration="0.5">
            <div class="guide-left">
              <div class="slide-chip">Slide 3</div>
            </div>
          </section>
        </div>
      </body>
    `;

    // Load and evaluate class.js in this DOM context
    const classJsPath = path.resolve(__dirname, '../../delivery/releases/v1.0.0/runtime/class.js');
    const classJsCode = fs.readFileSync(classJsPath, 'utf8');
    eval(classJsCode);

    const s1Duration = document.querySelector('#s1 .duration-chip');
    const s2Duration = document.querySelector('#s2 .duration-chip');
    const s3Duration = document.querySelector('#s3 .duration-chip');

    expect(s1Duration).not.toBeNull();
    expect(s1Duration?.textContent).toContain('3:00');
    expect(s1Duration?.querySelector('svg.duration-chip-icon')).not.toBeNull();

    // Check 2.5 minutes formats to 2:30, not 2:50!
    expect(s2Duration).not.toBeNull();
    expect(s2Duration?.textContent).toContain('2:30');
    expect(s2Duration?.querySelector('svg.duration-chip-icon')).not.toBeNull();

    // Check 0.5 minutes formats to 0:30
    expect(s3Duration).not.toBeNull();
    expect(s3Duration?.textContent).toContain('0:30');

    // Check that slide-chip and duration-chip are side by side in guide-chip-row
    const s1Row = document.querySelector('#s1 .guide-chip-row');
    expect(s1Row).not.toBeNull();
    expect(s1Row?.children[0].className).toContain('slide-chip');
    expect(s1Row?.children[1].className).toContain('duration-chip');
  });
});
