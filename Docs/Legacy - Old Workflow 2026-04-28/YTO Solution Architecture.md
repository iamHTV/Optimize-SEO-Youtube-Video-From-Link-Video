---
created: 2026-04-15 16:25
updated: 2026-04-22 15:04
version: 2026-04-22 15:04
in:
  - "[[PROJECT]]"
related:
  - "[[YTO Requirements]]"
  - "[[YTO Workflow Spec]]"
  - "[[YTO Skill Spec]]"
tags:
  - status/doing
  - topic/company/chccdn
  - type/note
---

# YTO Solution Architecture

## Decision Summary

- `YouTube Master` chỉ còn là `data/reference layer`.
- `Apps Script` chỉ làm ingest, refresh metadata, và setup sheet.
- Video `live` bị loại khỏi ingest.
- `video_type` chỉ còn `short` hoặc `long`.
- `video_type` là dropdown để user sửa tay nếu rule duration sai.
- Optimize cho `private/scheduled` video không đi qua API scan nữa.
- Với `private/scheduled` video, input chuẩn là `direct link from YouTube Studio`.
- Local Markdown là nơi làm việc chi tiết cho cả 2 lane.

## Architecture Split

### Lane A - Data / Reference

```text
YouTube
-> Apps Script
-> YouTube Master
-> metadata reference
-> selected rows when useful
-> rescan confirmation
```

### Lane B - Direct Link Optimize

```text
YouTube Studio
-> user copies video URL
-> chat / AI workflow
-> local Markdown
-> generated title / description / tags
-> user updates YouTube Studio
```

## Why This Direction

- Manager access có thể không đủ để đọc private/scheduled video qua API.
- Không nên ép user thêm row manual vào sheet chỉ để tối ưu private video.
- `YouTube Master` vẫn hữu ích để lưu dữ liệu quét được và xác nhận metadata sau khi chỉnh.
- `Direct link` là đường vận hành tự nhiên nhất cho private/scheduled video.

## Flow 1 - Data Ingest

### Objective

Đưa video non-live vào `YouTube Master` để lưu và tra cứu.

### Solution

- Dùng Apps Script ingest non-live videos.
- Lưu metadata cốt lõi vào `YouTube Master`.
- Sheet này không còn được xem là nơi bắt buộc để khởi động optimize cho mọi video.

### Success Criteria

- dữ liệu quét được sạch
- live không vào sheet
- có thể dùng sheet làm reference

## Flow 2 - Reference Classification

### Objective

Gán `short/long` cho row trong `YouTube Master`.

### Solution

- `< 180s` -> `short`
- `>= 180s` -> `long`
- user sửa tay nếu cần

### Success Criteria

- classification chỉ phục vụ tra cứu và context
- không làm blocker cho optimize

## Flow 3 - Direct Link Intake

### Objective

Bắt đầu optimize ngay khi user gửi link video.

### Solution

- User gửi `video_url` trực tiếp.
- Hệ thống không yêu cầu video phải có row trong sheet.
- Hệ thống dùng:
  - link
  - transcript
  - hoặc description
  - hoặc notes
  để tạo output optimize.

### Success Criteria

- không cần thêm row manual
- không phụ thuộc private-video API access

## Flow 4 - Local Markdown Working File

### Objective

Dùng local Markdown làm nơi làm việc chính.

### Solution

- Tạo file local từ:
  - selected row trong sheet
  - hoặc direct link input
- Ghi:
  - current metadata
  - content
  - output optimize

### Success Criteria

- local Markdown là nơi làm việc nhất quán cho cả 2 lane

## Flow 5 - Rescan Confirmation

### Objective

Xác nhận lại metadata thật trên YouTube cho video có trong `YouTube Master`.

### Solution

- Sau khi user cập nhật YouTube, Apps Script quét lại.
- Nếu có đủ `current_description` và `current_tags`, set `done`.

### Success Criteria

- sheet phản ánh đúng trạng thái hiện tại
- lane dữ liệu vẫn giữ giá trị reference/confirmation

## Final Decisions

1. `YouTube Master` là `data/reference sheet`, không phải optimize UI cho mọi case.
2. Không thêm `manual row` chỉ để xử lý private/scheduled video.
3. `Direct link from YouTube Studio` là input chuẩn cho private/scheduled optimize.
4. `Local Markdown` là nơi làm việc chi tiết.
5. Apps Script tiếp tục phục vụ lane dữ liệu, không ép lane optimize phải phụ thuộc API.
