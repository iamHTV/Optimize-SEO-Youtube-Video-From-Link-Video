---
name: youtube-sheet-reader
description: >
  Đọc ngữ cảnh từ sheet daily scan của người dùng cho YouTube optimization.
  Chấp nhận: Apps Script export, CSV, pasted table, connector data, hoặc text copy từ sheet.
  Dùng khi: user gửi kèm sheet context, hoặc cần match video với sheet data.
  Không làm blocker — nếu không có sheet, vẫn tiếp tục được nhưng đánh dấu unavailable.
---

# YouTube Sheet Reader Skill

## Mục đích

Đọc và parse sheet context để lấy metadata video, metrics, và related video candidates.
Kết quả trả về để youtube-seo-bds dùng trong việc generate title, description, tags.

---

## Nguồn dữ liệu được chấp nhận

| Nguồn | Định dạng | Cách nhận |
|-------|-----------|-----------|
| Apps Script export | JSON / Markdown table | File đính kèm |
| CSV export | .csv | File đính kèm |
| Pasted table | Text table trong chat | Paste trực tiếp |
| Connector data | JSON | Copy/paste |
| Copy text từ sheet | Text thuần | Paste vào chat |
| Sheet URL | Link đến Google Sheets | Paste link |

---

## Required Matching Input

Ít nhất 1 trong:
- **video ID** — chính xác nhất
- **video URL** — từ YouTube
- **temporary title** — do user cung cấp
- **current title** — title đang có trên YouTube

---

## Matching Priority

| Ưu tiên | Input | Độ chính xác |
|---------|-------|--------------|
| 1 | video ID | Tuyệt đối |
| 2 | video URL | Tuyệt đối |
| 3 | exact title (normalize) | Cao |
| 4 | fuzzy title | Cần user confirm |

**Quy tắc:**
- Không guess khi có nhiều row plausible
- Fuzzy match → hỏi user xác nhận
- Không match được → trả về empty context, không block

---

## Fields để Extract

### Core Fields (bắt buộc nếu có)
- video ID
- video URL
- current title
- current description
- current tags

### Optional Fields (trích nếu có)
- published date
- status (published/draft/pending)
- views
- likes
- comments
- subscriber count
- metrics khác

### Related Videos
- candidate video URLs
- candidate titles
- performance data nếu có

### Notes
- any notes từ sheet

---

## Output Format

```markdown
## Sheet Context

**Match Status:** [matched / not_found / fuzzy_match]
**Match Confidence:** [high / medium / low]
**Source:** [Apps Script / CSV / Pasted / Connector / N/A]

### Video Info
- **Video ID:** [ID hoặc unavailable]
- **URL:** [URL hoặc unavailable]
- **Current Title:** [title hoặc unavailable]
- **Published:** [date hoặc unavailable]
- **Status:** [status hoặc unavailable]

### Metrics
- **Views:** [number hoặc unavailable]
- **Likes:** [number hoặc unavailable]
- **Comments:** [number hoặc unavailable]

### Current Metadata
- **Description:** [truncated/changed flag nếu có]
- **Tags:** [tags hoặc unavailable]

### Related Video Candidates
[Liệt kê nếu có, format: Title - URL]
- [video title] - [URL]
- hoặc "Không có candidate trong sheet"

### Notes
[Notes từ sheet hoặc "Không có notes"]
```

---

## Parsing Rules

### CSV Parsing
1. Header row xác định columns
2. Find row bằng matching input
3. Map columns với fields
4. Handle quoted values, commas trong cells

### Table Text Parsing
1. Split by newlines
2. Detect delimiter (tab, comma, pipe)
3. Header row = first line
4. Find row bằng matching
5. Trim whitespace

### Apps Script / JSON Parsing
1. Parse JSON structure
2. Navigate nested objects
3. Find matching row by key

---

## Error Handling

| Tình huống | Xử lý |
|------------|--------|
| No input provided | Ask user cung cấp input |
| Multiple fuzzy matches | Hỏi user chọn đúng row |
| No match found | Return empty context, marked not_found |
| Parsing error | Report error, ask user paste lại format khác |
| Sheet unavailable | Mark all fields unavailable, continue |

---

## Integration với youtube-seo-bds

Sheet reader trả về context → youtube-seo-bds dùng để:

1. **Cross-reference dữ liệu dự án** — kiểm tra giá, pháp lý, tiến độ từ CHCC_saved_data
2. **Verify title/description** — so sánh với current metadata
3. **Lấy related video candidates** — từ sheet
4. **Đọc metrics** — để hiểu performance context

**Flow:**
```
User gửi script + sheet context
→ Sheet Reader parse và return context
→ youtube-seo-bds dùng context + script để generate
```

---

## Quy tắc quan trọng

1. **Không block** — nếu sheet unavailable, continue without it
2. **Không guess** — fuzzy match phải confirm
3. **Preserve original** — không rewrite sheet data
4. **Mark unavailable** — field nào không có thì ghi rõ
5. **Continue on error** — parse error không stop, chỉ report

---

## Sample Usage

**User gửi:**
```
Đây là script video mới. Đây là sheet context:
[paste sheet data hoặc attach file]
```

**Assistant:**
1. Nhận input → xác định sheet format
2. Parse sheet data → extract fields
3. Match với video info (ID/URL/title)
4. Return Sheet Context formatted output
5. Chuyển tiếp cho youtube-seo-bds generate metadata