import { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import type { Release } from '../lib/contracts';
import { parseQuery } from '../lib/query';
import { composeDeck } from '../lib/composer';
import type { ComposedDeck } from '../lib/composer';
import { createOfflineZip, triggerDownload } from '../lib/zip';

export default function Player({ release, mode }: { release: Release, mode: 'class' | 'guide' }) {
  const location = useLocation();
  const [deck, setDeck] = useState<ComposedDeck | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zipProgress, setZipProgress] = useState<string | null>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastWheelTime = useRef<number>(0);
  const activeSlideWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      activeSlideWrapperRef.current?.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  const selectedUnits = useMemo(() => {
    return parseQuery(release, location.search);
  }, [release, location.search]);

  const handleDownloadZip = async () => {
    if (!deck || selectedUnits.length === 0) return;
    try {
      setZipProgress('กำลังเตรียม...');
      const blob = await createOfflineZip(
        deck,
        release.info.releaseId,
        import.meta.env.BASE_URL,
        (_current, _total, status) => setZipProgress(status)
      );
      const filename = `bitcoin-${mode}-deck-${release.info.releaseId}.zip`;
      triggerDownload(blob, filename);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการดาวน์โหลด ZIP: ${err.message}`);
    } finally {
      setZipProgress(null);
    }
  };

  // Is it loaded in an iframe preview?
  const isPreview = new URLSearchParams(location.search).get('preview') === 'true';

  useEffect(() => {
    if (selectedUnits.length > 0) {
      composeDeck(release, selectedUnits, mode, import.meta.env.BASE_URL, !isPreview)
        .then(res => {
          setDeck(res);
          setCurrentSlideIndex(0);
        })
        .catch(console.error);
    }
  }, [release, selectedUnits, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!deck || deck.slides.length === 0) return;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
        setCurrentSlideIndex(prev => Math.min(prev + 1, deck.slides.length - 1));
        e.preventDefault();
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!deck || deck.slides.length === 0) return;
      if (e.data?.type === 'WHEEL') {
        const now = Date.now();
        if (now - lastWheelTime.current < 200) return; // throttle trackpad inertia
        lastWheelTime.current = now;
        
        if (e.data.deltaY > 0) {
          setCurrentSlideIndex(prev => Math.min(prev + 1, deck.slides.length - 1));
        } else if (e.data.deltaY < 0) {
          setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
        }
      } else if (e.data?.type === 'KEYDOWN') {
        const key = e.data.key;
        if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(key)) {
          setCurrentSlideIndex(prev => Math.min(prev + 1, deck.slides.length - 1));
        } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(key)) {
          setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [deck]);

  useEffect(() => {
    if (thumbnailRefs.current[currentSlideIndex]) {
      thumbnailRefs.current[currentSlideIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentSlideIndex]);

  if (selectedUnits.length === 0) {
    return <div style={{padding: '2rem'}}>ไม่มียูนิตที่ถูกเลือก</div>;
  }

  if (!deck) {
    return <div style={{padding: '2rem'}}>กำลังประมวลผลสไลด์...</div>;
  }

  // Fallback for Builder previews without UI
  if (isPreview) {
    return (
      <iframe 
        title="Deck Player" 
        srcDoc={deck.html}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    );
  }

  return (
    <div className="player-page" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: '#e9ecef' }}>
      <header className="player-header">
        <div className="player-title">
          <strong>{mode === 'class' ? 'Class Deck' : 'Guide Deck'}</strong>
          <span className="player-meta">({selectedUnits?.length || 0} ยูนิต - {deck.slides?.length || 0} สไลด์)</span>
        </div>
        <div className="player-actions">
          <Link to={`/builder?units=${selectedUnits.join(',')}`} className="btn btn-secondary">กลับไปที่ Builder</Link>
          <button className="btn btn-secondary" onClick={toggleFullscreen}>
            {isFullscreen ? '⛶ ออกจากเต็มจอ' : '⛶ เต็มจอ'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleDownloadZip}
            disabled={zipProgress !== null}
          >
            {zipProgress ? zipProgress : 'ดาวน์โหลด Offline ZIP'}
          </button>
        </div>
      </header>
      
      <div className="player-content-area" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <aside className="player-sidebar" style={{ width: '220px', flexShrink: 0, overflowY: 'auto', borderRight: '1px solid #ddd', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8f9fa' }}>
          {deck.slides.map((slide, idx) => (
            <div 
              key={idx} 
              className={`thumbnail-item ${idx === currentSlideIndex ? 'active' : ''}`}
              onClick={() => setCurrentSlideIndex(idx)}
              ref={el => { thumbnailRefs.current[idx] = el; }}
              style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}
            >
              <span className="thumbnail-number" style={{ fontSize: '12px', fontWeight: 'bold', width: '20px', textAlign: 'right', marginTop: '2px' }}>{idx + 1}</span>
              <div className="thumbnail-frame-wrapper" style={{ position: 'relative', width: '160px', height: '90px', borderRadius: '6px', overflow: 'hidden', background: 'white', border: idx === currentSlideIndex ? '3px solid var(--primary-color)' : '1px solid #ddd', boxSizing: 'border-box' }}>
                <iframe srcDoc={deck.headHtml + slide + deck.tailHtml} tabIndex={-1} scrolling="no" loading="lazy" style={{ width: '1600px', height: '900px', transform: 'scale(0.09625)', transformOrigin: 'top left', pointerEvents: 'none', border: 'none' }} />
                <div className="thumbnail-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}></div>
              </div>
            </div>
          ))}
        </aside>
        
        <main className="player-main-view" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e9ecef', overflow: 'hidden', padding: '24px' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div 
              ref={activeSlideWrapperRef} 
              className="active-slide-wrapper" 
              style={{ 
                aspectRatio: '16/9', 
                height: isFullscreen ? '100vh' : '100%', 
                width: isFullscreen ? '100vw' : 'auto',
                maxWidth: '100%', 
                maxHeight: '100%', 
                position: 'relative', 
                background: isFullscreen ? '#000000' : 'transparent', 
                boxShadow: isFullscreen ? 'none' : '0 10px 30px rgba(0,0,0,0.15)', 
                borderRadius: isFullscreen ? '0' : '12px', 
                overflow: 'hidden' 
              }}
            >
               <iframe 
                 title={`Slide ${currentSlideIndex + 1}`}
                 srcDoc={deck.headHtml + deck.slides[currentSlideIndex] + deck.tailHtml}
                 style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
               />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
