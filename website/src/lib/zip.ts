import JSZip from 'jszip';
import type { ComposedDeck } from './composer';

export type ZipProgressCallback = (current: number, total: number, status: string) => void;

function buildOfflinePlayerHtml(deck: ComposedDeck, _releaseId: string): string {
  // Clean headHtml and tailHtml: remove <base> tag and ensure relative asset loading
  let cleanHead = (deck.headHtml || '<!DOCTYPE html>\n<html>\n<head></head>\n<body class="class-deck-preview">\n<div class="shell">\n').replace(/<base href="[^"]*">\n?/, '');
  
  // Guarantee body tag has is-player-mode class
  cleanHead = cleanHead.replace(/<body class="([^"]*)"/, (_match, classList) => {
    if (!classList.includes('is-player-mode')) {
      return `<body class="${classList} is-player-mode"`;
    }
    return `<body class="${classList}"`;
  });

  // Ensure robust player styles inside slide iframes
  const playerOverrideCss = `
  <style>
    body.is-player-mode {
      background: transparent !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    body.is-player-mode .shell {
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      max-width: 100% !important;
      height: 100vh !important;
    }
    body.is-player-mode .slide-frame {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    body.is-player-mode .slide {
      border-radius: 0 !important;
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      transform: scale(calc(100vw / 1600)) !important;
      transform-origin: top left !important;
    }
  </style>
  `;
  if (!cleanHead.includes('body.is-player-mode .slide-frame')) {
    cleanHead = cleanHead.replace('</head>', `${playerOverrideCss}\n</head>`);
  }

  const cleanTail = deck.tailHtml || '\n</div>\n<script src="runtime/class.js"></script>\n</body>\n</html>';

  // Escape </script> tags in any string injected into script blocks to prevent browser HTML parser closing script early
  const safeHead = JSON.stringify(cleanHead).replace(/<\/script>/gi, '<\\/script>');
  const safeTail = JSON.stringify(cleanTail).replace(/<\/script>/gi, '<\\/script>');
  const slidesJson = JSON.stringify(deck.slides || []);

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bitcoin Learning Modules - Offline Deck</title>
  <link rel="stylesheet" href="runtime/class.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #e9ecef;
      color: #161616;
    }
    .player-page {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }
    .player-header {
      height: 56px;
      background: #ffffff;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      flex-shrink: 0;
      z-index: 10;
    }
    .player-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
    }
    .player-title strong {
      font-size: 16px;
      color: #161616;
    }
    .player-meta {
      font-size: 13px;
      color: #666666;
    }
    .player-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid #d0d0d0;
      background: #ffffff;
      color: #161616;
      transition: all 0.15s;
    }
    .btn:hover {
      background: #f5f5f5;
    }
    .btn-primary {
      background: #FA5D32;
      border-color: #FA5D32;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #e04b22;
    }
    .player-content-area {
      flex: 1;
      display: flex;
      overflow: hidden;
      position: relative;
    }
    .player-sidebar {
      width: 220px;
      flex-shrink: 0;
      overflow-y: auto;
      border-right: 1px solid #ddd;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #f8f9fa;
    }
    .thumbnail-item {
      display: flex;
      gap: 8px;
      cursor: pointer;
      border-radius: 6px;
    }
    .thumbnail-number {
      font-size: 12px;
      font-weight: bold;
      width: 20px;
      text-align: right;
      margin-top: 2px;
      color: #888;
    }
    .thumbnail-item.active .thumbnail-number {
      color: #FA5D32;
    }
    .thumbnail-frame-wrapper {
      position: relative;
      width: 160px;
      height: 90px;
      border-radius: 6px;
      overflow: hidden;
      background: white;
      border: 1px solid #ddd;
      box-sizing: border-box;
      transition: border 0.15s;
    }
    .thumbnail-item.active .thumbnail-frame-wrapper {
      border: 3px solid #FA5D32;
    }
    .thumbnail-frame-wrapper iframe {
      width: 1600px;
      height: 900px;
      transform: scale(0.1);
      transform-origin: top left;
      pointer-events: none;
      border: none;
    }
    .thumbnail-overlay {
      position: absolute;
      inset: 0;
      z-index: 5;
    }
    .player-main-view {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e9ecef;
      overflow: hidden;
      padding: 24px;
    }
    .player-main-view-inner {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .active-slide-wrapper {
      aspect-ratio: 16 / 9;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      position: relative;
      background: transparent;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      border-radius: 12px;
      overflow: hidden;
    }
    .active-slide-wrapper:fullscreen {
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      background: #000000 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
    .active-slide-wrapper iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
    @media print {
      .player-header, .player-sidebar { display: none !important; }
      .player-main-view { padding: 0 !important; background: transparent !important; }
      .active-slide-wrapper { box-shadow: none !important; border-radius: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="player-page">
    <header class="player-header">
      <div class="player-title">
        <strong>Bitcoin Learning Modules (Offline Deck)</strong>
        <span class="player-meta" id="slide-counter"></span>
      </div>
      <div class="player-actions">
        <button class="btn" onclick="prevSlide()">◀ ก่อนหน้า</button>
        <button class="btn" onclick="nextSlide()">ถัดไป ▶</button>
        <button class="btn" id="fs-btn" onclick="toggleFullscreen()">⛶ เต็มจอ</button>
      </div>
    </header>

    <div class="player-content-area">
      <aside class="player-sidebar" id="thumbnail-sidebar"></aside>
      <main class="player-main-view">
        <div class="player-main-view-inner">
          <div class="active-slide-wrapper">
            <iframe id="main-slide-frame" title="Active Slide"></iframe>
          </div>
        </div>
      </main>
    </div>
  </div>

  <script id="deck-data" type="application/json">
    ${slidesJson.replace(/<\/script>/gi, '<\\/script>')}
  </script>

  <script>
    const headTemplate = ${safeHead};
    const tailTemplate = ${safeTail};
    const slides = JSON.parse(document.getElementById('deck-data').textContent);
    let currentIndex = 0;

    const sidebar = document.getElementById('thumbnail-sidebar');
    const mainFrame = document.getElementById('main-slide-frame');
    const counter = document.getElementById('slide-counter');

    function renderThumbnails() {
      sidebar.innerHTML = '';
      slides.forEach((slideHtml, idx) => {
        const item = document.createElement('div');
        item.className = 'thumbnail-item' + (idx === currentIndex ? ' active' : '');
        item.id = 'thumb-' + idx;
        item.onclick = () => goToSlide(idx);

        const num = document.createElement('span');
        num.className = 'thumbnail-number';
        num.textContent = idx + 1;

        const frameWrapper = document.createElement('div');
        frameWrapper.className = 'thumbnail-frame-wrapper';

        const ifr = document.createElement('iframe');
        ifr.srcdoc = headTemplate + slideHtml + tailTemplate;
        ifr.loading = 'lazy';
        ifr.tabIndex = -1;

        const overlay = document.createElement('div');
        overlay.className = 'thumbnail-overlay';

        frameWrapper.appendChild(ifr);
        frameWrapper.appendChild(overlay);
        item.appendChild(num);
        item.appendChild(frameWrapper);
        sidebar.appendChild(item);
      });
    }

    function goToSlide(idx) {
      if (idx < 0 || idx >= slides.length) return;
      currentIndex = idx;
      mainFrame.srcdoc = headTemplate + slides[currentIndex] + tailTemplate;
      counter.textContent = '(' + (currentIndex + 1) + ' / ' + slides.length + ')';

      document.querySelectorAll('.thumbnail-item').forEach((el, i) => {
        el.classList.toggle('active', i === currentIndex);
      });

      const activeThumb = document.getElementById('thumb-' + currentIndex);
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function nextSlide() {
      goToSlide(Math.min(currentIndex + 1, slides.length - 1));
    }

    function prevSlide() {
      goToSlide(Math.max(currentIndex - 1, 0));
    }

    function toggleFullscreen() {
      const wrapper = document.querySelector('.active-slide-wrapper');
      if (!document.fullscreenElement) {
        (wrapper || document.documentElement).requestFullscreen().catch(console.error);
      } else {
        document.exitFullscreen().catch(console.error);
      }
    }

    document.addEventListener('fullscreenchange', () => {
      const fsBtn = document.getElementById('fs-btn');
      if (fsBtn) {
        fsBtn.textContent = document.fullscreenElement ? '⛶ ออกจากเต็มจอ' : '⛶ เต็มจอ';
      }
    });

    let lastWheelTime = 0;
    function handleWheelDelta(deltaY) {
      const now = Date.now();
      if (now - lastWheelTime < 200) return; // throttle trackpad inertia
      lastWheelTime = now;
      if (deltaY > 0) {
        nextSlide();
      } else if (deltaY < 0) {
        prevSlide();
      }
    }

    const mainViewArea = document.querySelector('.player-main-view');
    if (mainViewArea) {
      mainViewArea.addEventListener('wheel', (e) => {
        handleWheelDelta(e.deltaY);
        e.preventDefault();
      }, { passive: false });
    }

    window.addEventListener('keydown', (e) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
        nextSlide();
        e.preventDefault();
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        prevSlide();
        e.preventDefault();
      }
    });

    window.addEventListener('message', (e) => {
      if (e.data?.type === 'WHEEL') {
        handleWheelDelta(e.data.deltaY);
      } else if (e.data?.type === 'KEYDOWN') {
        const key = e.data.key;
        if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(key)) {
          nextSlide();
        } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(key)) {
          prevSlide();
        }
      }
    });

    renderThumbnails();
    goToSlide(0);
  </script>
</body>
</html>`;
}

export async function createOfflineZip(
  deck: ComposedDeck, 
  releaseId: string, 
  baseUrl: string = '',
  onProgress?: ZipProgressCallback
): Promise<Blob> {
  const zip = new JSZip();
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  // 1. Generate full offline player index.html (with sidebar thumbnails & presentation view)
  const offlineHtml = buildOfflinePlayerHtml(deck, releaseId);
  zip.file('index.html', offlineHtml);
  
  const totalItems = deck.assets.length + deck.runtimeFiles.length;
  let processedItems = 0;

  // 2. Fetch and add runtime files first
  for (const runtimeFile of deck.runtimeFiles) {
    if (onProgress) {
      onProgress(processedItems, totalItems, `กำลังดาวน์โหลดไฟล์ระบบ (${runtimeFile})...`);
    }
    const res = await fetch(`${cleanBase}releases/${releaseId}/${runtimeFile}`);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      zip.file(runtimeFile, buffer);
    }
    processedItems++;
  }

  // 3. Fetch and add all assets
  for (const assetPath of deck.assets) {
    if (onProgress) {
      const filename = assetPath.split('/').pop() || assetPath;
      onProgress(processedItems, totalItems, `กำลังดาวน์โหลดรูปภาพ (${filename})...`);
    }
    const res = await fetch(`${cleanBase}releases/${releaseId}/${assetPath}`);
    if (!res.ok) {
      throw new Error(`Unable to download asset ${assetPath}`);
    }
    const buffer = await res.arrayBuffer();
    zip.file(assetPath, buffer);
    processedItems++;
  }

  if (onProgress) {
    onProgress(totalItems, totalItems, 'กำลังบีบอัดไฟล์ ZIP...');
  }

  return await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

