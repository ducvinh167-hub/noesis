# NOESIS website

Một website tĩnh, chỉ dùng HTML/CSS/JavaScript và Markdown. Cấu trúc lấy cảm hứng từ trang văn bản của Dario Amodei: giới thiệu ngắn ở đầu, sau đó là essays và ghi chép. Toàn bộ giao diện dùng đen–trắng.

## Viết và xuất bản

1. Mở `studio.html` để viết, xem trước và tải tệp Markdown.
2. Đưa tệp `.md` vào `content/docs/`.
3. Thêm một mục tương ứng vào đầu mảng trong `content/documents.json`; nút **Sao chép mục danh mục** trong Studio tạo sẵn phần này.
4. Bài viết sẽ tự xuất hiện ở trang `writing.html` và có thể đọc tại `read.html`.

`content/docs/TEMPLATE.md` là mẫu cho một bài mới.

## Xem trên máy

Mở thư mục này bằng một web server tĩnh (ví dụ tiện ích Live Server trong VS Code), rồi mở `index.html`. Không nên mở trực tiếp tệp HTML bằng cách bấm đúp, vì trình duyệt sẽ chặn việc tải các tệp Markdown.

## Đưa lên mạng

Đây là site tĩnh, nên có thể đưa lên GitHub Pages, Cloudflare Pages hoặc Netlify mà không cần server. Khi bạn chọn nơi triển khai, có thể nối thêm một CMS đăng nhập để xuất bản trực tiếp từ trình duyệt.
