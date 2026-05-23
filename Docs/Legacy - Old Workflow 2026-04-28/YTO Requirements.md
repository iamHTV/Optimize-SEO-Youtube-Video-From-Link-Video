---
created: 2026-04-13 11:50
updated: 2026-04-22 15:04
version: 2026-04-22 15:04
in:
  - "[[PROJECT]]"
related:
  - "[[YTO Workflow Spec]]"
  - "[[YTO Skill Spec]]"
tags:
  - status/doing
  - topic/company/chccdn
  - type/note
---

# YTO Requirements

## Summary

- Project này có 2 lane riêng:
  - `Data/Reference lane`: `YouTube Master`
  - `Direct-link optimize lane`: user đưa link video trực tiếp để tối ưu
- `YouTube Master` không phải nơi vận hành chính cho video private hoặc scheduled.
- Video private/scheduled có thể không đọc được qua API nếu user chỉ là manager, không phải owner API.

## Business Requirements

- Hệ thống phải giúp user có một nơi lưu metadata video quét được để tra cứu và tham chiếu.
- Hệ thống phải cho phép user tối ưu video private/scheduled mà không phụ thuộc vào YouTube API owner access.
- User phải có thể đưa link video trực tiếp từ YouTube Studio để bắt đầu optimize.
- Hệ thống phải hỗ trợ tạo output tối ưu nhanh từ content user cung cấp.

## Functional Requirements

### FR-1 Data Ingest

- Apps Script phải quét video non-live vào `YouTube Master`.
- `YouTube Master` phải giữ metadata hiện trạng:
  - `video_id`
  - `video_url`
  - `published_at`
  - `current_title`
  - `current_description`
  - `current_tags`
  - `duration`
  - `video_type`
  - `type_source`
  - `optimize_status`
  - `selected_for_optimize`
  - `review_notes`
- Hệ thống không được đưa video live vào `YouTube Master`.

### FR-2 Classification

- Video trong `YouTube Master` phải được auto classify thành `short` hoặc `long`.
- Rule mặc định:
  - `< 180s` -> `short`
  - `>= 180s` -> `long`
- User phải sửa tay được bằng dropdown `video_type`.

### FR-3 Reference Dashboard

- `YouTube Master` chỉ là `data/reference dashboard`.
- Sheet này dùng để:
  - lưu metadata
  - tra cứu video
  - đánh dấu row cần theo dõi
- Sheet này không phải là input bắt buộc cho mọi ca optimize.

### FR-4 Direct Link Optimize

- Nếu user đưa `video_url` trực tiếp, hệ thống phải có thể bắt đầu optimize mà không cần row trong sheet.
- Input tối thiểu cho direct-link flow là:
  - `video_url`
  - và ít nhất một trong các dữ liệu sau:
    - transcript
    - description hiện tại
    - notes/tóm tắt nội dung
- Hệ thống phải generate được:
  - `title`
  - `description`
  - `tags`

### FR-5 Local Working Files

- Hệ thống phải dùng local Markdown làm nơi làm việc chi tiết.
- Local Markdown có thể được tạo:
  - từ row trong `YouTube Master`
  - hoặc từ direct-link input
- Sheet không lưu `transcript_status`, `script_text`, `proposed_*`, `approved_*`.

### FR-6 Rescan Confirmation

- Với video có trong `YouTube Master`, Apps Script phải có thể quét lại metadata.
- Nếu row có đủ `current_description` và `current_tags`, set `optimize_status = done`.
- Nếu thiếu một trong hai, set `optimize_status = pending`.

## Operational Requirements

- `Google Sheets` là dashboard dữ liệu.
- `Apps Script` là lớp ingest và sheet automation.
- `Local Markdown` là nơi AI và user làm việc tối ưu chi tiết.
- `YouTube Studio + direct link` là đường vận hành chính cho video private/scheduled.

## Data Requirements

### Minimum Sheet Schema

- `video_id`
- `published_at`
- `current_title`
- `current_description`
- `current_tags`
- `label`
- `thumbnail`
- `duration`
- `views_today`
- `like_count`
- `comment_count`
- `video_url`
- `last_updated_at`
- `video_type`
- `type_source`
- `optimize_status`
- `selected_for_optimize`
- `review_notes`

### Validation Rules

- `video_type`: `short`, `long`
- `type_source`: `duration_rule`, `manual`
- `optimize_status`: `pending`, `done`, `skipped`
- `selected_for_optimize`: checkbox

## Acceptance Criteria

### AC-1 Data lane thành công khi

- `YouTube Master` quét được video non-live
- sheet có metadata cốt lõi để tra cứu
- không có duplicate

### AC-2 Direct-link lane thành công khi

- user chỉ cần đưa `video_url`
- hệ thống vẫn tạo được output tối ưu nếu có đủ content đầu vào
- không phụ thuộc private-video API access

### AC-3 Local workflow thành công khi

- output optimize có thể được tạo từ:
  - row trong sheet
  - hoặc direct link
- local Markdown là nơi lưu bản làm việc chi tiết

### AC-4 Rescan confirmation thành công khi

- video có trong `YouTube Master` được cập nhật metadata thật sau khi user chỉnh trên YouTube
- `optimize_status` phản ánh đúng tình trạng hiện tại

## Definition Of Done

- `YouTube Master` chạy như data/reference layer.
- Video private/scheduled không còn là blocker cho optimize workflow.
- Direct-link flow trở thành đường xử lý chính cho video private/scheduled.
- Tài liệu không còn mô tả sheet là nơi vận hành duy nhất cho mọi ca optimize.
