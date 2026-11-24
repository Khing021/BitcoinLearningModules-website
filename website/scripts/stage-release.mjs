import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncDurations } from './sync-durations.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Arguments: releaseId (default: 'v1.0.0')
const releaseId = process.argv[2] || process.env.VITE_RELEASE_ID || 'v1.0.0';

// Always sync durations from guide decks and baseline before staging
syncDurations(releaseId);

const workspaceRoot = path.resolve(__dirname, '../..');
const sourceReleaseDir = path.join(workspaceRoot, 'delivery', 'releases', releaseId);
const targetReleaseDir = path.join(workspaceRoot, 'website', 'public', 'releases', releaseId);

if (!fs.existsSync(sourceReleaseDir)) {
  console.error(`Error: Release ${releaseId} does not exist under delivery/releases/`);
  console.error(`Looked in: ${sourceReleaseDir}`);
  process.exit(1);
}

// Validate critical release files exist
const requiredFiles = [
  path.join(sourceReleaseDir, 'release.json'),
  path.join(sourceReleaseDir, 'catalog', 'units.json'),
  path.join(sourceReleaseDir, 'catalog', 'tracks.json')
];

for (const reqFile of requiredFiles) {
  if (!fs.existsSync(reqFile)) {
    console.error(`Error: Required file missing in release: ${reqFile}`);
    process.exit(1);
  }
}

// Ensure target directory exists and is cleaned
if (fs.existsSync(targetReleaseDir)) {
  fs.rmSync(targetReleaseDir, { recursive: true, force: true });
}
fs.mkdirSync(path.dirname(targetReleaseDir), { recursive: true });

// Copy release files recursively
fs.cpSync(sourceReleaseDir, targetReleaseDir, { recursive: true });

// Also write a release manifest in public/releases/active.json so client can discover active release dynamically
const activeManifest = {
  activeReleaseId: releaseId,
  stagedAt: new Date().toISOString()
};
fs.writeFileSync(
  path.join(workspaceRoot, 'website', 'public', 'releases', 'active.json'),
  JSON.stringify(activeManifest, null, 2),
  'utf8'
);

console.log(`Successfully staged release [${releaseId}] to website/public/releases/${releaseId}`);
