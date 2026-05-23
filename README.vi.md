# Optimize SEO Youtube Video From Link Video

Dự án này là workflow dùng AI để biến link YouTube, link Shorts, transcript hoặc script thô thành bộ metadata có thể copy vào YouTube Studio.

Hiện tại workflow được tối ưu cho nội dung bất động sản Đà Nẵng, đặc biệt là quy trình làm video cho kênh Đoàn Kim Nga BĐS. Vẫn có thể chỉnh lại để dùng cho niche khác.

## Công Dụng Hiện Tại

Với mỗi video, workflow có thể tạo:

- title đã chọn
- các title option thay thế
- description chuẩn YouTube
- tags trong giới hạn ký tự phù hợp
- gợi ý chữ thumbnail
- first comment để ghim
- quality check
- file batch Markdown để lưu lại và copy nhanh

Các phần hay copy sang YouTube Studio như title, description, tags và first comment được đặt trong code block `text`, nhờ vậy format ít bị vỡ và giao diện Markdown thường có nút copy riêng.

## Cách Chạy Workflow Hiện Tại

Người dùng đưa vào một hoặc nhiều dữ liệu:

- link YouTube hoặc YouTube Shorts
- transcript hoặc script
- title hiện tại của video
- ghi chú về dự án, angle hoặc định vị nội dung

Workflow sẽ:

1. Lấy video ID từ link.
2. Lấy title hiện tại nếu làm được.
3. Thử lấy transcript.
4. Nhận diện video Shorts, video không thoại hoặc chỉ có nhạc một cách thận trọng.
5. Gọi skill SEO để tạo metadata.
6. Lưu kết quả vào `output/YYYY-MM-DD/batchX.md` khi chạy local.
7. Xóa transcript tạm sau khi xử lý xong.

Các thư mục output và dữ liệu làm việc riêng không được đưa lên GitHub.

## Các Skill Chính

- `Skills/youtube-optimize-from-link/`  
  Skill xử lý từ link. Dùng khi có một hoặc nhiều link YouTube. Skill này lấy thông tin video, lấy transcript nếu có, gọi skill SEO và lưu kết quả vào file batch.

- `Skills/youtube-seo-bds/`  
  Skill tạo metadata YouTube cho video bất động sản. Skill này quyết định title, description, tags, thumbnail text, first comment, CTA, quality check và format code block để copy.

- `Skills/youtube-sheet-reader/`  
  Skill phụ để đọc ngữ cảnh từ sheet hoặc dữ liệu export khi cần.

## Sau Khi Sửa Thì Khác Gì Bản Gốc?

Bản gốc thiên về workflow cũ: cần script/ngữ cảnh chuẩn bị sẵn, record thủ công nhiều hơn, và pipeline cũ có phần dễ lỗi khi scan hoặc lấy dữ liệu.

Bản hiện tại đã được sửa theo hướng dùng hằng ngày mượt hơn:

- Có thể bắt đầu trực tiếp từ link YouTube hoặc Shorts.
- Xử lý được nhiều link trong một batch.
- Tự lưu kết quả vào file theo ngày.
- Không bị kẹt hoàn toàn nếu video không lấy được transcript.
- Với video chỉ có nhạc hoặc ít thoại, workflow ghi chú thận trọng thay vì bịa nội dung.
- Title, description, tags và first comment có code block để copy nhanh.
- Description tránh các câu mở đầu yếu như "Trong video này..." hoặc "Theo chia sẻ trong video...".
- Có quality check rõ hơn: độ dài tags, đúng format, đủ contact block, không bịa số liệu ngoài nguồn.
- Có `.gitignore` để không đưa output, tmp, Records, trash, env hoặc dữ liệu riêng lên GitHub.

Nói ngắn gọn: bản hiện tại không chỉ là nơi viết description thủ công nữa. Nó là workflow bán tự động để lấy link video, tạo metadata, lưu batch, và copy nhanh sang YouTube Studio.

## Cấu Trúc Repo

- `Docs/` - tài liệu dự án, spec workflow, requirement và tài liệu legacy
- `Script/` - Google Apps Script hỗ trợ
- `Skills/` - các skill AI/Codex dùng để xử lý workflow
- `.gitignore` - loại trừ output, file tạm, record riêng, trash, env và export local

Các thư mục local bị ignore:

- `output/`
- `tmp/`
- `Records/`
- `.trash/`

## Yêu Cầu Local

Tùy cách chạy, máy local có thể cần:

- Python 3
- `yt-dlp`
- script lấy transcript tại `Skills/youtube-seo-bds/scripts/get_transcript.py`
- dữ liệu Project Inventory riêng nếu muốn bổ sung thông tin dự án

Đường dẫn Project Inventory riêng nên cấu hình local, không commit lên GitHub.

## Giới Hạn

Dự án này chỉ chuẩn bị metadata YouTube. Nó không tự đăng lên YouTube Studio. Người dùng vẫn cần review title, description, tags, thumbnail text và first comment trước khi publish.
