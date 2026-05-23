---
created: 2026-04-28
updated: 2026-04-28
version: 2026-04-28
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

## Yêu cầu nghiệp vụ

- Workflow phải tối ưu một video dựa trên kịch bản và tiêu đề tạm thời do người dùng cung cấp.
- Workflow không được phụ thuộc vào việc scrape transcript YouTube hoặc metadata video riêng tư.
- Dữ liệu sheet từ Apps Script daily scan của người dùng nên cải thiện ngữ cảnh nhưng không được chặn việc tối ưu.
- Mỗi video được tối ưu nên có một record Markdown cục bộ.
- Việc publish lên YouTube Studio vẫn là hành động của con người.

## Yêu cầu chức năng

### FR-1 Intake

- Input bắt buộc:
  - kịch bản hoặc transcript
  - tiêu đề tạm thời
- Input tùy chọn:
  - URL video
  - ID video
  - dòng sheet
  - mô tả hiện tại
  - tags hiện tại
  - từ khóa mục tiêu
  - ưu tiên về video liên quan

### FR-2 Đọc sheet

- Skill phải hỗ trợ đọc ngữ cảnh sheet khi có connector, export, CSV hoặc output từ Apps Script.
- Thứ tự ưu tiên khi match:
  1. ID video
  2. URL
  3. tiêu đề chính xác
  4. tiêu đề fuzzy với xác nhận của người dùng
- Nếu không có ngữ cảnh sheet, assistant phải tiếp tục chỉ với kịch bản và tiêu đề.

### FR-3 Output tối ưu

- Assistant phải tạo:
  - tiêu đề mới
  - mô tả
  - tags
  - block video liên quan
  - bình luận ghim để gợi mở tương tác và CTA
- Output phải bám vào kịch bản và metadata hiện có.
- Assistant không được tự bịa các claim không có căn cứ.

### FR-4 Video liên quan

- Video liên quan có thể đến từ:
  - dữ liệu scan trong sheet
  - URL do người dùng cung cấp
  - metadata kênh hiện có nếu có
- Assistant phải đánh dấu video liên quan là không có sẵn nếu không có nguồn đáng tin cậy.
- Video liên quan nên được chèn vào mô tả dưới dạng một section ngắn gọn.

### FR-5 Record cục bộ

- Record nằm trong `Records/`.
- Mỗi record phải lưu:
  - kịch bản thô
  - URL video
  - tiêu đề tạm thời
  - tiêu đề được tạo
  - mô tả
  - tags
  - video liên quan
  - bình luận ghim
  - ngữ cảnh sheet
  - trạng thái review
  - trạng thái publish

### FR-6 Ranh giới phê duyệt

- Assistant có thể ghi record cục bộ.
- Assistant chỉ có thể cập nhật trạng thái record dựa trên thông tin được người dùng xác nhận.
- Assistant không được tự động cập nhật YouTube Studio.

## Yêu cầu vận hành

- Giữ file workflow cũ ra khỏi active path.
- Bảo toàn tài liệu cũ như tài liệu tham chiếu legacy.
- Lưu file Markdown mới bằng UTF-8.
- Dùng một content record template cho mọi video record được tạo.
- Giữ workflow active dễ hiểu từ `README.md` và `Docs/`.

## Tiêu chí chấp nhận

- Khi có kịch bản + tiêu đề tạm thời, assistant có thể tạo một gói tối ưu hoàn chỉnh.
- Khi có kịch bản + tiêu đề tạm thời + URL, assistant ghi URL và output vào một file Markdown.
- Khi có ngữ cảnh sheet, assistant dùng nó cho metadata hiện tại và gợi ý video liên quan.
- Nếu thiếu ngữ cảnh sheet, assistant nêu rõ điều đó và vẫn tạo gói tối ưu.
- Không output nào được tạo ra claim các sự thật nằm ngoài kịch bản hoặc ngữ cảnh được cung cấp.

## Definition Of Done

- Tài liệu active chỉ mô tả workflow mới ưu tiên kịch bản.
- Tài liệu cũ được giữ trong một vị trí legacy có tên rõ ràng.
- Artifact triển khai cũ được loại khỏi workflow active và đặt trong `.trash`.
- Project skill mô tả vòng vận hành mới.
- Có một content record template tái sử dụng được.

## Chưa đủ nếu

- Chỉ tạo tiêu đề/mô tả/tags trong chat mà không lưu kịch bản nguồn.
- Xem dữ liệu sheet là bắt buộc.
- Tái sử dụng giả định scan-to-optimize cũ.
- Lưu output mà thiếu tiêu đề tạm thời và kịch bản thô.
- Tạo link video liên quan khi không có nguồn đáng tin cậy.
