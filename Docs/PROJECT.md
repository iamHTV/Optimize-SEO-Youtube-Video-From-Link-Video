---
created: 2026-04-28
updated: 2026-04-28
version: 2026-04-28
tags:
  - status/doing
  - topic/company/chccdn
  - type/project-moc
---

# YouTube Optimize

## Tóm tắt dự án

Workflow cũ dựa trên API/link trực tiếp đã không còn phù hợp để làm vòng vận hành chính. Workflow mới ưu tiên kịch bản: người dùng cung cấp cho assistant kịch bản video, tiêu đề tạm thời và metadata video hiện có; assistant dùng project skill để tạo một gói tối ưu YouTube hoàn chỉnh.

## Vấn đề

Người dùng cần một cách lặp lại được để biến kịch bản video thô và ngữ cảnh từ sheet/video thành metadata YouTube có thể dùng được, không phụ thuộc vào pipeline scan-to-optimize dễ lỗi.

## Kết quả mong muốn

Với mỗi video, hệ thống tạo một record cục bộ gồm:

- kịch bản gốc
- URL video
- tiêu đề tạm thời
- tiêu đề đã viết lại
- mô tả
- tags
- video liên quan để chèn vào
- bình luận ghim để gợi mở tương tác và CTA
- ngữ cảnh từ sheet nguồn
- trạng thái review/publish

## Nguồn sự thật

- Kịch bản do người dùng cung cấp là nguồn sự thật cho nội dung.
- Tiêu đề tạm thời do người dùng cung cấp là tham khảo thôi vì nó nhiều khi không chuẩn
- Dữ liệu sheet là nguồn sự thật cho metadata video hiện có, ngữ cảnh hiệu suất và ứng viên video liên quan.
- Record Markdown cục bộ trong `Records/` là lớp làm việc và audit.

## Trạng thái hiện tại

- Tài liệu cũ được giữ trong `Docs/Legacy - Old Workflow 2026-04-28/`.
- Code cũ và artifact đã tạo được chuyển vào `.trash/old-workflow-2026-04-28/`.
- Tài liệu active hiện mô tả workflow ưu tiên kịch bản.
- `youtube-optimize` skill đã xoá — không còn phù hợp.
- `youtube-seo-bds` skill mới — tích hợp sẵn angles, hooks, CTA references.
- `youtube-sheet-reader` skill — đọc sheet context cho optimization.

## Skills hiện có

| Skill | Mục đích |
|-------|----------|
| `youtube-seo-bds` | Skill chính — generate title, description, tags, thumbnail, first comment |
| `youtube-sheet-reader` | Đọc ngữ cảnh từ sheet (Apps Script, CSV, pasted table) |

## Việc tiếp theo

1. Xác nhận các cột sheet có sẵn từ Apps Script daily scan của người dùng.
2. Hoàn thiện youtube-sheet-reader để parse đúng format sheet.
3. Tạo record tối ưu video đầu tiên từ một kịch bản thật.
4. Tinh chỉnh quy tắc title/mô tả/tag sau khi review output thật.

## Hoàn tất khi

- Người dùng có thể cung cấp kịch bản + tiêu đề tạm thời + URL tùy chọn và nhận một gói tối ưu hoàn chỉnh.
- Mỗi video được tối ưu đều có một record cục bộ trong `Records/`.
- Sheet reader có thể đọc context từ Apps Script export, CSV, hoặc pasted data.
- Assistant vẫn hoạt động được khi không có sheet access (không block).
- Vẫn yêu cầu người dùng review trước khi cập nhật YouTube Studio.
