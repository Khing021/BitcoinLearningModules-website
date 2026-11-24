import { useState, useEffect, useRef } from 'react';
import type { Release } from '../lib/contracts';
import { composeDeck } from '../lib/composer';
import type { ComposedDeck } from '../lib/composer';
import { createOfflineZip, triggerDownload } from '../lib/zip';
import { downloadSelectionJson, parseSelectionFile } from '../lib/selection';
import { parseQuery } from '../lib/query';
import { Link, useLocation } from 'react-router-dom';

export default function Builder({ release }: { release: Release }) {
  const location = useLocation();
  const [selectedUnits, setSelectedUnits] = useState<string[]>(() => {
    return parseQuery(release, window.location.search || location.search);
  });
  const [previewMode, setPreviewMode] = useState<'class' | 'guide'>('class');
  const [deck, setDeck] = useState<ComposedDeck | null>(null);
  const [deckHtml, setDeckHtml] = useState<string>('');
  const [zipProgress, setZipProgress] = useState<string | null>(null);
  
  // Track selection state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileUnitsOpen, setIsMobileUnitsOpen] = useState(false);

  useEffect(() => {
    if (selectedUnits.length > 0) {
      composeDeck(release, selectedUnits, previewMode, import.meta.env.BASE_URL)
        .then(res => {
          setDeck(res);
          setDeckHtml(res.html);
        })
        .catch(console.error);
    } else {
      setDeck(null);
      setDeckHtml('');
    }
  }, [release, selectedUnits, previewMode]);

  // Load from URL initially or on route navigation
  useEffect(() => {
    const units = parseQuery(release, location.search);
    if (units.length > 0) {
      setSelectedUnits(units);
    }
  }, [release, location.search]);

  // Keep URL in sync silently for easy copy-pasting
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.href) return;
    try {
      const url = new URL(window.location.href);
      if (selectedUnits.length > 0) {
        url.searchParams.set('units', selectedUnits.join(','));
      } else {
        url.searchParams.delete('units');
      }
      window.history.replaceState({}, '', url);
    } catch {
      // In testing environments where location href might not be fully formed
    }
  }, [selectedUnits]);

  const toggleUnit = (unitId: string) => {
    setSelectedUnits(prev => {
      const next = prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId];
      return next.sort((a, b) => release.units.findIndex(u => u.unitId === a) - release.units.findIndex(u => u.unitId === b));
    });
  };

  const toggleChapter = (chapterUnits: typeof release.units, isAllSelected: boolean) => {
    if (isAllSelected) {
      const unitIdsToRemove = chapterUnits.map(u => u.unitId);
      setSelectedUnits(prev => prev.filter(id => !unitIdsToRemove.includes(id)));
    } else {
      const unitIdsToAdd = chapterUnits.map(u => u.unitId);
      setSelectedUnits(prev => {
        const next = Array.from(new Set([...prev, ...unitIdsToAdd]));
        return next.sort((a, b) => release.units.findIndex(u => u.unitId === a) - release.units.findIndex(u => u.unitId === b));
      });
    }
  };

  const clearAll = () => setSelectedUnits([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    if (selectedUnits.length === 0) return;
    downloadSelectionJson(release.info.releaseId, selectedUnits);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const importedUnits = parseSelectionFile(release, text);
        setSelectedUnits(importedUnits);
        setIsDrawerOpen(false);
      } catch (err: any) {
        alert(`ไม่สามารถนำเข้าไฟล์ได้: ${err.message || 'รูปแบบไฟล์ไม่ถูกต้อง'}`);
      }
    };
    reader.onerror = () => {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
    };
    reader.readAsText(file);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('คัดลอกลิงก์สำเร็จ! สามารถส่งลิงก์นี้เพื่อแชร์ชุดสไลด์ได้เลย');
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '0 นาที';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours} ชั่วโมง ${mins} นาที (${minutes} นาที)`;
    } else if (hours > 0) {
      return `${hours} ชั่วโมง (${minutes} นาที)`;
    } else {
      return `${mins} นาที`;
    }
  };

  const totalMinutes = release.units
    .filter(u => selectedUnits.includes(u.unitId))
    .reduce((sum, u) => sum + u.durationMinutes, 0);

  const totalSlides = release.units
    .filter(u => selectedUnits.includes(u.unitId))
    .reduce((sum, u) => sum + (u.slideCount || 1), 0);

  // Group by chapter (fallback to "บทเรียนทั้งหมด" if undefined)
  const groupedUnits = release.units.reduce((acc, unit) => {
    const chapter = (unit as any).chapter || 'บทเรียนทั้งหมด';
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push(unit);
    return acc;
  }, {} as Record<string, typeof release.units>);

  // Determine active track name based on exact unit match
  const getActiveTrackName = () => {
    const currentUnitsStr = [...selectedUnits].sort().join(',');
    for (const track of release.tracks) {
      const trackUnitsStr = [...new Set(track.unitIds)].sort().join(',');
      if (currentUnitsStr === trackUnitsStr) {
        return track.name;
      }
    }
    return 'กำหนดเอง (Custom)';
  };

  const activeTrackName = getActiveTrackName();

  const handleDownloadZip = async () => {
    if (!deck || selectedUnits.length === 0) return;
    try {
      setZipProgress('เตรียมสร้างไฟล์...');
      const blob = await createOfflineZip(
        deck,
        release.info.releaseId,
        import.meta.env.BASE_URL,
        (_current, _total, status) => setZipProgress(status)
      );
      const filename = `bitcoin-${previewMode}-deck-${release.info.releaseId}.zip`;
      triggerDownload(blob, filename);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการดาวน์โหลด ZIP: ${err.message}`);
    } finally {
      setZipProgress(null);
    }
  };

  const handleApplyPreset = (trackId: string) => {
    const track = release.tracks.find(t => t.trackId === trackId);
    if (!track) return;
    
    // Only require confirmation if user already has non-empty custom selection that would be replaced
    if (selectedUnits.length > 0) {
      const isAlreadySame = 
        selectedUnits.length === track.unitIds.length &&
        track.unitIds.every(id => selectedUnits.includes(id));
        
      if (!isAlreadySame && !window.confirm('กำลังจะแทนที่รายการยูนิตที่เลือกไว้ทั้งหมดด้วยแผนนี้ ยืนยันหรือไม่?')) {
        return;
      }
    }
    
    setSelectedUnits([...new Set(track.unitIds)]);
    setIsDrawerOpen(false);
  };

  return (
    <div className="builder-layout">
      {/* Mobile Drawer Backdrop for Units */}
      {isMobileUnitsOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setIsMobileUnitsOpen(false)} />
      )}

      {/* Left Rail: Selection */}
      <aside className={`builder-sidebar ${isMobileUnitsOpen ? 'mobile-open' : ''}`}>
        <div className="mobile-sidebar-close">
          <h3>เลือกเนื้อหายูนิต</h3>
          <button className="drawer-close-btn" onClick={() => setIsMobileUnitsOpen(false)}>✕</button>
        </div>

        <div className="track-selector">
          <button 
            className="track-toggle" 
            onClick={() => setIsDrawerOpen(true)}
            title="คลิกเพื่อเลือกแผนการสอนมาตรฐาน"
          >
            <span>แผน: <span className="track-badge">{activeTrackName}</span></span>
            <span style={{ fontSize: '0.85rem' }}>เปลี่ยน ❯</span>
          </button>
        </div>
        
        <div className="sidebar-header">
          <h2>จัดชุดการสอน</h2>
          {selectedUnits.length > 0 && (
            <button className="btn-text" onClick={clearAll}>ล้างทั้งหมด</button>
          )}
        </div>

        <div className="units-list">
          {Object.entries(groupedUnits).map(([chapterName, units]) => {
            const selectedInChapter = units.filter(u => selectedUnits.includes(u.unitId)).length;
            const isAllSelected = selectedInChapter === units.length && units.length > 0;
            
            return (
              <details key={chapterName} className="chapter-accordion">
                <summary>
                  <div className="chapter-summary-left">
                    <input 
                      type="checkbox" 
                      className="chapter-checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) {
                          input.indeterminate = selectedInChapter > 0 && selectedInChapter < units.length;
                        }
                      }}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleChapter(units, isAllSelected);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <strong>{chapterName}</strong>
                  </div>
                  <span className="chapter-meta">
                    {selectedInChapter > 0 ? `(${selectedInChapter}/${units.length})` : `(${units.length})`}
                  </span>
                </summary>
                <div className="chapter-units">
                  {units.map(unit => (
                    <label key={unit.unitId} className="unit-item">
                      <input 
                        type="checkbox" 
                        checked={selectedUnits.includes(unit.unitId)}
                        onChange={() => toggleUnit(unit.unitId)}
                      />
                      <span className="unit-title">{unit.title}</span>
                      <span className="unit-meta">{unit.durationMinutes} นาที</span>
                    </label>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </aside>

      {/* Right Workspace: Preview & Actions */}
      <main className="builder-main">
        <header className="builder-main-header">
          <div className="summary">
            <h3>{selectedUnits.length > 0 ? 'ชุดที่เลือก' : 'ยังไม่ได้เลือก'}</h3>
            <p>
              <span>{selectedUnits.length} ยูนิต • {totalSlides} สไลด์ • {formatDuration(totalMinutes)}</span>
              <span className="info-tooltip-wrapper">
                <button 
                  type="button" 
                  className="info-tooltip-trigger" 
                  aria-label="คำอธิบายเวลาที่แสดง"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </button>
                <span className="info-tooltip-bubble" role="tooltip">
                  เวลาที่แสดงเป็นเพียงการประมาณ ผู้สอนแต่ละคนอาจใช้เวลาไม่เท่ากัน ส่วนใหญ่ถูกกำหนดไว้ที่ 3 นาทีต่อสไลด์ ดูเวลาที่แนะนำของแต่ละสไลด์ได้ในคู่มือครู
                </span>
              </span>
            </p>
          </div>
          <div className="actions">
            {/* Mobile Trigger for Unit Drawer */}
            <button 
              className="btn btn-outline mobile-units-btn" 
              onClick={() => setIsMobileUnitsOpen(true)}
            >
              📋 เลือกยูนิต ({selectedUnits.length})
            </button>
            
            <div className="segmented-tabs">
              <button 
                className={previewMode === 'class' ? 'active' : ''} 
                onClick={() => setPreviewMode('class')}
              >
                สไลด์สอน (Class)
              </button>
              <button 
                className={previewMode === 'guide' ? 'active' : ''} 
                onClick={() => setPreviewMode('guide')}
              >
                คู่มือครู (Guide)
              </button>
            </div>

            <button 
              className="btn btn-outline" 
              onClick={copyUrl} 
              disabled={selectedUnits.length === 0}
            >
              คัดลอกลิงก์
            </button>

            <button 
              className="btn btn-outline" 
              onClick={handleExportJson} 
              disabled={selectedUnits.length === 0}
              title="ส่งออกรายการยูนิตที่เลือกเป็นไฟล์ JSON"
            >
              ส่งออก JSON
            </button>

            <button 
              className="btn btn-outline" 
              onClick={handleImportClick}
              title="นำเข้าไฟล์ JSON เพื่อโหลดรายการยูนิต"
            >
              นำเข้า JSON
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".json,application/json" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            
            <button 
              className="btn btn-outline" 
              onClick={handleDownloadZip} 
              disabled={selectedUnits.length === 0 || !deck || zipProgress !== null}
            >
              {zipProgress ? zipProgress : 'โหลด ZIP'}
            </button>

            <Link 
              to={`/${previewMode}?release=${release.info.releaseId}&units=${selectedUnits.join(',')}`}
              target="_blank"
              className={`btn btn-primary ${selectedUnits.length === 0 ? 'disabled' : ''}`}
              onClick={(e) => { if(selectedUnits.length === 0) e.preventDefault(); }}
            >
              เปิดเต็มจอ
            </Link>
          </div>
        </header>

        <div className="preview-area">
          {selectedUnits.length === 0 ? (
            <div className="empty-preview">
              <p>กรุณาเลือกยูนิตด้านซ้ายเพื่อดูตัวอย่างสไลด์</p>
            </div>
          ) : (
            <iframe 
              srcDoc={deckHtml} 
              className="deck-iframe"
              title="Deck Preview"
              style={{ display: 'block' }}
            />
          )}
        </div>
      </main>

      {/* Preset Track Drawer Overlay */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>เลือกแผนการสอนมาตรฐาน (Tracks)</h3>
              <button 
                className="drawer-close-btn" 
                onClick={() => setIsDrawerOpen(false)}
                title="ปิด"
              >
                ✕
              </button>
            </div>
            
            <div className="drawer-content">
              {release.tracks.map(track => {
                const trackUnitsStr = [...new Set(track.unitIds)].sort().join(',');
                const currentUnitsStr = [...selectedUnits].sort().join(',');
                const isSelected = trackUnitsStr === currentUnitsStr;

                const trackDuration = release.units
                  .filter(u => track.unitIds.includes(u.unitId))
                  .reduce((sum, u) => sum + u.durationMinutes, 0);

                const audience = track.targetAudience || (track.trackId === 'beginner-intro' ? 'ผู้เริ่มต้น ผู้สนใจทั่วไป' : 'ผู้ต้องการเรียนรู้ครอบคลุมทุกมิติ');
                const outcome = track.learningOutcome || (track.trackId === 'beginner-intro' ? 'เข้าใจวิวัฒนาการของเงินและคอนเซ็ปต์เบื้องต้นของบิตคอยน์' : 'เข้าใจประวัติศาสตร์ เทคนิค นวัตกรรม และมิติต่างๆ ของบิตคอยน์ครบวงจร');

                return (
                  <div key={track.trackId} className={`track-card ${isSelected ? 'active' : ''}`}>
                    <div className="track-card-header">
                      <h4 className="track-card-title">{track.name}</h4>
                      {isSelected && <span className="track-card-badge">กำลังใช้งาน</span>}
                    </div>

                    <div className="track-card-meta">
                      <span>📚 {track.unitIds.length} ยูนิต</span>
                      <span>⏱️ รวม ~{formatDuration(trackDuration)}</span>
                    </div>

                    {track.description && (
                      <p className="track-card-desc">{track.description}</p>
                    )}

                    <div className="track-card-detail">
                      <p><strong>🎯 กลุ่มเป้าหมาย:</strong> {audience}</p>
                      <p><strong>💡 สิ่งที่จะได้เรียนรู้:</strong> {outcome}</p>
                    </div>

                    <div className="track-card-action">
                      <button 
                        className={`btn ${isSelected ? 'btn-outline disabled' : 'btn-primary'}`}
                        onClick={() => handleApplyPreset(track.trackId)}
                        disabled={isSelected}
                      >
                        {isSelected ? 'กำลังใช้งานแผนนี้' : 'ใช้แผนนี้'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
