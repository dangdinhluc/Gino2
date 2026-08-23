/*
 * Hệ thống style dùng chung cho toàn khu học tập.
 *
 * Quy ước tối giản, mọi panel đều phải tuân theo:
 * - Bo góc: chỉ 2 mức. 16px (rounded-2xl) cho khung, 12px (rounded-xl) cho phần tử bên trong.
 * - Màu nhấn: chỉ orange-700. Emerald/red chỉ dùng cho đúng/sai vì đó là ngữ nghĩa.
 * - Chữ: 3 cấp. Tiêu đề (font-bold), nội dung chính (font-semibold), phụ trợ (thường, màu nhạt).
 * - Không lồng khung trong khung. Danh sách dùng đường kẻ ngang, không dùng thẻ có viền + bóng.
 */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
export const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5';
export const panelTitleClass = 'font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]';
export const panelSubtitleClass = 'text-sm text-[#5f6b7c]';
export const dividerListClass = 'divide-y divide-[#efe5d7]';
export const searchFieldClass =
  'flex min-h-12 items-center gap-3 rounded-xl border border-[#e8dccb] bg-white px-4 text-sm text-[#5f6b7c] transition-colors focus-within:border-orange-300';
export const searchInputClass = 'min-w-0 flex-1 bg-transparent py-2 text-sm text-[#172033] outline-none placeholder:text-[#95a0af]';
export const primaryButtonClass =
  'flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800';
export const emptyStateClass = 'rounded-xl border border-dashed border-[#e8dccb] px-4 py-8 text-center';
