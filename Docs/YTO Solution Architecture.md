---
created: 2026-04-28
updated: 2026-04-28
version: 2026-04-28
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

## Tóm tắt quyết định

- Workflow active ưu tiên kịch bản.
- Sheet là nguồn ngữ cảnh, không phải chủ workflow.
- Record Markdown cục bộ là bộ nhớ vận hành.
- Một template được dùng cho mọi video record.
- File triển khai cũ được chuyển vào `.trash/old-workflow-2026-04-28/`.

## Các lớp hệ thống

### Lớp 1 - Input từ người dùng

Người dùng cung cấp:

- kịch bản hoặc transcript
- tiêu đề tạm thời
- URL video nếu có
- ghi chú, từ khóa mục tiêu hoặc audience dự kiến nếu có

### Lớp 2 - Ngữ cảnh sheet

Apps Script của người dùng scan dữ liệu video hằng ngày. Sheet đó có thể cung cấp:

- tiêu đề hiện tại
- mô tả hiện tại
- tags hiện tại
- URL video
- ngày publish
- chỉ số hiệu suất
- ứng viên video liên quan

Assistant nên đọc sheet khi có quyền truy cập. Nếu không có quyền truy cập trực tiếp vào sheet, người dùng có thể cung cấp export hoặc các dòng đã copy.

### Lớp 3 - Optimization Skill

Skill biến input thành:

- tiêu đề cải thiện
- mô tả
- tags
- section video liên quan
- bình luận ghim

Skill cũng tạo hoặc cập nhật record cục bộ.

### Lớp 4 - Record cục bộ

Record được lưu trong:

```text
Records/YYYY-MM-DD - [video-slug].md
```

Record là audit trail và file làm việc cho một video.

### Lớp 5 - Người dùng publish

Người dùng tự review và publish trong YouTube Studio. Assistant không sở hữu việc publish.

## Schema record

Các field bắt buộc:

- status
- video_url
- video_id
- temporary_title
- final_title
- description
- tags
- related_videos
- pinned_comment
- source_script
- sheet_context
- review_notes
- published_state

## Chiến lược đọc sheet

Thứ tự truy cập ưu tiên:

1. connector/API trực tiếp nếu có
2. file export từ Apps Script
3. CSV/bảng được người dùng paste
4. không dùng ngữ cảnh sheet

Thứ tự match:

1. ID video
2. URL
3. tiêu đề chính xác
4. tiêu đề fuzzy với xác nhận

## Chiến lược video liên quan

Chỉ dùng video liên quan khi có một trong các nguồn sau:

- người dùng cung cấp URL
- sheet chứa ứng viên đáng tin cậy
- metadata sheet/kênh khớp rõ với chủ đề kịch bản

Nếu không có, ghi:

```text
Video liên quan: không có sẵn - chưa có nguồn đáng tin cậy được cung cấp.
```

## Ranh giới lưu trữ

- `Docs/` lưu spec.
- `Skills/` lưu skill riêng của dự án.
- `Records/` lưu file làm việc theo từng video.
- `.trash/` lưu file workflow cũ để có thể khôi phục.

## Tiêu chí thành công

- Workflow hoạt động chỉ với kịch bản + tiêu đề tạm thời.
- Ngữ cảnh sheet cải thiện output nhưng không chặn output.
- Mỗi lần tối ưu được lưu đều có một record cục bộ hoàn chỉnh.
- Phê duyệt của người dùng vẫn là rõ ràng.
