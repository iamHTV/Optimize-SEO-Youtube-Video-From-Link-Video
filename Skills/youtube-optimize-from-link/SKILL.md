---
name: youtube-optimize-from-link
description: >
  Xử lý tự động một hoặc nhiều link YouTube/YouTube Shorts bất động sản Đà Nẵng cho kênh Đoàn Kim Nga:
  lấy video ID, lấy title/transcript, gọi youtube-seo-bds ở chế độ AUTO, rồi bắt buộc lưu metadata vào
  `D:/CODE/PROJECT/Youtube Optimize/output/YYYY-MM-DD/batchX.md`. Dùng skill này mỗi khi user gửi link
  youtube.com/watch, youtube.com/shorts hoặc youtu.be và muốn tối ưu SEO, tạo title/description/tags,
  hoặc "xử lý video từ link". Skill này ưu tiên hoàn tất file output, không dừng chờ chọn title.
metadata:
  author: iamHTV
  version: 2.0.0
  category: workflow-automation
  tags: [youtube, automation, bat-dong-san, da-nang, metadata, transcript]
---

# Skill: YouTube Optimize From Link

Mục tiêu của skill này là biến link YouTube thành file metadata dùng được ngay. Khi chạy từ link, hãy ưu tiên tính tự động và tính chắc chắn của file output hơn việc hỏi qua lại.

## Copy Block Rule

Trong file batch, mọi phần cần copy sang YouTube Studio phải đặt trong fenced code block `text` để giao diện có nút copy riêng và không vỡ format:

- `TITLE ĐÃ CHỌN`
- `DESCRIPTION`
- `TAGS`
- `FIRST COMMENT`

Không đưa ghi chú hoặc lời giải thích vào trong code block copy.

## Nguyên tắc vận hành

- Chế độ mặc định của skill này là `AUTO_FROM_LINK`.
- Không dừng để hỏi user chọn title nếu đã có đủ title/transcript để tự chọn phương án tốt nhất.
- Nếu thiếu transcript nhưng vẫn có title/dự án, vẫn tạo metadata cơ bản và lưu file, kèm ghi chú rõ "Không lấy được transcript".
- Chỉ hỏi lại user khi không có đủ dữ liệu tối thiểu để viết đúng bản chất video: link không hợp lệ, video không phải BĐS Đà Nẵng, hoặc không nhận diện được nội dung nào ngoài một link hỏng.
- Mọi lần chạy thành công phải tạo hoặc cập nhật file batch trong `D:/CODE/PROJECT/Youtube Optimize/output/{YYYY-MM-DD}/`.

## Pre-flight

Trước khi xử lý:

1. Xác định ngày hiện tại bằng system date. Folder output dùng ngày xử lý, không dùng ngày đăng video.
2. Tạo folder nếu chưa tồn tại:
   `D:/CODE/PROJECT/Youtube Optimize/output/{YYYY-MM-DD}/`
3. Xác định batch file:
   - Mỗi `batchX.md` tối đa 5 video.
   - Nếu batch mới cần tạo, ghi header: `# Metadata Output — YouTube BĐS Đà Nẵng`
   - Nếu batch hiện tại đã có 5 block `## VIDEO`, tạo batch tiếp theo.
4. Với nhiều link, giữ đúng thứ tự user gửi.

## Workflow

### Bước 1 - Extract video ID

Nhận các dạng URL:

- `https://www.youtube.com/shorts/{id}`
- `https://www.youtube.com/watch?v={id}`
- `https://youtu.be/{id}`
- ID YouTube 11 ký tự

Nếu có nhiều URL, xử lý batch.

### Bước 2 - Lấy title hiện tại

Dùng web/page title nếu truy cập được. Nếu không lấy được title, dùng video ID làm placeholder và ghi chú trong output.

Không để lỗi lấy title làm dừng toàn bộ workflow.

### Bước 3 - Lấy transcript

Chạy script:

```powershell
python "D:/CODE/PROJECT/Youtube Optimize/Skills/youtube-seo-bds/scripts/get_transcript.py" "<VIDEO_URL_OR_ID>" --output-dir "D:/CODE/PROJECT/Youtube Optimize/tmp/transcripts" --json --timeout 15
```

Quy tắc:

- Luôn đọc transcript từ file được script báo về, không lấy stdout làm transcript.
- Nếu script không trả JSON do lỗi môi trường, tìm file `transcript_{video_id}.txt` trong `tmp/transcripts` hoặc current directory.
- Nếu transcript dưới 200 ký tự hoặc chủ yếu là nhạc/nhiễu, phân loại `fly-through/no-dialogue`.
- Sau khi đã lưu metadata xong, xoá transcript tạm nếu file nằm trong `tmp/transcripts`.

### Bước 4 - Gọi `youtube-seo-bds` ở chế độ AUTO

Cung cấp context rõ ràng:

```text
MODE: AUTO_FROM_LINK
URL: [url]
VIDEO_ID: [id]
CURRENT_TITLE: [title lấy được]
VIDEO_TYPE: short nếu Shorts hoặc transcript ngắn, long nếu video dài/transcript dài
TRANSCRIPT: [nội dung transcript nếu có]
PROJECT_HINT: [dự án nhận diện từ title/transcript nếu có]
OUTPUT_REQUIRED: full metadata + selected title, không dừng chờ user chọn
```

Yêu cầu kết quả từ `youtube-seo-bds` phải có:

- `TITLE ĐÃ CHỌN`
- `TITLE OPTIONS`
- `ANGLE`
- `PHÂN TÍCH TRANSCRIPT` hoặc ghi chú không có transcript
- `DESCRIPTION`
- `TAGS`
- `THUMBNAIL`
- `FIRST COMMENT`
- `QUALITY CHECK`

### Bước 5 - Lưu file batch

Mỗi video phải được append vào batch theo format:

````markdown
## VIDEO [N]: [TITLE ĐÃ CHỌN]
**URL:** [url]
**Video ID:** [id]
**Title gốc:** [title lấy được]
**Ngày xử lý:** YYYY-MM-DD
**Loại video:** short | long | fly-through/no-dialogue

### GHI CHÚ
[ghi chú lỗi hoặc dữ liệu thiếu, nếu có]

### PHÂN TÍCH TRANSCRIPT
[tóm tắt ngắn hoặc "Không có transcript đủ dài."]

### TITLE ĐÃ CHỌN
```text
[title chính để dùng]
```

### TITLE OPTIONS
1. ...
2. ...
3. ...

### ANGLE
[angle]

### DESCRIPTION
```text
[description text thuần để paste YouTube]
```

### TAGS
```text
[tags, <=500 ký tự]
```

### THUMBNAIL TEXT
[3 option]

### FIRST COMMENT
```text
[first comment]
```

### QUALITY CHECK
- File đã lưu: yes
- Description đúng format: yes/no
- Tags <=500 ký tự: yes/no
- Contact block đầy đủ: yes/no
````

Sau khi ghi file, đọc lại file để xác nhận block vừa append có tồn tại. Nếu chưa tồn tại, ghi lại một lần nữa và báo lỗi nếu vẫn thất bại.

## Description cho video không có thoại

Vẫn dùng `youtube-seo-bds` nhưng truyền `VIDEO_TYPE: fly-through/no-dialogue`.

Description nên ngắn hơn, tập trung vào:

- Tên dự án/căn hộ nếu nhận diện được
- View/vị trí/điểm đáng chú ý từ title
- CTA liên hệ cố định
- Hashtag chuẩn

Không dùng các cụm mở đoạn kiểu "Trong video này", "Theo chia sẻ trong video", "Theo nội dung video", hoặc "Đoàn Kim Nga BĐS ghi nhận...". Description phải đi thẳng vào thông tin sản phẩm và lý do nên quan tâm.

Không bịa số liệu nếu không có transcript hoặc dữ liệu dự án.

## Xử lý lỗi

### Không lấy được transcript

Không dừng workflow. Tạo output từ title và dữ liệu dự án nếu có.

Trong `GHI CHÚ`, ghi:

```text
Không lấy được transcript hoặc video không có subtitle. Metadata được tạo từ title hiện tại và dữ liệu dự án nhận diện được.
```

### Không tạo được file output

Thử lại theo thứ tự:

1. Kiểm tra folder ngày đã tồn tại chưa.
2. Tạo folder bằng PowerShell `New-Item -ItemType Directory -Force`.
3. Ghi batch bằng UTF-8.
4. Đọc lại file để xác nhận.

Không kết luận hoàn tất nếu chưa đọc lại được file output.

### Không nhận diện được dự án

Vẫn có thể xử lý nếu nội dung là BĐS Đà Nẵng. Viết chung, không gán sai dự án.

### Video không phải BĐS Đà Nẵng

Không tạo metadata. Trả lời ngắn:

```text
Skill này chỉ hỗ trợ video bất động sản Đà Nẵng cho kênh BĐS của Đoàn Kim Nga.
```
