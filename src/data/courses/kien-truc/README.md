# Gino2 — Khóa Kiến trúc & Xây dựng

Dữ liệu nguồn được chuẩn hóa từ Google Sheet `Câu hỏi Thi kiến trúc gino2`.

- 389 câu hỏi trắc nghiệm tiếng Nhật: 361 câu từ `leader`, 28 câu từ `Trang tính4`.
- 99 mục từ vựng từ `Từ vựng leader`.
- 389/389 câu đã ánh xạ được `correct_index`.
- Có 1 nhóm câu trùng trong nguồn (`kt-q-0054`, `kt-q-0056`) và được giữ nguyên.
- `question_image_ref` hiện là nhãn hình trong sheet, không phải URL ảnh.
- Hai sheet `Chương 1` và `từ vựng chương 1` hiện trống nên không xuất dữ liệu.

`manifest.json` liệt kê toàn bộ các part file. Mỗi câu giữ `source_sheet`, `source_row`, `source_question_no` để truy vết về dữ liệu gốc.

Đây là lớp **source-data**; chưa tự động thay đổi runtime schema hoặc dữ liệu Supabase.
