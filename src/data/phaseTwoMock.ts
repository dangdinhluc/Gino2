export interface PhaseMetric {
  label: string;
  value: string;
  sub: string;
  tone: 'orange' | 'blue' | 'emerald' | 'violet' | 'pink' | 'amber';
}

export interface OnboardingStep {
  title: string;
  sub: string;
  options: string[];
}

export interface FriendItem {
  id: string;
  name: string;
  level: string;
  xp: number;
  streak: number;
  status: string;
}

export interface MessageThread {
  id: string;
  name: string;
  label: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface GrammarTopic {
  id: string;
  title: string;
  level: string;
  category: string;
  summary: string;
  rules: string[];
  examples: Array<{ jp: string; vi: string }>;
  drills: string[];
}

export interface VocabularyEntry {
  id: string;
  word: string;
  article: string;
  meaning: string;
  level: string;
  pronunciation: string;
  examples: Array<{ jp: string; vi: string }>;
  related: string[];
}

export interface PracticeHistoryItem {
  id: string;
  title: string;
  date: string;
  score: number;
  status: string;
  summary: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  prompt: string;
  excerpt: string;
  tags: string[];
}

export interface SettingsSection {
  title: string;
  sub: string;
  items: Array<{ key: string; label: string; description: string; enabled: boolean }>;
}

export interface LegalSection {
  title: string;
  body: string;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Mục tiêu học',
    sub: 'Chọn lý do chính để app gợi ý lộ trình mock phù hợp.',
    options: ['Đỗ JFT-Basic', 'Qua phỏng vấn Tokutei', 'Làm chắc hồ sơ và quy trình'],
  },
  {
    title: 'Trình độ hiện tại',
    sub: 'Phase này chỉ lưu lựa chọn trên UI, chưa ghi backend.',
    options: ['Chưa biết tiếng Nhật', 'Đang học JFT/N5', 'Đã có nền và cần luyện phản xạ'],
  },
  {
    title: 'Nhịp học',
    sub: 'Chọn phiên ngắn để giữ streak mà không bị ngợp.',
    options: ['8 phút/ngày', '15 phút/ngày', '30 phút/ngày'],
  },
];

export const phaseTwoMetrics: PhaseMetric[] = [
  { label: 'Track', value: 'Tokutei', sub: 'đang mock', tone: 'orange' },
  { label: 'Mục tiêu', value: '60 XP', sub: 'mỗi ngày', tone: 'blue' },
  { label: 'Nhịp học', value: '20 phút', sub: 'gợi ý', tone: 'emerald' },
];

export const friends: FriendItem[] = [
  { id: 'mai', name: 'Mai Tran', level: 'JFT', xp: 1480, streak: 6, status: 'Vừa xong mini mock đầu ca' },
  { id: 'nam', name: 'Nam Pham', level: 'Workplace', xp: 2160, streak: 12, status: 'Đang luyện nhà hàng Tokutei' },
  { id: 'hana', name: 'Hana Le', level: 'Interview', xp: 3020, streak: 18, status: 'Mới hoàn thành HR mock room' },
  { id: 'anh', name: 'Anh', level: 'Tokutei', xp: 320, streak: 1, status: 'Bạn đang ở đây' },
];

export const messageThreads: MessageThread[] = [
  { id: 'zalo-main', name: 'Nhóm Tokutei Nhà hàng', label: 'Zalo', lastMessage: 'Tối nay ôn 5 câu tự giới thiệu và checklist đầu ca.', time: '20:15', unread: 3 },
  { id: 'mentor', name: 'Gino Mentor', label: 'AI tutor', lastMessage: 'Anh gửi câu trả lời phỏng vấn, em sẽ rút còn 2 ý chính.', time: '18:40', unread: 1 },
  { id: 'hr-room', name: 'HR Mock Room', label: 'Exam', lastMessage: 'Mock interview cuối tuần đã mở bộ câu hỏi mới.', time: '09:10', unread: 0 },
];

export const grammarTopics: GrammarTopic[] = [
  {
    id: 'aisatsu',
    title: 'Aisatsu khi vào ca',
    level: 'JFT Basic',
    category: 'Giao tiếp',
    summary: 'Lời chào đầu ca cần ngắn, rõ và thể hiện thái độ làm việc nghiêm túc.',
    rules: ['Chào quản lý và đội trước khi vào vị trí.', 'Giữ âm lượng rõ, không quá nhỏ.', 'Theo sau bằng một câu xác nhận sẵn sàng làm việc.'],
    examples: [
      { jp: 'Ohayou gozaimasu. Yoroshiku onegaishimasu.', vi: 'Chào buổi sáng. Hôm nay cũng mong được giúp đỡ.' },
      { jp: 'Hai, junbi dekimashita.', vi: 'Vâng, em đã sẵn sàng.' },
    ],
    drills: ['Đọc to 2 câu mở đầu đầu ca.', 'Chọn câu chào phù hợp với quản lý.'],
  },
  {
    id: 'houkoku-renraku',
    title: 'Báo cáo - liên lạc - trao đổi',
    level: 'Tokutei Core',
    category: 'Tác phong',
    summary: 'Khi có vấn đề, ưu tiên báo cáo sớm, nói ngắn và xác nhận lại hướng dẫn.',
    rules: ['Gặp sự cố thì báo ngay, không tự ý xử lý nếu chưa rõ.', 'Nhắc lại hướng dẫn để tránh hiểu sai.', 'Khi đổi ca hoặc trễ giờ, phải liên lạc sớm.'],
    examples: [
      { jp: 'Mondai ga areba, sugu houkoku shimasu.', vi: 'Nếu có vấn đề, em sẽ báo cáo ngay.' },
      { jp: 'Mou ichido onegaishimasu.', vi: 'Xin nhắc lại cho em một lần nữa.' },
    ],
    drills: ['Chọn câu báo cáo ngắn gọn nhất.', 'Điền cụm xin nhắc lại hướng dẫn.'],
  },
  {
    id: 'five-s',
    title: '5S và an toàn nơi làm việc',
    level: 'Workplace',
    category: 'Vận hành',
    summary: 'Trước khi thao tác, cần giữ khu vực sạch, đúng vị trí và tránh các rủi ro cơ bản.',
    rules: ['Dọn gọn và kiểm tra đúng vị trí dụng cụ.', 'Không tự bỏ qua checklist vì nghĩ mình nhớ rồi.', 'Khi thấy nguy cơ, ưu tiên báo cáo thay vì tự phán đoán.'],
    examples: [
      { jp: 'Kiken desu. Kochira wa sawaranaide kudasai.', vi: 'Nguy hiểm. Xin đừng chạm vào khu vực này.' },
      { jp: 'Saigo ni checklist o kakunin shimasu.', vi: 'Cuối cùng, em sẽ kiểm tra lại checklist.' },
    ],
    drills: ['Xác định hành động nào vi phạm an toàn.', 'Ghép nội dung 5S với ví dụ đúng.'],
  },
  {
    id: 'self-intro',
    title: 'Tự giới thiệu 30-45 giây',
    level: 'Interview',
    category: 'Phỏng vấn',
    summary: 'Một câu trả lời tốt cần đủ tên, mục tiêu, thái độ và dừng đúng lúc.',
    rules: ['Bắt đầu bằng tên và quê quán ngắn gọn.', 'Nói mục tiêu đi Nhật và thái độ học việc.', 'Kết thúc khi đã đủ ý, không lan man.'],
    examples: [
      { jp: 'Watashi wa Minh desu. Nihon de nagaku hatarakitai desu.', vi: 'Em là Minh. Em muốn làm việc ổn định lâu dài ở Nhật.' },
      { jp: 'Hayaku oshiete, sugu manabimasu.', vi: 'Em học nhanh và sẽ cố gắng bắt nhịp sớm.' },
    ],
    drills: ['Tự ghi âm 30 giây giới thiệu.', 'Cắt bớt câu thừa trong câu trả lời.'],
  },
];

export const vocabularyEntries: VocabularyEntry[] = [
  {
    id: 'zairyu-card',
    word: 'zairyu card',
    article: '—',
    meaning: 'thẻ cư trú',
    level: 'Tokutei',
    pronunciation: 'zai-ryu ka-do',
    examples: [
      { jp: 'Mendou demo zairyu card wa itsumo kakunin shimasu.', vi: 'Dù gấp, vẫn phải kiểm tra lại thẻ cư trú.' },
      { jp: 'Mensetsu mae ni zairyu card o junbi shite kudasai.', vi: 'Trước buổi phỏng vấn, hãy chuẩn bị thẻ cư trú.' },
    ],
    related: ['passport', 'application', 'photo'],
  },
  {
    id: 'kinkyu-renraku',
    word: 'kinkyu renraku',
    article: '—',
    meaning: 'liên lạc khẩn cấp',
    level: 'Workplace',
    pronunciation: 'kin-kyu ren-ra-ku',
    examples: [
      { jp: 'Kinkyu renraku no toki wa sugu tenchou ni tsutaemasu.', vi: 'Khi có liên lạc khẩn cấp, hãy báo ngay cho quản lý.' },
    ],
    related: ['houkoku', 'anzen', 'tenchou'],
  },
];

export const writingHistory: PracticeHistoryItem[] = [
  { id: 'w1', title: 'Tự giới thiệu 45 giây', date: '2026-05-06', score: 78, status: 'Cần gọn hơn', summary: 'Ý rõ nhưng còn dài, nên cắt bớt 1 câu phụ và chốt ý sớm hơn.' },
  { id: 'w2', title: 'Tin nhắn xin đổi ca', date: '2026-05-05', score: 84, status: 'Ổn định', summary: 'Lời nhắn lịch sự, chỉ cần thêm thời điểm và xác nhận lại ca thay thế.' },
  { id: 'w3', title: 'Checklist trước phỏng vấn', date: '2026-05-03', score: 71, status: 'Cần rõ bước hơn', summary: 'Đủ ý nhưng thiếu thứ tự ưu tiên giữa hồ sơ, trang phục và câu chào mở đầu.' },
];

export const speakingHistory: PracticeHistoryItem[] = [
  { id: 's1', title: 'Shadowing: lời chào đầu ca', date: '2026-05-06', score: 82, status: 'Rõ hơn', summary: 'Âm cuối ổn hơn, cần chắc hơn ở cụm lịch sự đầu câu.' },
  { id: 's2', title: 'HR mock: lý do sang Nhật', date: '2026-05-04', score: 76, status: 'Cần chậm lại', summary: 'Đủ ý nhưng nên ngắt giữa mục tiêu và cam kết để dễ nghe hơn.' },
  { id: 's3', title: 'Xin trợ giúp khi chưa hiểu', date: '2026-05-02', score: 88, status: 'Tốt', summary: 'Phản xạ tốt, biết xin nhắc lại đúng lúc và không trả lời vòng vo.' },
];

export const journalEntries: JournalEntry[] = [
  { id: 'j1', title: 'Checklist trước ngày phỏng vấn', date: '2026-05-06', prompt: 'Ghi lại 5 việc phải kiểm tra tối nay.', excerpt: 'Hộ chiếu, ảnh hồ sơ, câu chào mở đầu, trang phục và đường đi đến điểm hẹn...', tags: ['tokutei', 'daily'] },
  { id: 'j2', title: 'Một ca làm lý tưởng', date: '2026-05-04', prompt: 'Mô tả ngắn cách anh muốn bắt đầu ca làm.', excerpt: 'Em đến sớm 10 phút, chào đội, kiểm tra vị trí, rồi xác nhận checklist đầu ca...', tags: ['workplace', 'writing'] },
];

export const settingsSections: SettingsSection[] = [
  {
    title: 'Học tập',
    sub: 'Nhịp nhắc và mục tiêu mock cho dashboard.',
    items: [
      { key: 'daily-reminder', label: 'Nhắc học mỗi ngày', description: 'Hiện nhắc nhẹ khi chưa đủ XP.', enabled: true },
      { key: 'review-first', label: 'Ưu tiên ôn tập', description: 'Đưa các mục sắp phỏng vấn hoặc sắp quên lên đầu.', enabled: true },
    ],
  },
  {
    title: 'AI và cộng đồng',
    sub: 'Các tùy chọn này chỉ là UI shell.',
    items: [
      { key: 'ai-feedback', label: 'Feedback AI ngắn gọn', description: 'Giới hạn mỗi lượt sửa 1-2 lỗi chính hoặc 1 ý phỏng vấn.', enabled: true },
      { key: 'community-badges', label: 'Hiện huy hiệu cộng đồng', description: 'Cho bạn học thấy streak và track hiện tại.', enabled: false },
    ],
  },
];

export const termsSections: LegalSection[] = [
  { title: 'Mục đích sử dụng', body: 'TOKUTEI GINO bản mock hỗ trợ học tiếng Nhật nền, luyện Tokutei và theo dõi tiến độ cá nhân. Nội dung không thay thế tư vấn pháp lý hoặc hướng dẫn tuyển dụng chính thức.' },
  { title: 'Tài khoản và dữ liệu', body: 'Ở phase UI hiện tại, dữ liệu hiển thị là mockdata trong mã nguồn và chưa đồng bộ lên máy chủ thật.' },
  { title: 'Giới hạn trách nhiệm', body: 'Điểm số, feedback AI và lịch ôn trong bản này chỉ dùng để chốt trải nghiệm giao diện.' },
];

export const privacySections: LegalSection[] = [
  { title: 'Dữ liệu cá nhân', body: 'Bản UI hiện chưa thu thập dữ liệu cá nhân thật. Hồ sơ người học, XP, streak và lịch sử luyện tập đều là dữ liệu mẫu.' },
  { title: 'AI feedback', body: 'Các phản hồi AI trong phase này là câu trả lời giả lập, chưa gửi nội dung của anh tới dịch vụ bên ngoài.' },
  { title: 'Thông báo', body: 'Cài đặt thông báo chỉ thay đổi trạng thái trên giao diện mock, chưa kích hoạt push notification thật.' },
];
