import type { Release } from '../lib/contracts';
import { Link } from 'react-router-dom';

export default function About({ release }: { release: Release }) {
  return (
    <div className="about-page">
      <div className="about-container">
        <header className="about-header">
          <div className="about-pill">เกี่ยวกับโครงการ (About Project)</div>
          <h1>Bitcoin Learning Modules</h1>
          <p className="about-lead">
            ชุดสื่อการสอนบิตคอยน์ภาษาไทยแบบเปิด (Open Educational Resources) ที่ออกแบบมาเพื่อสนับสนุนนักการศึกษา 
            ผู้จัดอบรม และผู้ที่ต้องการส่งต่อความรู้ที่ถูกต้อง ปราศจากอคติ และไม่มีผลประโยชน์ทับซ้อน
          </p>
        </header>

        <section className="about-section">
          <h2>🎯 พันธกิจและจุดเริ่มต้น (Mission & Background)</h2>
          <p>
            ในปัจจุบัน ความรู้เกี่ยวกับ Bitcoin ในประเทศไทยยังกระจัดกระจายและมักถูกผูกติดกับการเก็งกำไรหรือการลงทุนระยะสั้น 
            โครงการ <strong>Bitcoin Learning Modules</strong> จึงริเริ่มขึ้นโดยความร่วมมือของกลุ่มอาสาสมัครในชุมชน <strong>Right Shift</strong> 
            เพื่อสร้างสรรค์หลักสูตรการสอนมาตรฐานภาษาไทยที่ครอบคลุมทุกมิติ ทั้งประวัติศาสตร์ของเงิน, ปรัชญาไซเฟอร์พังก์, 
            สถาปัตยกรรมทางเทคนิค, และบทบาททางเศรษฐศาสตร์
          </p>
          <p>
            สื่อชุดนี้ถูกสร้างขึ้นภายใต้แนวคิด <strong>Composable Education</strong> เพื่อให้ผู้สอนสามารถเลือกจัดเฉพาะยูนิตที่เหมาะสมกับกลุ่มผู้ฟัง 
            ไม่ว่าจะเป็นการบรรยายสั้น 1 ชั่วโมง หรือคอร์สอบรมเต็มรูปแบบ
          </p>
        </section>

        <section className="about-section">
          <h2>🤝 ขับเคลื่อนโดยชุมชน (Community & Open Source)</h2>
          <p>
            เนื้อหา ซอร์สโค้ด และภาพประกอบทั้งหมดได้รับการพัฒนาและดูแลในรูปแบบโอเพนซอร์ส (Open-source) 
            โดยชุมชนผู้ใช้และนักพัฒนา ทุกคนสามารถร่วมตรวจสอบ แนะนำข้อแก้ไข หรือส่งต่อเนื้อหาใหม่ๆ เข้าสู่โครงการได้
          </p>
          <div className="about-actions-box">
            <p><strong>ร่วมพัฒนาและติดตามความเคลื่อนไหวได้ที่ GitHub:</strong></p>
            <a 
              href="https://github.com/RightShiftSpace/BitcoinLearningModules" 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-outline"
            >
              💻 เข้าสู่คลังข้อมูล RightShiftSpace/BitcoinLearningModules
            </a>
          </div>
        </section>

        <section className="about-section disclaimer-box">
          <h2>⚠️ ข้อจำกัดความรับผิดชอบทางการศึกษา (Educational Disclaimer)</h2>
          <p>
            เนื้อหาทั้งหมดในสื่อการสอนนี้จัดทำขึ้นเพื่อ <strong>วัตถุประสงค์ทางการศึกษาและการเรียนรู้เท่านั้น</strong> (Strictly for educational purposes) 
            <strong>ไม่ใช่และต้องไม่ถือเป็นคำแนะนำทางการเงิน การลงทุน หรือการชักชวนให้ซื้อขายสินทรัพย์ใดๆ ทั้งสิ้น</strong> (Not financial advice)
          </p>
          <p>
            ผู้จัดทำไม่มีส่วนรับผิดชอบต่อการตัดสินใจทางการเงินใดๆ ของผู้เรียน การเก็บรักษาและใช้งานบิตคอยน์มีความเสี่ยงทางเทคนิคที่ผู้ใช้ต้องศึกษาทำความเข้าใจด้วยตนเองอย่างรอบคอบ
          </p>
        </section>

        <section className="about-section meta-box">
          <h2>📋 ข้อมูลเวอร์ชันและสถานะทางกฎหมาย (Release & Legal Status)</h2>
          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-key">เวอร์ชันข้อมูลปัจจุบัน (Release ID):</span>
              <span className="meta-val"><code>{release.info.releaseId}</code></span>
            </div>
            <div className="meta-item">
              <span className="meta-key">สถานะสัญญาอนุญาต (License Status):</span>
              <span className="meta-val">
                {release.info.licenseStatus === 'pending-legal-review' 
                  ? 'รอพิจารณาด้านกฎหมาย (Planned: Creative Commons Attribution-ShareAlike 4.0 International)' 
                  : release.info.licenseStatus}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-key">จำนวนบทเรียนในระบบ:</span>
              <span className="meta-val">{release.units.length} ยูนิต ({release.tracks.length} แผนมาตรฐาน)</span>
            </div>
            <div className="meta-item">
              <span className="meta-key">ภาษาหลัก:</span>
              <span className="meta-val">ภาษาไทย (Thai - th)</span>
            </div>
          </div>
        </section>

        <footer className="about-footer-nav">
          <Link to="/" className="btn btn-outline">❮ กลับหน้าแรก</Link>
          <Link to="/builder" className="btn btn-primary">เริ่มจัดชุดการสอน ❯</Link>
        </footer>
      </div>
    </div>
  );
}

