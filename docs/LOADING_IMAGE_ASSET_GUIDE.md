# Loading image assets

Các ảnh loading được giữ tại `public/assets/loading/` và được dùng theo đúng learning mode qua `assets.loading`.

| Mode | Ảnh gốc | Ảnh app dùng | Kích thước app | Dung lượng gốc → WebP | Giảm |
| --- | --- | --- | --- | ---: | ---: |
| Vocabulary | `3DE57664-DA73-4234-8B82-3087314E4F2C.PNG` | `vocabulary.webp` | 512 × 512 | 2,500,289 → 55,694 bytes | 97.77% |
| Documents | `251D42A5-569B-4F2D-83B1-92CC33763BA7.PNG` | `documents.webp` | 512 × 512 | 2,138,132 → 45,610 bytes | 97.87% |
| Practice | `D64351A7-561C-465A-A52D-B6B40F9A7AFC.PNG` | `practice.webp` | 512 × 512 | 2,534,748 → 54,658 bytes | 97.84% |
| Games | `38930BBD-66F5-4DE7-8D30-89684CDDB41B.PNG` | `games.webp` | 512 × 512 | 2,323,592 → 53,086 bytes | 97.72% |
| Exams | `B54E9BF5-FEE4-4432-B26B-08ED6A21D0C2.PNG` | `exams.webp` | 512 × 512 | 2,127,445 → 48,530 bytes | 97.72% |

Tổng: **11.6 MB → 257.6 KB**, giảm khoảng **97.78%**.

## Quy chuẩn tối ưu

- Định dạng: WebP, giữ alpha trong suốt.
- Chuyển từ 1254 × 1254 xuống 512 × 512; phù hợp ảnh loading hiển thị khoảng 96–160 px trên mobile và 128–192 px trên desktop.
- Nén bằng WebP quality 85, alpha quality 100, method 6 để giữ mascot rõ mà tải nhẹ.
- Component đã giữ `loading="lazy"` và `decoding="async"`.
- Khi hiển thị, nên giữ vùng ảnh cố định bằng `width`/`height` hoặc `aspect-ratio: 1` và `object-fit: contain` để tránh layout shift.

Ảnh PNG gốc được giữ nguyên trong thư mục để làm bản nguồn; app chỉ tải các file WebP.
