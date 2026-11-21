// GitHub Pages serves only real files; this app is a client-side SPA whose routes
// (/builder, /class, /guide, /about) have no files on disk. Without a fallback, any
// direct request for those paths — new tab, reload, shared link — returns
// "404 File not found" before React can even start.
//
// GitHub Pages serves 404.html (with a 404 status) for unknown paths while keeping
// the requested URL and query string, so a byte-identical copy of index.html lets the
// router read the real path (?release=…&units=…) and render the right screen.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const fallbackPath = path.join(distDir, '404.html');

if (!fs.existsSync(indexPath)) {
  console.error(`Error: ${indexPath} not found — run vite build first.`);
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('<div id="root">')) {
  console.error('Error: dist/index.html does not look like the SPA entry (missing #root).');
  process.exit(1);
}

fs.writeFileSync(fallbackPath, html, 'utf8');

const bytes = fs.statSync(fallbackPath).size;
console.log(`Wrote dist/404.html (${bytes} bytes) as the SPA fallback for GitHub Pages`);
