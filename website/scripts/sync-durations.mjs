import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function syncDurations(releaseId = 'v1.0.0', customWorkspaceRoot = null) {
  const workspaceRoot = customWorkspaceRoot || path.resolve(__dirname, '../..');
  const releaseDir = path.join(workspaceRoot, 'delivery', 'releases', releaseId);
  const releaseJsonPath = path.join(releaseDir, 'release.json');
  const unitsJsonPath = path.join(releaseDir, 'catalog', 'units.json');

  if (!fs.existsSync(releaseJsonPath)) {
    throw new Error(`release.json not found: ${releaseJsonPath}`);
  }
  if (!fs.existsSync(unitsJsonPath)) {
    throw new Error(`units.json not found: ${unitsJsonPath}`);
  }

  const releaseInfo = JSON.parse(fs.readFileSync(releaseJsonPath, 'utf8'));
  const defaultDuration = Number(releaseInfo.defaultSlideDurationMinutes) || 3;

  const units = JSON.parse(fs.readFileSync(unitsJsonPath, 'utf8'));
  let totalCurriculumMinutes = 0;
  let totalCurriculumSlides = 0;
  let overriddenSlidesCount = 0;

  for (const unit of units) {
    // Prioritize guidePath for instructor notes and duration overrides, fallback to classPath
    const targetFile = unit.guidePath || unit.classPath;
    const htmlPath = path.join(releaseDir, targetFile);

    if (!fs.existsSync(htmlPath)) {
      console.warn(`[sync-durations] HTML fragment missing for unit ${unit.unitId}: ${htmlPath}`);
      continue;
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Ensure guide.html slides have data-theme attribute matching their chapter
    const chapterMatch = (unit.chapter || '').match(/Chapter\s*(\d+)/i);
    const chapterTheme = chapterMatch ? `chapter-${chapterMatch[1]}` : 'chapter-1';
    let updatedHtml = htmlContent;
    if (!htmlContent.includes(`data-theme=`)) {
      updatedHtml = htmlContent.replace(/(<section\b(?=[^>]*\bclass=["'][^"']*\bslide\b[^"']*["']))(?![^>]*\bdata-theme=)/gi, `$1 data-theme="${chapterTheme}"`);
      if (updatedHtml !== htmlContent) {
        fs.writeFileSync(htmlPath, updatedHtml, 'utf8');
      }
    }

    // Match all <section ... class="...slide..."> openings
    const slideTagRegex = /<section\b(?=[^>]*\bclass=["'][^"']*\bslide\b[^"']*["'])[^>]*>/gi;
    const slideTags = updatedHtml.match(slideTagRegex) || [];

    const slideCount = slideTags.length || unit.slideCount || 1;
    const slideDurations = [];

    for (const tag of slideTags) {
      // Look for data-duration="X" or data-duration-minutes="X"
      const match = tag.match(/data-duration(?:-minutes)?=["']([0-9]+(?:\.[0-9]+)?)["']/i);
      if (match) {
        const customMinutes = parseFloat(match[1]);
        slideDurations.push(customMinutes);
        overriddenSlidesCount++;
      } else {
        slideDurations.push(defaultDuration);
      }
    }

    // If no tags were matched by regex, fallback to existing unit.slideCount with default duration
    if (slideDurations.length === 0) {
      const count = unit.slideCount || 1;
      for (let i = 0; i < count; i++) {
        slideDurations.push(defaultDuration);
      }
    }

    const unitTotalMinutes = slideDurations.reduce((sum, d) => sum + d, 0);

    unit.slideCount = slideCount;
    unit.durationMinutes = unitTotalMinutes;
    unit.slideDurations = slideDurations;

    totalCurriculumMinutes += unitTotalMinutes;
    totalCurriculumSlides += slideCount;
  }

  fs.writeFileSync(unitsJsonPath, JSON.stringify(units, null, 2) + '\n', 'utf8');

  console.log(`[sync-durations] Successfully synced release [${releaseId}]`);
  console.log(`  - Baseline per slide: ${defaultDuration} mins`);
  console.log(`  - Total units: ${units.length}`);
  console.log(`  - Total slides: ${totalCurriculumSlides}`);
  console.log(`  - Overridden slides: ${overriddenSlidesCount}`);
  console.log(`  - Total curriculum duration: ${totalCurriculumMinutes} mins (~${(totalCurriculumMinutes / 60).toFixed(1)} hrs)`);

  return {
    units,
    totalCurriculumMinutes,
    totalCurriculumSlides,
    overriddenSlidesCount
  };
}

// Direct CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const releaseId = process.argv[2] || process.env.VITE_RELEASE_ID || 'v1.0.0';
  syncDurations(releaseId);
}
