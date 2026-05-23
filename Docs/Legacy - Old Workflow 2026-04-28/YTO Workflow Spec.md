---
created: 2026-04-13 11:50
updated: 2026-04-22 15:04
version: 2026-04-22 15:04
in:
  - "[[PROJECT]]"
related:
  - "[[YTO Requirements]]"
  - "[[YTO Skill Spec]]"
tags:
  - status/doing
  - topic/company/chccdn
  - type/note
---

# YTO Workflow Spec

## Summary

- Workflow hiện tại có 2 lane:
  - `Lane A`: `YouTube Master` để lưu dữ liệu và tra cứu
  - `Lane B`: `Direct link optimize` để xử lý private/scheduled video
- Lane B không cần row trong sheet để bắt đầu optimize.

## System Context

### Actor

- `User`
  Copy link từ YouTube Studio, cung cấp content, review output, và tự cập nhật YouTube.
- `System`
  Quét video vào `YouTube Master`, đọc row được chọn khi cần, hoặc optimize trực tiếp từ link.
- `Google Sheets`
  Dashboard dữ liệu và tham chiếu.
- `YouTube API`
  Nguồn metadata cho lane dữ liệu.

### Main Artifacts

- `YouTube Master`
  Sheet tham chiếu dữ liệu.
- Local artifacts:
  - backup scan
  - run logs
  - Markdown files cho từng video đang tối ưu

## Workflow 1 - Ingest To YouTube Master

### Objective

Lấy video non-live và đưa vào `YouTube Master` để làm kho dữ liệu tham chiếu.

### Trigger

- automation chạy hằng ngày
- user gọi quét thủ công

### Process

1. Lấy video từ uploads playlist.
2. Bỏ video live.
3. Ghi metadata vào `YouTube Master`.

### Success Criteria

- `YouTube Master` có dữ liệu sạch
- không duplicate
- live không vào sheet

## Workflow 2 - Classify Reference Rows

### Objective

Phân loại `short/long` cho dữ liệu tham chiếu.

### Process

1. `< 180s` -> `short`
2. `>= 180s` -> `long`
3. Nếu user sửa tay thì giữ `manual`

### Success Criteria

- `video_type` dùng được cho việc tra cứu
- sync sau không ghi đè manual override

## Workflow 3 - Select Rows In YouTube Master

### Objective

Cho user chọn row trong sheet nếu muốn tạo local Markdown từ dữ liệu đã quét.

### Process

1. User tick `selected_for_optimize`.
2. System chỉ đọc các row được tick ở bước sau.

### Success Criteria

- user có thể chọn row để làm việc từ sheet
- sheet chỉ đóng vai trò hỗ trợ, không ép buộc cho mọi ca optimize

## Workflow 4 - Scan Selected Rows

### Objective

Lấy các row đã được chọn từ `YouTube Master` để tạo local Markdown.

### Process

1. Lọc row có `selected_for_optimize = TRUE`.
2. Lọc theo `published_at` nếu user yêu cầu.

### Success Criteria

- chỉ lấy row đã chọn
- không cần đụng YouTube API ở bước này

## Workflow 5 - Direct Link Optimize

### Objective

Bắt đầu tối ưu trực tiếp từ link video khi user copy từ YouTube Studio.

### Trigger

- user gửi `video_url` trực tiếp trong chat

### Inputs

- `video_url`
- và ít nhất một trong các dữ liệu sau:
  - transcript
  - description hiện tại
  - notes/tóm tắt nội dung

### Process

1. Nhận link video từ user.
2. Lấy `video_id` từ URL nếu cần.
3. Dùng content user cung cấp để generate:
   - title
   - description
   - tags
4. Trả output để user cập nhật trong YouTube Studio.

### Success Criteria

- optimize được video private/scheduled mà không cần API owner access
- không bắt user thêm row manual vào sheet

## Workflow 6 - Create Local Markdown Files

### Objective

Dùng local Markdown làm nơi làm việc chi tiết.

### Process

1. Tạo file local từ row sheet hoặc direct link input.
2. Ghi metadata và content vào file.
3. Ghi output optimize sau khi user xác nhận.

### Success Criteria

- mỗi video đang làm có file local rõ ràng
- file local là nơi lưu bản làm việc chi tiết

## Workflow 7 - Confirm Result By Rescan

### Objective

Xác nhận kết quả bằng metadata thật trên YouTube đối với video có trong `YouTube Master`.

### Process

1. Apps Script quét lại metadata.
2. Nếu row có đủ `current_description` và `current_tags`, set `done`.

### Success Criteria

- sheet phản ánh đúng trạng thái thật trên YouTube
- lane dữ liệu vẫn hữu ích như lớp reference/confirmation
