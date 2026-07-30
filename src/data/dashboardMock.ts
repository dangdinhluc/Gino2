/**
 * Dữ liệu mẫu cho Dashboard.
 *
 * Tách khỏi `DashboardPage.tsx` để component chỉ còn lo hiển thị. Khi có dữ liệu
 * thật (nhiệm vụ theo user, XP thật) chỉ cần thay nguồn trả về đúng shape này.
 */

export interface DashboardTool {
  label: string;
  sub: string;
  /** URL icon */
  icon: string;
  path: string;
}

export interface DashboardTask {
  title: string;
  xp: string;
  status: string;
  icon: string;
  /** Class gradient Tailwind cho vạch màu bên trái */
  gradient: string;
  path: string;
}

/** Số công cụ hiện mặc định trên Dashboard. Phần còn lại ẩn sau nút "Xem tất cả". */
export const PRIMARY_TOOL_COUNT = 3;

/** Thứ tự quan trọng: 3 mục đầu là đường vào chính mỗi ngày. */
export const dashboardTools: DashboardTool[] = [
  {
    label: 'Lộ trình Tokutei',
    sub: 'JFT, workplace, interview',
    icon: 'https://cdn-icons-png.flaticon.com/512/3306/3306613.png',
    path: '/app/courses',
  },
  {
    label: 'Thẻ ôn nhanh',
    sub: 'Cụm từ, hồ sơ, tình huống',
    icon: 'https://cdn-icons-png.flaticon.com/512/2951/2951237.png',
    path: '/app/review/flashcards',
  },
  {
    label: 'Đề mô phỏng',
    sub: 'JFT, hồ sơ, HR',
    icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233514.png',
    path: '/app/exams/e1/start',
  },
  {
    label: 'Thư viện Tokutei',
    sub: 'Checklist, tác phong, từ khóa',
    icon: 'https://cdn-icons-png.flaticon.com/512/2436/2436814.png',
    path: '/app/grammar',
  },
  {
    label: 'Mini game ca làm',
    sub: 'Phản xạ 1-3 phút',
    icon: 'https://cdn-icons-png.flaticon.com/512/3128/3128211.png',
    path: '/app/hub',
  },
  {
    label: 'Coach AI',
    sub: 'Sửa câu trả lời nhanh',
    icon: 'https://cdn-icons-png.flaticon.com/512/3474/3474360.png',
    path: '/app/ai-chat',
  },
  {
    label: 'Thống kê',
    sub: 'Mức sẵn sàng của anh',
    icon: 'https://cdn-icons-png.flaticon.com/512/570/570223.png',
    path: '/app/stats',
  },
];

export const dashboardTasks: DashboardTask[] = [
  {
    title: 'Ôn 8 cụm đầu ca',
    xp: '+12',
    status: '0/1',
    icon: 'https://cdn-icons-png.flaticon.com/512/2040/2040504.png',
    gradient: 'from-blue-400 to-blue-600',
    path: '/app/review/flashcards',
  },
  {
    title: 'Shift Sprint',
    xp: '+25',
    status: '0/1',
    icon: 'https://cdn-icons-png.flaticon.com/512/5351/5351432.png',
    gradient: 'from-orange-400 to-orange-600',
    path: '/app/hub/gino-runner',
  },
  {
    title: 'Mock interview 3 câu',
    xp: '+20',
    status: '0/1',
    icon: 'https://cdn-icons-png.flaticon.com/512/3128/3128211.png',
    gradient: 'from-green-400 to-green-600',
    path: '/app/ai-speak',
  },
  {
    title: 'Checklist hồ sơ',
    xp: '+10',
    status: '0/1',
    icon: 'https://cdn-icons-png.flaticon.com/512/2951/2951237.png',
    gradient: 'from-purple-400 to-purple-600',
    path: '/app/grammar',
  },
];
