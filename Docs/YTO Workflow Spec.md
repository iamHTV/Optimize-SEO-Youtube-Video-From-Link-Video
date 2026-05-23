---
created: 2026-04-28
updated: 2026-04-28
version: 2026-04-28
in:
  - "[[PROJECT]]"
related:
  - "[[YTO Requirements]]"
  - "[[YTO Skill Spec]]"
  - "[[YTO Solution Architecture]]"
tags:
  - status/doing
  - topic/company/chccdn
  - type/note
---

# YTO Workflow Spec

## Workflow đầu cuối

```text
Kịch bản người dùng + tiêu đề tạm thời + URL tùy chọn
-> assistant đọc project skill
-> assistant đọc ngữ cảnh sheet khi có
-> assistant ghi một record Markdown cục bộ
-> assistant tạo gói tối ưu
-> người dùng review
-> người dùng cập nhật YouTube Studio
-> record được đánh dấu reviewed/published khi người dùng xác nhận
```

## Workflow 1 - Intake video brief

### Mục tiêu
Thu thập đủ input để tối ưu một video.

### Trigger
Người dùng yêu cầu tối ưu một video YouTube và cung cấp kịch bản, tiêu đề tạm thời hoặc URL video.

### Input
- kịch bản hoặc transcript video
- tiêu đề tạm thời
- URL video nếu đã có
- từ khóa mục tiêu, audience, góc triển khai hoặc ghi chú tùy chọn
- dòng sheet hoặc ID video tùy chọn

### Quy trình
1. Xác định người dùng đã cung cấp đủ nội dung hay chưa.
2. Trích xuất hoặc yêu cầu các field bắt buộc còn thiếu.
3. Giữ nguyên kịch bản gốc trong record.
4. Xem tiêu đề tạm thời là bản nháp, không phải định vị cuối.

### Output
- các field intake đã chuẩn hóa
- ứng viên tên file record

### Deliverable sau bước này
Một block intake có cấu trúc, sẵn sàng lưu vào record cục bộ.

### Tín hiệu thành công
Assistant có nội dung kịch bản và tiêu đề tạm thời, cộng với URL/ID video hoặc placeholder rõ ràng.

### Trường hợp lỗi
- kịch bản quá mỏng để suy ra các claim thật của video
- có tiêu đề nhưng không có kịch bản/nội dung
- URL là private hoặc bị thiếu và không thể xác thực

### Owner
Người dùng cung cấp input. Assistant chuẩn hóa input.

## Workflow 2 - Đọc ngữ cảnh sheet

### Mục tiêu
Dùng dữ liệu sheet được scan hằng ngày làm ngữ cảnh nhưng không biến nó thành phụ thuộc cứng.

### Trigger
Người dùng cung cấp dòng sheet, ID video, tiêu đề, URL hoặc yêu cầu assistant dùng dữ liệu sheet.

### Input
- sheet được export bởi Apps Script hoặc quyền truy cập trực tiếp qua sheet connector/API
- ID video, URL hoặc tiêu đề tạm thời để match

### Quy trình
1. Match bằng ID video trước.
2. Nếu thiếu ID video, match bằng URL.
3. Nếu thiếu URL, match bằng tiêu đề đã chuẩn hóa với xác nhận của người dùng.
4. Kéo các field hữu ích vào record:
   - tiêu đề hiện tại
   - mô tả hiện tại
   - tags hiện tại
   - trạng thái/ngày publish
   - các field hiệu suất nếu có
   - ứng viên video liên quan

### Output
- block ngữ cảnh sheet
- mức độ tin cậy của match

### Deliverable sau bước này
Section record tên `Sheet Context`.

### Tín hiệu thành công
Assistant có thể nêu rõ dòng/ngữ cảnh sheet đã dùng hoặc đánh dấu rõ là không có ngữ cảnh sheet.

### Trường hợp lỗi
- match tiêu đề bị trùng/mơ hồ
- sheet có dữ liệu cũ
- thiếu quyền truy cập connector

### Owner
Apps Script duy trì sheet. Assistant đọc và tóm tắt ngữ cảnh liên quan.

## Workflow 3 - Tạo gói tối ưu

### Mục tiêu
Tạo metadata sẵn sàng cho YouTube từ kịch bản thật.

### Input
- kịch bản
- tiêu đề tạm thời
- ngữ cảnh sheet nếu có
- ứng viên video liên quan nếu có

### Quy trình
1. Xác định chủ đề chính, góc triển khai, lời hứa với audience và key phrase từ kịch bản.
2. Viết lại tiêu đề để rõ khả năng click nhưng vẫn trung thực.
3. Viết mô tả mở bằng hook, tóm tắt giá trị, chèn video liên quan và kết thúc bằng CTA.
4. Tạo tags từ chủ đề thật trong kịch bản và ngữ cảnh sheet/kênh.
5. Draft bình luận ghim để gợi mở thảo luận và CTA.
6. Không bịa sự thật, địa điểm, offer hoặc claim không có trong kịch bản/ngữ cảnh.

### Output
- bản nháp tiêu đề cuối
- bản nháp mô tả
- tags
- block chèn video liên quan
- bình luận ghim

### Deliverable sau bước này
Section record tên `Optimization Output`.

### Tín hiệu thành công
Output sẵn sàng copy/paste và mọi claim đều bám vào kịch bản hoặc ngữ cảnh sheet.

### Trường hợp lỗi
- kịch bản thiếu nội dung đủ chắc
- không có video liên quan
- tiêu đề cần một claim không được kịch bản hỗ trợ

### Owner
Assistant draft. Người dùng phê duyệt.

## Workflow 4 - Tạo hoặc cập nhật record cục bộ

### Mục tiêu
Lưu toàn bộ lịch sử làm việc cho mỗi video.

### Input
- intake đã chuẩn hóa
- ngữ cảnh sheet
- gói tối ưu
- trạng thái review

### Quy trình
1. Tạo một file Markdown trong `Records/`.
2. Dùng content record template.
3. Bảo toàn kịch bản thô và tiêu đề tạm thời.
4. Thêm output được tạo bên dưới input thô.
5. Chỉ cập nhật trạng thái khi người dùng xác nhận trạng thái review hoặc publish.

### Output
- một record Markdown cho mỗi video

### Deliverable sau bước này
`Records/YYYY-MM-DD - [slug].md`

### Tín hiệu thành công
Record chứa đủ thông tin để tái dựng nội dung đã được tối ưu và lý do tối ưu.

### Trường hợp lỗi
- trùng tên file
- thiếu kịch bản nguồn
- người dùng chỉ yêu cầu output và không muốn tạo file

### Owner
Assistant tạo/cập nhật record cục bộ.

## Workflow 5 - Người dùng review và publish

### Mục tiêu
Giữ quyết định publish dưới quyền kiểm soát của người dùng.

### Trigger
Assistant trả output đã tạo.

### Quy trình
1. Người dùng review tiêu đề, mô tả, tags, link video liên quan và bình luận ghim.
2. Người dùng chỉnh sửa hoặc phê duyệt.
3. Người dùng tự cập nhật YouTube Studio.
4. Người dùng báo cho assistant biết kết quả đã publish hay chưa.
5. Assistant cập nhật trạng thái record cục bộ nếu được yêu cầu.

### Output
- trạng thái reviewed/published
- ghi chú tùy chọn về các thay đổi người dùng đã thực hiện

### Deliverable sau bước này
Trạng thái record được cập nhật thành `reviewed` hoặc `published`.

### Tín hiệu thành công
Record cục bộ khớp với trạng thái cuối mà người dùng đã biết.

### Trường hợp lỗi
- người dùng chỉnh output trong YouTube Studio nhưng không báo lại text cuối
- assistant không thể xác minh trạng thái publish

### Owner
Người dùng publish. Assistant ghi nhận trạng thái đã xác nhận.
