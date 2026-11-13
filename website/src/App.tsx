import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useParams, Navigate } from 'react-router-dom';
import './App.css';
import { loadRelease } from './lib/release';
import type { Release } from './lib/contracts';
import Home from './pages/Home';
import Builder from './pages/Builder';
import Player from './pages/Player';
import About from './pages/About';

function LegacyTrackRedirect({ release }: { release: Release }) {
  const { trackId } = useParams<{ trackId: string }>();
  const track = release.tracks.find(t => t.trackId === trackId);
  if (track && track.unitIds.length > 0) {
    return <Navigate to={`/builder?units=${track.unitIds.join(',')}`} replace />;
  }
  return <Navigate to="/builder" replace />;
}

function App() {
  const [release, setRelease] = useState<Release | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    loadRelease(import.meta.env.BASE_URL)
      .then(setRelease)
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div className="error-container">ข้อผิดพลาดในการโหลดข้อมูล: {error}</div>;
  if (!release) return <div className="loading-container">กำลังโหลดข้อมูล...</div>;

  const isPlayerMode = location.pathname === '/class' || location.pathname === '/guide';

  return (
    <div className="app-container">
      {!isPlayerMode && (
        <header className="app-header">
          <Link to="/" className="brand-logo">Bitcoin Learning Modules</Link>
          <nav>
            <Link to="/">หน้าแรก</Link>
            <Link to="/about">เกี่ยวกับโครงการ</Link>
            <Link to="/builder" className="btn btn-primary">จัดชุดการสอน</Link>
          </nav>
        </header>
      )}
      
      <main className={`main-content ${isPlayerMode ? 'player-mode' : ''}`}>
        <Routes>
          <Route path="/" element={<Home release={release} />} />
          <Route path="/builder" element={<Builder release={release} />} />
          <Route path="/about" element={<About release={release} />} />
          <Route path="/tracks/:trackId" element={<LegacyTrackRedirect release={release} />} />
          <Route path="/class" element={<Player release={release} mode="class" />} />
          <Route path="/guide" element={<Player release={release} mode="guide" />} />
          {/* Legacy fallback */}
          <Route path="/player" element={<Player release={release} mode="class" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
