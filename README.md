# Bitcoin Learning Modules (เว็บไซต์สื่อการสอนบิตคอยน์มาตรฐานภาษาไทย)

ชุดสื่อการสอนบิตคอยน์ภาษาไทยแบบเปิด (**Open Educational Resources - OER**) ที่มุ่งเน้นการให้ความรู้ที่ถูกต้องตามหลักการ วิทยาการคอมพิวเตอร์ และเศรษฐศาสตร์ ปราศจากการชี้นำทางการเงินหรือการเก็งกำไร สร้างสรรค์และขับเคลื่อนโดยชุมชน **Right Shift** เพื่อนักการศึกษา ผู้จัด Meetup และผู้สนใจทั่วไป

---

## จุดเด่นของระบบ (Key Features)

- **Composable Deck Builder:** สามารถเลือกประกอบชุดสไลด์จากเนื้อหายูนิตย่อยได้อย่างอิสระ หรือเลือกจากแผนการสอนมาตรฐาน (**Tracks**)
- **Dual Deck Presentation:** ทุกยูนิตมาพร้อมสไลด์ฉายหน้าห้อง (**Class Deck**) และคู่มือผู้สอนพร้อมบทพูดประกอบสไลด์ต่อสไลด์ (**Guide Deck**)
- **100% Offline Capability:** ดาวน์โหลดเป็นแพ็กเกจ **Offline ZIP** เพื่อนำไปเปิดสอนได้ทุกที่แม้อยู่ในสถานที่ที่ไม่มีอินเทอร์เน็ต
- **Import / Export Selection:** ส่งออกและนำเข้ารายการยูนิตที่เลือกเป็นไฟล์ `.json` เพื่อแชร์กับเพื่อนร่วมงานหรือเก็บไว้ใช้งานซ้ำได้ทันที
- **Responsive Workspace:** ใช้งานได้สะดวกทั้งบนคอมพิวเตอร์และอุปกรณ์พกพา

---

## สถาปัตยกรรมและการพัฒนา (Development Setup)

โปรเจกต์นี้สร้างด้วย **React 19 + TypeScript + Vite**:

```bash
# 1. เข้าสู่โฟลเดอร์เว็บไซต์
cd website

# 2. ติดตั้ง Dependencies
pnpm install

# 3. นำเข้าข้อมูล Release ล่าสุดเข้าสู่ Public Directory
pnpm stage:release

# 4. เริ่มต้น Dev Server
pnpm dev

# 5. รัน Automated Test Suite
pnpm test

# 6. Build สำหรับ Production
pnpm build
```

---

## การเผยแพร่ (Deployment)

โปรเจกต์นี้รองรับการเผยแพร่ผ่าน **GitHub Pages** อัตโนมัติด้วย GitHub Actions Workflow (`.github/workflows/deploy.yml`):
- เมื่อมีการ Push โค้ดเข้าสู่ Branch หลัก ระบบจะทำการ Stage Release, Build Vite Application และ Deploy สู่ GitHub Pages ให้โดยอัตโนมัติ

---

## ข้อจำกัดความรับผิดชอบ (Educational Disclaimer)

เนื้อหาและสื่อการสอนทั้งหมดจัดทำขึ้นเพื่อ **วัตถุประสงค์ทางการศึกษาและการเรียนรู้เท่านั้น** (Strictly for educational purposes) **ไม่ใช่และต้องไม่ถือเป็นคำแนะนำทางการเงิน การลงทุน หรือการชักชวนให้ซื้อขายสินทรัพย์ใดๆ ทั้งสิ้น** (Not financial advice)

---

## สัญญาอนุญาตและลิขสิทธิ์ (License & Attribution)

- **Code & Platform:** MIT License
- **Educational Content:** Planned under Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0) — *อยู่ระหว่างการตรวจสอบด้านกฎหมาย (Pending Legal Review)*
- ดูรายละเอียดเพิ่มเติมได้ที่ [`NOTICE.md`](./NOTICE.md) และ [`TRADEMARKS.md`](./TRADEMARKS.md)

