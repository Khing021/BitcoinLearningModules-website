import type { Release } from '../lib/contracts';
import { Link } from 'react-router-dom';

export default function Home({ release }: { release: Release }) {
  const totalDuration = release.units.reduce((sum, u) => sum + u.durationMinutes, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMins = totalDuration % 60;

  return (
    <div className="home-page-modern">
      {/* 1. Project Statement / Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pill">ชุดสื่อการสอนบิตคอยน์ภาษาไทยแบบเปิด (Open Educational Resources)</div>
          <h1 className="hero-title">
            สื่อการสอนบิตคอยน์มาตรฐาน <br/>
            <span className="text-highlight">ปรับแต่งและประกอบชุดได้ตามใจคุณ</span>
          </h1>
          <p className="hero-subtitle">
            สร้างสรรค์โดยชุมชน Right Shift เพื่อสนับสนุนคุณครู ผู้จัดสัมมนา และผู้เรียนรู้ทั่วประเทศ 
            ให้มีสไลด์การสอนคุณภาพสูง ครอบคลุมตั้งแต่ประวัติศาสตร์จนถึงเทคนิคเชิงลึก พร้อมนำไปใช้สอนได้ทันที
          </p>
          <div className="hero-actions">
            <Link to="/builder" className="btn btn-primary btn-large">เริ่มจัดชุดการสอน</Link>
            <Link to="/about" className="btn btn-outline btn-large">เกี่ยวกับโครงการ</Link>
          </div>
        </div>
      </section>

      {/* 2. Course-System Evidence / Live Metadata */}
      <section className="evidence-section">
        <div className="container">
          <div className="evidence-grid">
            <div className="evidence-card">
              <span className="evidence-num">{release.units.length}</span>
              <span className="evidence-label">ยูนิตเนื้อหาครอบคลุม</span>
              <span className="evidence-sub">รวม ~{totalHours} ชม. {totalMins > 0 ? `${totalMins} นาที` : ''}</span>
            </div>
            <div className="evidence-card">
              <span className="evidence-num">{release.tracks.length}</span>
              <span className="evidence-label">แผนการสอนมาตรฐาน (Tracks)</span>
              <span className="evidence-sub">เลือกใช้ได้ทันทีในคลิกเดียว</span>
            </div>
            <div className="evidence-card">
              <span className="evidence-num">2</span>
              <span className="evidence-label">รูปแบบสไลด์คู่ขนาน</span>
              <span className="evidence-sub">Class Deck & Guide Deck</span>
            </div>
            <div className="evidence-card">
              <span className="evidence-num">100%</span>
              <span className="evidence-label">รองรับการใช้งานออฟไลน์</span>
              <span className="evidence-sub">ดาวน์โหลด ZIP ไปเปิดได้ทุกที่</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (3 Steps) */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">ใช้งานง่ายๆ ใน 3 ขั้นตอน</h2>
          <div className="steps-wrapper">
            <div className="step-item">
              <div className="step-number-large">1</div>
              <h3>เลือกยูนิต หรือ แผนสำเร็จรูป</h3>
              <p>เลือกยูนิตที่ต้องการสอนตามเวลาที่มี หรือกดเลือกแผนแนะนำ เช่น สำหรับผู้เริ่มต้น</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number-large">2</div>
              <h3>ตรวจสอบสไลด์สด</h3>
              <p>ดูหน้าจอจำลอง (Live Preview) ตรวจสอบความต่อเนื่องทั้งสไลด์สอนและคู่มือครู</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number-large">3</div>
              <h3>เปิดฉาย หรือ โหลด Offline</h3>
              <p>เปิดสไลด์สอนเต็มจอผ่านเว็บได้ทันที หรือดาวน์โหลดเป็นไฟล์ ZIP สำหรับสถานที่ไร้เน็ต</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Teaching-Material Relationship (Class vs Guide) */}
      <section className="deck-types-section">
        <div className="container">
          <h2 className="section-title">สื่อการสอน 2 รูปแบบ ออกแบบมาคู่กัน</h2>
          <div className="deck-types-grid">
            <div className="deck-card deck-card-class">
              <div className="deck-tag">สำหรับฉายหน้าห้อง</div>
              <h3>สไลด์การสอน (Class Deck)</h3>
              <p>
                ออกแบบด้วยอัตราส่วน 16:9 สวยงาม สะอาดตา เน้นภาพประกอบ ไดอะแกรม และข้อความกระชับ 
                เพื่อดึงดูดความสนใจและทำให้ผู้ฟังมองเห็นประเด็นสำคัญได้อย่างชัดเจน
              </p>
              <ul className="deck-features">
                <li>✓ สไลด์ภาพและเนื้อหากระชับ</li>
                <li>✓ รองรับการควบคุมด้วยคีย์บอร์ดและลูกกลิ้งเมาส์</li>
                <li>✓ แสดงผลคมชัดในจอโปรเจกเตอร์ทุกความละเอียด</li>
              </ul>
            </div>
            <div className="deck-card deck-card-guide">
              <div className="deck-tag">สำหรับผู้สอน</div>
              <h3>คู่มือผู้สอน (Guide Deck)</h3>
              <p>
                คู่มือสไลด์ต่อสไลด์สำหรับผู้สอน มาพร้อมบทบรรยาย (Narration), คำอธิบายเชิงลึก, 
                คำถามชวนคิด และแหล่งอ้างอิง ช่วยให้ผู้สอนถ่ายทอดเนื้อหาได้อย่างมั่นใจแม้สอนเป็นครั้งแรก
              </p>
              <ul className="deck-features">
                <li>✓ ลำดับสไลด์ตรงกับ Class Deck 100%</li>
                <li>✓ มี Talking Points และคำอธิบายเบื้องหลัง</li>
                <li>✓ คำถามประเมินความเข้าใจและคีย์เวิร์ดสำคัญ</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="site-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <h2>Bitcoin Learning Modules</h2>
            <p>เวอร์ชันชุดข้อมูล: {release.info.releaseId}</p>
            <p>สถานะลิขสิทธิ์: {release.info.licenseStatus === 'pending-legal-review' ? 'รอพิจารณาด้านกฎหมาย (CC-BY-SA 4.0 Planned)' : release.info.licenseStatus}</p>
          </div>
          <div className="footer-links">
            <h3>การมีส่วนร่วม</h3>
            <p>โปรเจกต์นี้เปิดกว้างเพื่อทุกคน ขับเคลื่อนโดยชุมชน Right Shift คุณสามารถร่วมแก้ไขและปรับปรุงเนื้อหาได้</p>
            <div style={{ marginTop: '0.8rem', display: 'flex', gap: '1.2rem' }}>
              <Link to="/about" className="footer-link">📖 เกี่ยวกับโครงการ</Link>
              <a href="https://github.com/RightShiftSpace/BitcoinLearningModules" target="_blank" rel="noreferrer" className="footer-link">💻 GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Bitcoin Learning Modules. Open-source educational project by Right Shift community.</p>
        </div>
      </footer>
    </div>
  );
}
