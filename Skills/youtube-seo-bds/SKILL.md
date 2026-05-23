---
name: youtube-seo-bds
description: >
  Tạo hoặc tối ưu metadata YouTube cho video bất động sản Đà Nẵng của kênh Đoàn Kim Nga:
  title, selected title, description chuẩn YouTube, tags <=500 ký tự, thumbnail text và first comment.
  Dùng skill này khi user nhắc "title video", "description youtube", "tags youtube", "SEO youtube",
  "tối ưu video", "viết mô tả", gửi script/subtitle/transcript, hoặc khi skill youtube-optimize-from-link
  gọi ở chế độ AUTO_FROM_LINK. Skill phải đọc nội dung video trước, giữ description đúng angle/title,
  không bịa số liệu, và luôn chạy quality check trước khi trả kết quả.
metadata:
  author: iamHTV
  version: 3.0.0
  category: document-creation
  tags: [youtube-seo, bat-dong-san, da-nang, title, description]
---

# Skill: YouTube SEO BĐS Đà Nẵng

Skill này tạo metadata có thể paste vào YouTube Studio. Ưu tiên đúng nội dung video, đúng angle, đúng format và không làm workflow tự động bị kẹt.

## Copy Block Rule

Những phần user thường copy vào YouTube Studio phải đặt trong fenced code block `text` để giao diện có nút copy riêng và không làm vỡ format khi paste:

- `TITLE ĐÃ CHỌN`
- `DESCRIPTION`
- `TAGS`
- `FIRST COMMENT`

Ví dụ:

````markdown
### TITLE ĐÃ CHỌN
```text
[title chính]
```

### TAGS
```text
[tags <=500 ký tự]
```
````

Không đặt giải thích, lý do chọn, hoặc ghi chú bên trong code block copy. Chỉ để nội dung cần paste.

## Chọn Mode Trước Khi Làm

### `AUTO_FROM_LINK`

Dùng khi request có dòng `MODE: AUTO_FROM_LINK` hoặc được gọi từ `youtube-optimize-from-link`.

Quy tắc:

- Không dừng chờ user chọn title.
- Tự chọn `TITLE ĐÃ CHỌN` tốt nhất dựa trên transcript/title gốc.
- Vẫn liệt kê `TITLE OPTIONS`.
- Trả đủ metadata hoàn chỉnh trong một lần.
- Nếu thiếu dữ liệu, tạo output thận trọng và ghi rõ trong `GHI CHÚ`.

### `INTERACTIVE`

Dùng khi user trực tiếp yêu cầu viết title/description và chưa yêu cầu xử lý tự động.

Quy tắc:

- Nếu chỉ yêu cầu title, đưa title options và hỏi user chọn.
- Nếu user yêu cầu "all", "tất cả", "viết luôn description", hoặc đã có title, trả đủ metadata.
- Chỉ hỏi lại khi thiếu thông tin tối thiểu: video dài/ngắn hoặc dự án/nội dung chính không rõ.

## Nguồn Dữ Liệu

Nguồn chính luôn là script/transcript/title user cung cấp. Dữ liệu dự án chỉ dùng để bổ sung và kiểm chứng.

Đường dẫn dữ liệu dự án:

`$YOUTUBE_OPTIMIZE_PROJECT_INVENTORY` or a local `Project-Inventory/` folder outside the public repository.

Khi có tên dự án trong input, tìm file tương ứng và dùng thông tin có trong file để bổ sung: vị trí, pháp lý, giá, chính sách, tiện ích, link dự án. Nếu không tìm thấy file, không bịa và ghi chú "Thông tin dự án đang được cập nhật".

References đọc khi cần:

- `references/angles.md`
- `references/cta-ref.md`
- `references/hooks.md`

## Contact Block Cố Định

Luôn giữ nguyên block này trong mọi description:

```text
Thông tin liên hệ:
► Call/Zalo: 0938 786 555
► Fanpage: https://www.facebook.com/DoanKimNgaBDS
► Tiktok: https://www.tiktok.com/@doankimnga_bds_danang

Thông tin về thị trường căn hộ cao cấp Đà Nẵng:
► https://canhocaocap.danang.vn/

© Bản quyền thuộc về Đoàn Kim Nga
```

## Workflow Chuẩn

### Bước 1 - Phân tích nội dung video

Trước khi viết metadata, xác định:

1. Chủ đề chính của video.
2. Dự án hoặc khu vực được nhắc tới.
3. Loại video: Shorts/ngắn, video dài, tour căn hộ, phân tích, mở bán, review, fly-through/no-dialogue.
4. Điểm khác biệt thực sự trong nội dung.
5. Số liệu hoặc chi tiết chắc chắn có trong transcript/title/dữ liệu dự án.
6. Rủi ro bịa thông tin: mục nào chưa có dữ liệu thì không đưa vào như sự thật.

Nếu mode `INTERACTIVE` và thiếu video dài/ngắn hoặc dự án/nội dung chính, hỏi lại ngắn gọn rồi dừng. Nếu mode `AUTO_FROM_LINK`, không dừng; ghi chú dữ liệu thiếu và viết thận trọng.

### Bước 2 - Chọn angle

Chọn 1 angle chính cho `TITLE ĐÃ CHỌN`, có thể tạo title options theo nhiều angle:

- Hé lộ/Curiosity: tour, căn hộ mẫu, nội thất, điểm chưa thấy.
- FOMO/Khan hiếm: số lượng giới hạn, mở bán, căn hiếm, ưu đãi.
- Pain -> Giải pháp: khách phân vân chọn căn, ngân sách, so sánh.
- Insight/Phân tích: thị trường, đầu tư, số liệu, xu hướng.
- Đánh giá thẳng: review khách quan, ưu/nhược, có đáng mua không.

Title, thumbnail, description và first comment phải cùng một angle chính. Không dùng title FOMO rồi description lại thành bài giới thiệu tổng quan.

### Bước 3 - Viết title

Quy tắc:

- 55-70 ký tự là mục tiêu; Shorts có thể ngắn hơn nếu hook rõ.
- Có keyword dự án hoặc keyword phân khúc khi phù hợp.
- Keyword chính nên nằm trong 40 ký tự đầu.
- Không emoji trong title.
- Không dùng "Tổng quan", "Giới thiệu", "Review" một mình nếu không có hook cụ thể.
- Mỗi title option phải có angle khác nhau hoặc hook khác nhau.

Khi `AUTO_FROM_LINK`, output phải có:

TITLE ĐÃ CHỌN
```text
[title tốt nhất]
```

TITLE OPTIONS
1. [title] — [angle]
2. [title] — [angle]
3. [title] — [angle]

### Bước 4 - Viết thumbnail text

Quy tắc:

- 3-5 chữ.
- IN HOA.
- Không lặp nguyên văn title.
- Nói lý do nên xem, không chỉ nhắc lại tên dự án.

Ví dụ format:

```text
THUMBNAIL
Option A: VIEW SÔNG HIẾM — nhấn vào lợi thế view
Option B: CĂN ĐÁNG XEM — nhấn vào giá trị tour
Option C: ĐIỂM KHÁC BIỆT — nhấn vào insight
```

### Bước 5 - Viết description

Description phải là text thuần để paste YouTube, không dùng markdown heading, không in đậm, không dùng bullet `-`.

Không dùng các cụm mở đoạn kiểu tường thuật như: "Trong video này", "Theo chia sẻ trong video", "Theo nội dung video", "Đoàn Kim Nga BĐS ghi nhận...". Viết thẳng vào lợi ích, thông tin sản phẩm và bối cảnh khách hàng cần biết.

Khung bắt buộc:

```text
[DÒNG ĐẦU: title hoặc hook chính, có keyword chính trong 150 ký tự đầu]

[CTA nhỏ: mời xem thêm/link dự án nếu có. Nếu không có link cụ thể, mời liên hệ để nhận thông tin chi tiết.]

[2-4 đoạn nội dung. Mỗi đoạn 1-3 câu. Chỉ dùng thông tin khớp với angle/title. Ưu tiên điểm khác biệt, vị trí, pháp lý, giá trị lõi, insight có căn cứ.]

[Nếu cần liệt kê, chỉ dùng emoji ✅ hoặc ➖, mỗi ý một dòng. Không lạm dụng.]

[Mốc thời gian: chỉ khi video dài và có nội dung để chia mốc. Video ngắn/Shorts bỏ hẳn.]

[Contact block cố định]

[5-6 hashtag]
```

Chống lỗi description:

- Không viết thành bài tổng quan dự án nếu title đang theo angle phân tích/FOMO/review.
- Không mở đoạn bằng "Trong video này", "Theo chia sẻ trong video", "Theo nội dung video", hoặc câu tương tự.
- Không đưa quá nhiều vĩ mô; vĩ mô chỉ làm căn cứ ngắn.
- Không thêm section "Video phù hợp cho ai" hoặc "Xem thêm video liên quan".
- Không dùng emoji ngoài `✅` và `➖` trong phần liệt kê.
- Không bịa giá, số căn, tiến độ, pháp lý, chính sách nếu input/file dự án không có.
- Nếu không chắc, viết "liên hệ để cập nhật thông tin mới nhất" thay vì khẳng định.

### Bước 6 - Hashtag

Cuối description có đúng 5-6 hashtag:

- Bắt buộc: `#DoanKimNgaBDS`
- Bắt buộc: hashtag dự án nếu có, viết liền không dấu cách.
- Bắt buộc: `#BatDongSanDaNang`
- Ưu tiên thêm hashtag phân khúc/khu vực.

Ví dụ:

```text
#DoanKimNgaBDS #MasteriRiveraDaNang #CanHoCaoCapDaNang #BatDongSanDaNang #CanHoViewSongHan
```

### Bước 7 - Tags video

Tags là một dòng, phân cách bằng dấu phẩy, tổng độ dài <=500 ký tự.

Ưu tiên:

1. Dự án + Đà Nẵng.
2. Phân khúc: căn hộ cao cấp Đà Nẵng, căn hộ Đà Nẵng.
3. Nhu cầu: review, giá bán, pháp lý, vị trí, tiện ích, căn hộ mẫu.
4. Brand: Đoàn Kim Nga, Đoàn Kim Nga BĐS.

Sau khi viết, tự đếm ước lượng. Nếu có nguy cơ vượt 500 ký tự, cắt tags sản phẩm phụ trước.

### Bước 8 - First comment

First comment ngắn, không emoji, không lặp contact block.

Gồm:

- 1 câu hook tối đa khoảng 25 từ.
- Link dự án nếu có.
- Link video liên quan nếu user cung cấp sheet/context.
- Timestamp chỉ khi video dài.

## Output Format

### AUTO_FROM_LINK hoặc user yêu cầu đủ metadata

GHI CHÚ
[Dữ liệu thiếu/lỗi transcript nếu có. Nếu không có, ghi "Không có."]

PHÂN TÍCH TRANSCRIPT
[Tóm tắt 3-6 gạch ý ngắn về nội dung thật của video]

TITLE ĐÃ CHỌN
```text
[title chính]
```

TITLE OPTIONS
1. [title] — [angle]
2. [title] — [angle]
3. [title] — [angle]

ANGLE
[angle chính + lý do 1 câu]

DESCRIPTION
```text
[description text thuần]
```

TAGS
```text
[tags <=500 ký tự]
```

THUMBNAIL
Option A: [TEXT] — [ý tưởng bố cục]
Option B: [TEXT] — [ý tưởng bố cục]
Option C: [TEXT] — [ý tưởng bố cục]

FIRST COMMENT
```text
[comment]
```

QUALITY CHECK
- Title khớp transcript/angle: yes/no
- Description có contact block: yes/no
- Description là text thuần, không markdown: yes/no
- Hashtag 5-6 cái: yes/no
- Tags <=500 ký tự: yes/no
- Không bịa số liệu ngoài nguồn: yes/no

### INTERACTIVE chỉ xin title

```text
PHÂN TÍCH NHANH
[chủ đề + angle nên dùng]

TITLE OPTIONS
1. [title] — [angle]
2. [title] — [angle]
3. [title] — [angle]
4. [title] — [angle]
5. [title] — [angle]

Gợi ý dùng: Title [số] vì [lý do ngắn].
```

## Quy Tắc Lưu File

Nếu user yêu cầu lưu file, hoặc mode `AUTO_FROM_LINK` cần nội dung để lưu:

- Folder output dùng ngày xử lý hiện tại: `D:/CODE/PROJECT/Youtube Optimize/output/YYYY-MM-DD/`
- Batch tối đa 5 video/file.
- Ghi UTF-8.
- Sau khi ghi, đọc lại file để xác nhận nội dung vừa ghi tồn tại.
- Không báo hoàn tất nếu file chưa được tạo hoặc chưa đọc lại được.

## Troubleshooting

### Không có transcript

Vẫn tạo metadata nếu title/dự án đủ rõ. Description phải thận trọng, không phân tích nội dung không có trong nguồn.

### Không tìm thấy dữ liệu dự án

Không bịa. Dùng thông tin từ transcript/title và ghi chú:

```text
Thông tin dự án đang được cập nhật; metadata ưu tiên theo nội dung video/title hiện có.
```

### Input không phải BĐS Đà Nẵng

Không xử lý. Trả lời:

```text
Skill này chỉ hỗ trợ video bất động sản Đà Nẵng cho kênh BĐS của Đoàn Kim Nga.
```

### Description bị sai chuẩn

Sửa theo thứ tự:

1. Cắt phần lạc angle.
2. Bỏ markdown/bullet lạ.
3. Kiểm tra contact block.
4. Kiểm tra hashtag.
5. Kiểm tra không có số liệu bịa.
