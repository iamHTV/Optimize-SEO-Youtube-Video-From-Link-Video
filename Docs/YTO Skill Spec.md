---
created: 2026-04-28
updated: 2026-04-28
version: 2026-04-28
in:
  - "[[PROJECT]]"
related:
  - "[[YTO Workflow Spec]]"
  - "[[YTO Requirements]]"
  - "[[YTO Solution Architecture]]"
tags:
  - status/doing
  - topic/company/chccdn
  - type/note
---

# YTO Skill Spec

## Trường hợp kích hoạt

Dùng project skill khi người dùng yêu cầu:

- tối ưu một video YouTube
- viết lại tiêu đề từ kịch bản
- tạo mô tả hoặc tags
- thêm video liên quan vào mô tả
- draft bình luận ghim
- lưu một optimization record
- đọc ngữ cảnh sheet cho việc tối ưu YouTube

## Trách nhiệm

- Đọc tài liệu dự án trước khi thay đổi hành vi workflow.
- Dùng kịch bản của người dùng làm nguồn sự thật cho nội dung.
- Dùng tiêu đề tạm thời như một bản nháp, không phải ràng buộc.
- Đọc ngữ cảnh sheet khi có.
- Tạo một gói tối ưu hoàn chỉnh.
- Tạo hoặc cập nhật một record cục bộ cho mỗi video.
- Giữ việc publish dưới quyền kiểm soát của người dùng.

## Input

Bắt buộc:

- kịch bản hoặc transcript
- tiêu đề tạm thời

Tùy chọn:

- URL video
- ID video
- tiêu đề hiện tại
- mô tả hiện tại
- tags hiện tại
- dòng sheet hoặc sheet export
- URL video liên quan
- ghi chú về audience, keyword hoặc CTA

## Output

- tiêu đề cuối
- mô tả
- tags
- section video liên quan
- bình luận ghim
- record Markdown cục bộ

## Quy tắc output

### Tiêu đề

- Ưu tiên dưới 60 ký tự khi có thể.
- Làm rõ lợi ích chính hoặc yếu tố gợi tò mò.
- Trung thực với kịch bản.
- Không thêm số liệu, địa điểm, cam kết hoặc claim không có căn cứ.

### Mô tả

- Mở đầu bằng hook cốt lõi.
- Tóm tắt các điểm hữu ích của video.
- Bao gồm video liên quan khi có nguồn đáng tin cậy.
- Kết thúc bằng CTA đơn giản.
- Tránh nhồi nhét hashtag.

### Tags

- Dùng 10-20 tags.
- Kết hợp chủ đề chính, chủ đề phụ, niche của kênh và địa điểm chỉ khi có căn cứ.
- Giữ tags phân tách bằng dấu phẩy.

### Video liên quan

- Ưu tiên video từ ngữ cảnh sheet hoặc URL do người dùng cung cấp.
- Bao gồm tiêu đề và URL.
- Nếu không có, đánh dấu là không có sẵn thay vì tự bịa link.

### Bình luận ghim

- Đặt một câu hỏi khuyến khích người xem phản hồi.
- Thêm một CTA nhẹ.
- Tránh nghe như quảng cáo trừ khi bản thân video có tính quảng bá.

## Ranh giới phê duyệt

- Assistant có thể tạo và chỉnh sửa record Markdown cục bộ.
- Assistant không được cập nhật YouTube Studio.
- Assistant không được đánh dấu video là đã publish nếu người dùng chưa xác nhận.
- Assistant phải hỏi trước khi ghi đè output cuối đã có, trừ khi người dùng yêu cầu rewrite rõ ràng.

## Mô hình bộ nhớ

- `Records/` là working memory.
- Mỗi record giữ input thô và output được tạo.
- Dữ liệu sheet chỉ được copy vào record như ngữ cảnh đã dùng cho lần tối ưu đó.
- Không được dùng giả định từ workflow cũ trừ khi được khôi phục rõ ràng từ tài liệu legacy.

## Xử lý lỗi

- Nếu thiếu kịch bản, hỏi kịch bản trước khi tối ưu.
- Nếu thiếu tiêu đề, tạo một tiêu đề làm việc tạm thời và đánh dấu là suy luận.
- Nếu thiếu quyền truy cập sheet, tiếp tục không dùng ngữ cảnh sheet.
- Nếu không có video liên quan, output rõ trạng thái đó.
- Nếu nội dung mơ hồ, liệt kê giả định trước khi tạo.

## Tiêu chí thành công

- Người dùng có thể paste output vào YouTube Studio với rất ít chỉnh sửa.
- Record cục bộ bảo toàn input thô và output được tạo.
- Kết quả có thể truy vết về kịch bản và ngữ cảnh được cung cấp.
