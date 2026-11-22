# Resume site — audit & implementation spec
วันที่ตรวจ: 2026-11-22 · URL: https://manchinn.github.io/resume/ · repo: `Manchinn.github.io/resume/`
สถานะ deploy: live ตรงกับ local (diff ต่างเฉพาะ CRLF/LF) · commit ล่าสุด `ecc2f2f` (2026-10-22)

## 1) สิ่งที่มีอยู่แล้ว (verified)

| ส่วน | สถานะ |
|---|---|
| Role switcher | 11 roles: junior-developer, fullstack, ai-developer, frontend, backend, software-engineer, software-development, software-tester, system-engineer, ai-engagement, service-desk |
| ต่อ role | `title`, `summaryPrefix/Body`, `availability`, `skills` 6 หมวด, `skillLabels` override, `copy` override ราย bullet |
| Layout | 2 templates (standard centered / harvard left-aligned) + print CSS A4 (Times 10.25pt) |
| Header | รูปถ่าย + email + phone + GitHub + LinkedIn (อยู่ใน `.resume` จึงติดไปกับ PDF) |
| Sections | Education (1) · Work Experience (2: ATIZ ม.ค.–เม.ย. 2026, DEVERHOOD เม.ย.–มิ.ย. 2024) · Projects (3: CSLogbook, Trade Bot, Sport Court) · Summary & Technical Skills (6 หมวด) · Availability |
| Interactivity | `?role=&template=` URL params, localStorage, ปุ่ม Print/Save PDF |
| Toolbar | Portfolio, GitHub, Navigator (ซ่อนตอน print) |

## 2) ช่องว่าง — เรียงตามผลกระทบ

### A. Role coverage ไม่ตรงกับงานที่ยิงจริง (สำคัญสุด)
ตำแหน่งที่สมัคร/บันทึกไว้ (JobThai 6 · สนใจ 3 · JobsDB 4) ต้องการ 5 สายที่ยังไม่มี role ในเว็บ:

| Role ที่ต้องเพิ่ม | ใช้กับตำแหน่ง |
|---|---|
| `ai-engineer` | AI Engineer (Thai Life, NDC, CPF), AI Software Developer, AI Officer |
| `ai-automation` | AI Automation Engineer (เริ่มใหม่), AI Automation & Process Consultant (Narathai), AI Agent & Automation Specialist (แบล็ค ชีพ) |
| `ai-solution-consultant` | AI/IT Solution Consultant (Junior), AI Solution Consultant |
| `ai-creative-marketing` | AI Creative & Marketing Specialist (แบล็ค ชีพ) |
| `ai-analyst-tester` | AI Analyst / AI Developer / AI Tester (QAi) |

ทั้ง 5 role ต้องมี `skills` + `copy` ของตัวเอง ไม่ใช่ reuse คำของ `ai-developer` (ซึ่งปัจจุบันสื่อว่า "ใช้ AI tool เป็น" ไม่ใช่ "สร้าง AI system เป็น")

### B. Content gaps
1. **ไม่มี AI/LLM project เลย** — ที่มีคือ Trade Bot (2023–24) แบบ "concept" เท่านั้น ต้องเพิ่มผลงานจริง เช่น job-search pipeline (multi-portal scraper + SQLite + LLM fit scoring + Docker/VPS watcher + Discord notify), agent tooling, LINE OA bot — ต้องใส่ตัวเลข/ผลลัพธ์จริง
2. **ช่องว่างการจ้างงาน เม.ย. 2026 → ปัจจุบัน (7 เดือน)** — ไม่มี entry อะไรเลย ต้องเพิ่ม "Independent / Freelance AI Engineering" หรือ contract work
3. **ไม่มี Certifications / Courses** และ **ไม่มี Languages** (ไทย/อังกฤษ ระดับอะไร)
4. **ไม่มีตัวเลขวัดผล** สัก bullet — ต้องมีอย่างน้อย 3–5 bullet ที่มี metrics
5. **ไม่มีลิงก์ project** (repo / live demo) — CSLogbook deploy จริงแล้วแต่ไม่มี URL บนเว็บ
6. **Education บางเกิน** — ไม่มี GPA (ถ้าใส่ได้), ไม่มีหัวข้อ special project/thesis (CSLogbook คือ senior project หรือไม่), ไม่มี coursework ที่เกี่ยวข้อง
7. **Skills ขาด AI stack**: Python สำหรับ data/LLM, orchestration (LangChain/LlamaIndex หรือ custom), embeddings + vector DB, OpenAI/Anthropic API, MCP, n8n/Make, prompt/eval workflow, observability
8. **ไม่มีเวอร์ชันภาษาไทย** — JobThai/ผู้ประกอบการไทยมักอ่านไทย; ควรมี toggle EN/TH หรืออย่างน้อย static page `/resume/th/`

### C. Technical / ATS gaps
1. เนื้อหาทั้งหมด render ด้วย JS จาก `data.js` → crawler/ATS ที่ไม่รัน JS เห็นแค่ default (fullstack) และไม่มี static route ต่อ role
2. ไม่มีไฟล์ PDF ต่อ role ที่ generate ไว้ล่วงหน้า (พึ่ง print dialog) → มือถือ/Bot ใช้ง่ายกว่า
3. ไม่มี JSON-LD `Person`, ไม่มี OG/Twitter card, ไม่มี canonical, meta description เป็นข้อความกลาง ๆ
4. ไม่มีตัวเลือก "ไม่ใส่รูป" (ตลาดต่างประเทศมักไม่ใส่รูป)
5. ไม่มี cover letter template ต่อ role (พอร์ทัลไทย/JobsDB มักถาม)

## 3) งานที่ต้องทำ (สำหรับ Antigravity)

### P0 — เพิ่ม 5 AI roles
- เพิ่ม entry ใหม่ใน `resume/data.js` ตาม schema เดิม (`title`, `summaryPrefix`, `summaryBody`, `availability`, `skills{6}`, `skillLabels` ถ้าจำเป็น, `copy{}` ครบทุก key: atiz-1..4, experience-1..4, cslogbook-1..3, tradebot-1, reservation-1..3)
- เพิ่ม `<option>` ใน `resume/index.html` ตามลำดับ: ต่อจาก `ai-developer`
- ห้ามลอกคำของ `ai-developer` ตรง ๆ — ต้องเขียนใหม่ให้เน้น build/eval/deploy

### P0 — เพิ่ม project ใหม่ 1–2 รายการ
- เพิ่ม `<article class="item">` ใหม่ใน Projects พร้อม `data-role-copy` key ใหม่ (เช่น `jobpipeline-1..3`)
- ต้องเพิ่ม copy ของ project ใหม่นี้ใน **ทุก role** ที่มีอยู่ (11 + 5 ใหม่) ไม่เช่นนั้นจะเห็นข้อความ default
- ใส่ลิงก์ repo/live ในหัวข้อ project (ยืนยัน URL จริงก่อน)

### P1 — Sections ที่ขาด
- `Certifications` (ถ้ามี) และ `Languages` (ไทย native, อังกฤษ working proficiency)
- เติม GPA / senior project ที่ Education
- เพิ่ม entry "Independent / Freelance" ครอบ เม.ย. 2026 → present

### P1 — Technical
- Static route ต่อ role: `/resume/<role>/index.html` (pre-render จาก data.js ตอน build) หรืออย่างน้อย OG/meta ต่อ role
- ปุ่ม "Download PDF" ต่อ role (pre-generate ด้วย headless Chrome ตอน build) → `/resume/pdf/<role>.pdf`
- เพิ่ม JSON-LD Person + OG image (ใช้ `profile.jpg` หรือ OG 1200×630)
- เพิ่ม option "No photo" ใน template select
- เพิ่ม `?lang=th` หรือหน้า `/resume/th/` ถ้าจะทำเวอร์ชันไทย

### Acceptance criteria
- ทุก role เลือกได้จาก dropdown และ `?role=` ตรงกัน, ไม่มี bullet ไหนค้างเป็นข้อความ default ของ role อื่น
- Print/PDF ต่อ role ได้ 1 หน้า A4 (หรือ 2 หน้าสูงสุด) และ contact ยังอยู่
- ไม่มี field ว่าง/`undefined` ในหน้าที่ render
- Lighthouse: ไม่มี console error, meta/OG ครบ

## 4) ข้อมูลที่เจ้าของต้องเติมเอง (ห้าม agent แต่ง)
- GPA / เกียรตินิยม, ชื่อ senior project
- URL repo + live demo ของแต่ละ project
- ตัวเลขวัดผลจริง (จำนวน users, จำนวน records, เวลาที่ลดได้, uptime)
- Certifications (ชื่อ + ผู้ออก + ปี), ระดับภาษาอังกฤษ
- วันที่เริ่ม/จบของงาน freelance (ถ้าจะใส่)
