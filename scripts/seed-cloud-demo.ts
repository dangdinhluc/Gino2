import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const DEMO_ADMIN_EMAIL = 'admin.demo@gino2.app';
const DEMO_LEARNER_EMAIL = 'learner.demo@gino2.app';
const DEMO_STAFF_USERS = [
  { email: 'editor.demo@gino2.app', displayName: 'Demo Content Editor', role: 'content_editor' },
  { email: 'support.demo@gino2.app', displayName: 'Demo Instructor Support', role: 'instructor_support' },
  { email: 'analyst.demo@gino2.app', displayName: 'Demo Analyst', role: 'analyst' },
] as const;
const DEMO_PACKAGE_IDS = ['demo-package-free', 'demo-package-tokutei', 'demo-package-interview'];
const DEMO_UUIDS = {
  annotation: '10000000-0000-4000-8000-000000000001',
  conversation: '10000000-0000-4000-8000-000000000002',
  userMessage: '10000000-0000-4000-8000-000000000003',
  assistantMessage: '10000000-0000-4000-8000-000000000004',
  writingSubmission: '10000000-0000-4000-8000-000000000005',
  journalOne: '10000000-0000-4000-8000-000000000006',
  journalTwo: '10000000-0000-4000-8000-000000000007',
  announcement: '10000000-0000-4000-8000-000000000008',
  notificationOne: '10000000-0000-4000-8000-000000000009',
  notificationTwo: '10000000-0000-4000-8000-000000000010',
  deliveryOne: '10000000-0000-4000-8000-000000000011',
  deliveryTwo: '10000000-0000-4000-8000-000000000012',
  intervention: '10000000-0000-4000-8000-000000000013',
  speakingOne: '10000000-0000-4000-8000-000000000014',
  speakingTwo: '10000000-0000-4000-8000-000000000015',
};

type LessonBlueprint = {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  lessonType: string;
  durationMinutes: number;
  objectives: string[];
  vocab: Array<[term: string, translation: string, pronunciation: string, example: string]>;
  question: { prompt: string; answer: string; options: string[]; explanation: string };
};

const courses = [
  { id: 'demo-course-a1', slug: 'demo-tokutei-a1-foundation', title: 'Demo · Tokutei A1 Foundation', level: 'A1', description: 'Nền tảng tiếng Nhật đời sống, giờ giấc và giao tiếp đầu ca.', theme_color: '#2563eb', order_index: 1 },
  { id: 'demo-course-workplace', slug: 'demo-workplace-japanese', title: 'Demo · Workplace Japanese', level: 'A2', description: 'Tiếng Nhật nơi làm việc: báo cáo, an toàn và xác nhận chỉ dẫn.', theme_color: '#16a34a', order_index: 2 },
  { id: 'demo-course-interview', slug: 'demo-tokutei-interview', title: 'Demo · Tokutei Interview', level: 'N4', description: 'Tự giới thiệu, mục tiêu, điểm mạnh và trả lời phỏng vấn ngắn gọn.', theme_color: '#db2777', order_index: 3 },
  { id: 'demo-course-kaigo', slug: 'demo-kaigo-workplace', title: 'Demo · Kaigo Workplace', level: 'A2', description: 'Cụm từ chăm sóc, nhu cầu người dùng và báo cáo sự cố an toàn.', theme_color: '#ea580c', order_index: 4 },
].map((course) => ({ ...course, status: 'published', published_at: new Date().toISOString() }));

const modules = [
  ['demo-module-a1-daily', 'demo-course-a1', 'Daily Basics', 'Chào hỏi, số đếm và giờ giấc.', 'A1', 1],
  ['demo-module-a1-shift', 'demo-course-a1', 'Daily Shift', 'Nhịp ca, nghỉ giải lao và xác nhận lịch.', 'A1', 2],
  ['demo-module-work-report', 'demo-course-workplace', 'Report and Confirm', 'Báo cáo vấn đề và xác nhận chỉ dẫn.', 'A2', 1],
  ['demo-module-work-safety', 'demo-course-workplace', 'Safety at Work', 'Biển báo, cấm, nguy hiểm và giao tiếp nội bộ.', 'A2', 2],
  ['demo-module-interview-profile', 'demo-course-interview', 'Profile and Motivation', 'Hồ sơ, xuất thân, kinh nghiệm và mục tiêu.', 'N4', 1],
  ['demo-module-interview-roleplay', 'demo-course-interview', 'Interview Role-play', 'Điểm mạnh, lịch làm và câu hỏi thường gặp.', 'N4', 2],
  ['demo-module-kaigo-care', 'demo-course-kaigo', 'Basic Care', 'Hỗ trợ vận động, ăn uống và nhu cầu hằng ngày.', 'A2', 1],
  ['demo-module-kaigo-report', 'demo-course-kaigo', 'Incident Report', 'Đau, sốt, ngã và ghi nhận thay đổi.', 'A2', 2],
].map(([id, courseId, title, description, level, orderIndex]) => ({ id, course_id: courseId, title, description, level, status: 'published', order_index: orderIndex }));

const lessonBlueprints: LessonBlueprint[] = [
  { id: 'demo-lesson-a1-greeting', courseId: 'demo-course-a1', moduleId: 'demo-module-a1-daily', title: 'Greeting at Work', description: 'Chào hỏi lịch sự khi bắt đầu ngày học và ngày làm.', lessonType: 'conversation', durationMinutes: 18, objectives: ['Chào đầu ca', 'Dùng câu lịch sự'], vocab: [['おはようございます', 'chào buổi sáng', 'ohayou gozaimasu', 'おはようございます。今日もよろしくお願いします。'], ['よろしくお願いします', 'mong được giúp đỡ', 'yoroshiku onegaishimasu', '今日もよろしくお願いします。'], ['はじめまして', 'rất vui được làm quen', 'hajimemashite', 'はじめまして。よろしくお願いします。']], question: { prompt: 'Câu nào phù hợp để chào đầu ca?', answer: 'おはようございます', options: ['おはようございます', 'おやすみなさい', 'さようなら', 'いただきます'], explanation: 'おはようございます là lời chào buổi sáng/đầu ca.' } },
  { id: 'demo-lesson-a1-profile', courseId: 'demo-course-a1', moduleId: 'demo-module-a1-daily', title: 'Simple Self Introduction', description: 'Nói tên, quốc tịch và mục tiêu bằng câu ngắn.', lessonType: 'conversation', durationMinutes: 20, objectives: ['Nói tên', 'Nói quốc tịch'], vocab: [['私', 'tôi', 'watashi', '私はルックです。'], ['ベトナム', 'Việt Nam', 'betonamu', 'ベトナムから来ました。'], ['名前', 'tên', 'namae', '名前は何ですか。']], question: { prompt: 'Hoàn thành: 私は ___ です。', answer: 'ルック', options: ['ルック', 'きゅうけい', 'あぶない', 'みず'], explanation: 'Mẫu 私は ... です dùng để giới thiệu bản thân.' } },
  { id: 'demo-lesson-a1-time', courseId: 'demo-course-a1', moduleId: 'demo-module-a1-shift', title: 'Time and Schedule', description: 'Đọc giờ, ngày và lịch bắt đầu ca.', lessonType: 'vocabulary', durationMinutes: 22, objectives: ['Đọc giờ', 'Xác nhận lịch'], vocab: [['何時', 'mấy giờ', 'nanji', '何時に始まりますか。'], ['午前', 'buổi sáng', 'gozen', '午前九時に出勤します。'], ['午後', 'buổi chiều', 'gogo', '午後に休憩があります。']], question: { prompt: '午前 có nghĩa là gì?', answer: 'buổi sáng', options: ['buổi sáng', 'buổi tối', 'ngày mai', 'giờ nghỉ'], explanation: '午前 là khoảng thời gian trước buổi trưa.' } },
  { id: 'demo-lesson-a1-break', courseId: 'demo-course-a1', moduleId: 'demo-module-a1-shift', title: 'Break and Attendance', description: 'Nói về đi làm, tan ca và giờ nghỉ.', lessonType: 'conversation', durationMinutes: 19, objectives: ['Nói giờ nghỉ', 'Xác nhận tan ca'], vocab: [['出勤', 'đi làm', 'shukkin', '七時に出勤します。'], ['退勤', 'tan ca', 'taikin', '五時に退勤します。'], ['休憩', 'giờ nghỉ', 'kyuukei', '休憩は十五分です。']], question: { prompt: '休憩 nghĩa là gì?', answer: 'giờ nghỉ', options: ['giờ nghỉ', 'đi làm', 'tan ca', 'họp'], explanation: '休憩 là thời gian nghỉ giữa ca.' } },
  { id: 'demo-lesson-work-report', courseId: 'demo-course-workplace', moduleId: 'demo-module-work-report', title: 'Report a Problem', description: 'Báo cáo trễ, sai sót hoặc thiết bị hỏng.', lessonType: 'conversation', durationMinutes: 24, objectives: ['Báo cáo vấn đề', 'Hỏi xác nhận'], vocab: [['報告', 'báo cáo', 'houkoku', '問題があれば報告します。'], ['連絡', 'liên lạc', 'renraku', '店長に連絡します。'], ['相談', 'trao đổi/tư vấn', 'soudan', '先輩に相談します。']], question: { prompt: 'Cụm nào có nghĩa “tôi sẽ báo cáo ngay”?', answer: 'すぐ報告します', options: ['すぐ報告します', 'もう帰ります', '水をください', '大丈夫です'], explanation: 'すぐ報告します dùng khi cam kết báo cáo ngay.' } },
  { id: 'demo-lesson-work-confirm', courseId: 'demo-course-workplace', moduleId: 'demo-module-work-report', title: 'Confirm Instructions', description: 'Xác nhận yêu cầu và xin nhắc lại khi chưa rõ.', lessonType: 'listening', durationMinutes: 21, objectives: ['Xác nhận chỉ dẫn', 'Xin nhắc lại'], vocab: [['わかりました', 'đã hiểu', 'wakarimashita', 'はい、わかりました。'], ['もう一度', 'một lần nữa', 'mou ichido', 'もう一度お願いします。'], ['確認', 'xác nhận/kiểm tra', 'kakunin', '予定を確認します。']], question: { prompt: 'Khi chưa nghe rõ, nên nói gì?', answer: 'もう一度お願いします', options: ['もう一度お願いします', 'おめでとうございます', 'いただきます', 'おやすみなさい'], explanation: 'もう一度お願いします là cách xin nhắc lại lịch sự.' } },
  { id: 'demo-lesson-work-people', courseId: 'demo-course-workplace', moduleId: 'demo-module-work-safety', title: 'People at Work', description: 'Gọi đúng vai trò và giao tiếp với đồng nghiệp.', lessonType: 'vocabulary', durationMinutes: 20, objectives: ['Gọi quản lý', 'Nói về đồng nghiệp'], vocab: [['店長', 'quản lý cửa hàng', 'tenchou', '店長に報告します。'], ['先輩', 'đàn anh/chị', 'senpai', '先輩に聞きます。'], ['同僚', 'đồng nghiệp', 'douryou', '同僚と働きます。']], question: { prompt: '店長 là ai?', answer: 'quản lý cửa hàng', options: ['quản lý cửa hàng', 'khách hàng', 'đồng nghiệp', 'bác sĩ'], explanation: '店長 là người quản lý cửa hàng.' } },
  { id: 'demo-lesson-work-safety', courseId: 'demo-course-workplace', moduleId: 'demo-module-work-safety', title: 'Safety Signs', description: 'Nhận biết nguy hiểm, chú ý và khu vực cấm.', lessonType: 'listening', durationMinutes: 23, objectives: ['Đọc biển báo', 'Phản hồi cảnh báo'], vocab: [['危ない', 'nguy hiểm', 'abunai', '危ないので、入らないでください。'], ['注意', 'chú ý', 'chuui', '足元に注意してください。'], ['禁止', 'cấm', 'kinshi', 'ここは立入禁止です。']], question: { prompt: '危ない nghĩa là gì?', answer: 'nguy hiểm', options: ['nguy hiểm', 'sạch sẽ', 'hoàn thành', 'đói bụng'], explanation: '危ない là nguy hiểm, cần chú ý.' } },
  { id: 'demo-lesson-interview-profile', courseId: 'demo-course-interview', moduleId: 'demo-module-interview-profile', title: 'Profile and Background', description: 'Trình bày quê quán, kinh nghiệm và hoàn cảnh bằng câu ngắn.', lessonType: 'conversation', durationMinutes: 25, objectives: ['Nói xuất thân', 'Nói kinh nghiệm'], vocab: [['出身', 'quê quán', 'shusshin', '出身はベトナムです。'], ['経験', 'kinh nghiệm', 'keiken', '飲食店の経験があります。'], ['家族', 'gia đình', 'kazoku', '家族を大切にしています。']], question: { prompt: '出身 dùng để nói về điều gì?', answer: 'quê quán', options: ['quê quán', 'sở thích', 'lương', 'giờ nghỉ'], explanation: '出身 dùng khi nói mình xuất thân từ đâu.' } },
  { id: 'demo-lesson-interview-goal', courseId: 'demo-course-interview', moduleId: 'demo-module-interview-profile', title: 'Motivation and Goal', description: 'Nói lý do làm việc tại Nhật và mục tiêu ổn định.', lessonType: 'conversation', durationMinutes: 26, objectives: ['Nói mục tiêu', 'Nói lý do'], vocab: [['目標', 'mục tiêu', 'mokuhyou', '日本語の目標があります。'], ['安定', 'ổn định', 'antei', '安定して働きたいです。'], ['勉強', 'học tập', 'benkyou', '毎日日本語を勉強します。']], question: { prompt: 'Câu nào thể hiện mục tiêu tích cực?', answer: '安定して働きたいです', options: ['安定して働きたいです', 'わかりません', 'すぐ帰ります', '休みだけがほしいです'], explanation: 'Câu trả lời ngắn và thể hiện mong muốn làm việc ổn định.' } },
  { id: 'demo-lesson-interview-strength', courseId: 'demo-course-interview', moduleId: 'demo-module-interview-roleplay', title: 'Strengths and Teamwork', description: 'Nói điểm mạnh, tính chăm chỉ và khả năng phối hợp.', lessonType: 'exam-prep', durationMinutes: 25, objectives: ['Nói điểm mạnh', 'Đưa ví dụ'], vocab: [['得意', 'giỏi/sở trường', 'tokui', 'チームで働くことが得意です。'], ['真面目', 'nghiêm túc/chăm chỉ', 'majime', '私は真面目な性格です。'], ['協力', 'hợp tác', 'kyouryoku', 'みんなと協力します。']], question: { prompt: 'Câu nào nói về điểm mạnh?', answer: 'チームで働くことが得意です', options: ['チームで働くことが得意です', '遅刻します', 'わかりません', '帰りたいです'], explanation: '得意 dùng để nói điều mình làm tốt.' } },
  { id: 'demo-lesson-interview-questions', courseId: 'demo-course-interview', moduleId: 'demo-module-interview-roleplay', title: 'Common Questions', description: 'Trả lời câu hỏi về lịch làm, kinh nghiệm và nội quy.', lessonType: 'exam-prep', durationMinutes: 30, objectives: ['Trả lời rõ ý', 'Dùng đuôi lịch sự'], vocab: [['いつから', 'từ khi nào', 'itsu kara', 'いつから働けますか。'], ['どこで', 'ở đâu', 'doko de', 'どこで働きましたか。'], ['なぜ', 'tại sao', 'naze', 'なぜ日本で働きたいですか。']], question: { prompt: 'いつから働けますか nghĩa là gì?', answer: 'Có thể bắt đầu làm từ khi nào?', options: ['Có thể bắt đầu làm từ khi nào?', 'Bạn ở đâu?', 'Bạn bao nhiêu tuổi?', 'Bạn muốn ăn gì?'], explanation: 'いつから hỏi thời điểm bắt đầu.' } },
  { id: 'demo-lesson-kaigo-care', courseId: 'demo-course-kaigo', moduleId: 'demo-module-kaigo-care', title: 'Basic Care Phrases', description: 'Xin phép trước khi hỗ trợ tắm, ăn và di chuyển.', lessonType: 'vocabulary', durationMinutes: 24, objectives: ['Xin phép hỗ trợ', 'Dùng câu nhẹ nhàng'], vocab: [['手伝う', 'giúp đỡ', 'tetsudau', '手伝ってもいいですか。'], ['体調', 'tình trạng sức khỏe', 'taichou', '体調はいかがですか。'], ['食事', 'bữa ăn', 'shokuji', '食事の時間です。']], question: { prompt: 'Câu nào lịch sự khi xin phép giúp?', answer: '手伝ってもいいですか', options: ['手伝ってもいいですか', '早くして', 'だめです', '帰ります'], explanation: 'Mẫu てもいいですか dùng để xin phép.' } },
  { id: 'demo-lesson-kaigo-request', courseId: 'demo-course-kaigo', moduleId: 'demo-module-kaigo-care', title: 'Resident Requests', description: 'Nghe và xác nhận các nhu cầu thường gặp.', lessonType: 'listening', durationMinutes: 22, objectives: ['Hiểu nhu cầu', 'Xác nhận lại'], vocab: [['痛い', 'đau', 'itai', 'どこが痛いですか。'], ['寒い', 'lạnh', 'samui', '寒くないですか。'], ['水', 'nước', 'mizu', '水をお持ちします。']], question: { prompt: '水をお持ちします nghĩa là gì?', answer: 'Tôi sẽ mang nước đến', options: ['Tôi sẽ mang nước đến', 'Tôi sẽ đóng cửa', 'Tôi sẽ đi ngủ', 'Tôi bị đau'], explanation: 'お持ちします là cách nói lịch sự của mang đến.' } },
  { id: 'demo-lesson-kaigo-incident', courseId: 'demo-course-kaigo', moduleId: 'demo-module-kaigo-report', title: 'Incident Report', description: 'Báo cáo ngã, đau hoặc thay đổi sức khỏe.', lessonType: 'conversation', durationMinutes: 28, objectives: ['Báo cáo sự cố', 'Nêu triệu chứng'], vocab: [['転ぶ', 'ngã', 'korobu', '利用者さんが転びました。'], ['熱', 'sốt/nhiệt', 'netsu', '熱があります。'], ['大丈夫', 'ổn/không sao', 'daijoubu', '大丈夫ですか。']], question: { prompt: '利用者さんが転びました nghĩa là gì?', answer: 'Người sử dụng đã bị ngã', options: ['Người sử dụng đã bị ngã', 'Người sử dụng đang ăn', 'Người sử dụng đang ngủ', 'Người sử dụng muốn uống nước'], explanation: '転びました là thể quá khứ lịch sự của ngã.' } },
  { id: 'demo-lesson-kaigo-record', courseId: 'demo-course-kaigo', moduleId: 'demo-module-kaigo-report', title: 'Record and Escalate', description: 'Ghi nhận, truyền đạt và báo ngay thay đổi quan trọng.', lessonType: 'conversation', durationMinutes: 27, objectives: ['Ghi nhận sự việc', 'Báo ngay cho người phụ trách'], vocab: [['記録', 'ghi chép', 'kiroku', '記録を書きます。'], ['伝える', 'truyền đạt', 'tsutaeru', 'すぐに伝えます。'], ['すぐ', 'ngay lập tức', 'sugu', 'すぐ報告します。']], question: { prompt: 'すぐ報告します nghĩa là gì?', answer: 'Tôi sẽ báo cáo ngay', options: ['Tôi sẽ báo cáo ngay', 'Tôi sẽ nghỉ ngày mai', 'Tôi sẽ mua nước', 'Tôi sẽ dọn phòng'], explanation: 'すぐ diễn tả hành động được thực hiện ngay.' } },
];

lessonBlueprints.push(
  { id: 'demo-lesson-a1-numbers', courseId: 'demo-course-a1', moduleId: 'demo-module-a1-daily', title: 'Numbers and Quantities', description: 'Đọc số lượng, giá và số người trong tình huống thực tế.', lessonType: 'vocabulary', durationMinutes: 20, objectives: ['Đọc số lượng', 'Hỏi giá'], vocab: [['一つ', 'một cái', 'hitotsu', 'りんごを一つください。'], ['いくら', 'bao nhiêu tiền', 'ikura', 'これはいくらですか。'], ['全部', 'tất cả', 'zenbu', '全部で五百円です。']], question: { prompt: 'いくら dùng để hỏi điều gì?', answer: 'giá bao nhiêu', options: ['giá bao nhiêu', 'ở đâu', 'mấy giờ', 'ai'], explanation: 'いくら dùng để hỏi giá hoặc số tiền.' } },
  { id: 'demo-lesson-a1-polite-request', courseId: 'demo-course-a1', moduleId: 'demo-module-a1-daily', title: 'Polite Requests', description: 'Nhờ giúp đỡ và xin phép bằng mẫu câu lịch sự.', lessonType: 'conversation', durationMinutes: 22, objectives: ['Nhờ giúp đỡ', 'Xin phép lịch sự'], vocab: [['お願いします', 'xin nhờ', 'onegaishimasu', 'これをお願いします。'], ['ください', 'xin hãy cho', 'kudasai', '水をください。'], ['いいですか', 'được không', 'ii desu ka', 'ここに置いてもいいですか。']], question: { prompt: 'Mẫu nào dùng để xin phép?', answer: 'いいですか', options: ['いいですか', 'おめでとう', 'さようなら', 'いただきます'], explanation: 'いいですか đặt ở cuối câu để hỏi “có được không?”.' } },
  { id: 'demo-lesson-a1-clock', courseId: 'demo-course-a1', moduleId: 'demo-module-a1-shift', title: 'Clock-in and Clock-out', description: 'Nói giờ vào ca, ra ca và thay đổi lịch.', lessonType: 'listening', durationMinutes: 21, objectives: ['Nói giờ vào ca', 'Xác nhận giờ ra ca'], vocab: [['始まる', 'bắt đầu', 'hajimaru', '仕事は九時に始まります。'], ['終わる', 'kết thúc', 'owaru', '仕事は五時に終わります。'], ['時間', 'thời gian', 'jikan', '時間を確認します。']], question: { prompt: '終わる nghĩa là gì?', answer: 'kết thúc', options: ['kết thúc', 'bắt đầu', 'đợi', 'đi lại'], explanation: '終わる diễn tả một việc kết thúc.' } },
  { id: 'demo-lesson-a1-checkin', courseId: 'demo-course-a1', moduleId: 'demo-module-a1-shift', title: 'Daily Check-in', description: 'Báo tình trạng hôm nay và trả lời câu hỏi đầu ca.', lessonType: 'conversation', durationMinutes: 19, objectives: ['Báo tình trạng', 'Trả lời đầu ca'], vocab: [['元気', 'khỏe', 'genki', '今日は元気です。'], ['忙しい', 'bận', 'isogashii', '今日は少し忙しいです。'], ['大丈夫', 'ổn', 'daijoubu', 'はい、大丈夫です。']], question: { prompt: '今日は元気です nghĩa là gì?', answer: 'Hôm nay tôi khỏe', options: ['Hôm nay tôi khỏe', 'Hôm nay tôi nghỉ', 'Tôi bị đau', 'Tôi đến muộn'], explanation: '元気 diễn tả trạng thái khỏe và có năng lượng.' } },
  { id: 'demo-lesson-work-delay', courseId: 'demo-course-workplace', moduleId: 'demo-module-work-report', title: 'Report a Delay', description: 'Báo đến muộn và nêu lý do ngắn gọn.', lessonType: 'conversation', durationMinutes: 23, objectives: ['Báo đến muộn', 'Nêu lý do'], vocab: [['遅れる', 'đến muộn', 'okureru', '電車が遅れています。'], ['電車', 'tàu điện', 'densha', '電車で来ました。'], ['理由', 'lý do', 'riyuu', '理由を説明します。']], question: { prompt: '電車が遅れています nghĩa là gì?', answer: 'Tàu điện đang bị trễ', options: ['Tàu điện đang bị trễ', 'Tàu điện đã đến', 'Tôi đi bộ', 'Tôi đang nghỉ'], explanation: '遅れる là bị trễ hoặc đến muộn.' } },
  { id: 'demo-lesson-work-handover', courseId: 'demo-course-workplace', moduleId: 'demo-module-work-report', title: 'Handover Notes', description: 'Bàn giao việc đã làm và việc còn lại cho ca sau.', lessonType: 'conversation', durationMinutes: 25, objectives: ['Bàn giao việc', 'Nêu việc còn lại'], vocab: [['引き継ぎ', 'bàn giao', 'hikitsugi', '引き継ぎをします。'], ['終わり', 'kết thúc', 'owari', '仕事は終わりです。'], ['残る', 'còn lại', 'nokoru', '仕事が少し残っています。']], question: { prompt: '引き継ぎ nghĩa là gì?', answer: 'bàn giao', options: ['bàn giao', 'đi mua hàng', 'nghỉ giải lao', 'đặt lịch'], explanation: '引き継ぎ là việc bàn giao thông tin/công việc.' } },
  { id: 'demo-lesson-work-cleaning', courseId: 'demo-course-workplace', moduleId: 'demo-module-work-safety', title: 'Cleaning Routine', description: 'Nói về vệ sinh khu vực làm việc và kiểm tra dụng cụ.', lessonType: 'vocabulary', durationMinutes: 20, objectives: ['Mô tả vệ sinh', 'Kiểm tra dụng cụ'], vocab: [['掃除', 'dọn dẹp', 'souji', '毎朝、掃除をします。'], ['清潔', 'sạch sẽ', 'seiketsu', '清潔にしてください。'], ['道具', 'dụng cụ', 'dougu', '道具を片付けます。']], question: { prompt: '掃除 nghĩa là gì?', answer: 'dọn dẹp', options: ['dọn dẹp', 'báo cáo', 'đi làm', 'đặt món'], explanation: '掃除 là hành động dọn dẹp/vệ sinh.' } },
  { id: 'demo-lesson-work-emergency', courseId: 'demo-course-workplace', moduleId: 'demo-module-work-safety', title: 'Emergency Response', description: 'Phản hồi khi có nguy hiểm và gọi người phụ trách.', lessonType: 'listening', durationMinutes: 26, objectives: ['Nhận biết khẩn cấp', 'Gọi hỗ trợ'], vocab: [['危険', 'nguy hiểm', 'kiken', '危険ですから、近づかないでください。'], ['助ける', 'giúp đỡ', 'tasukeru', '助けを呼びます。'], ['連絡先', 'nơi liên lạc', 'renrakusaki', '連絡先を確認します。']], question: { prompt: '危険 nghĩa là gì?', answer: 'nguy hiểm', options: ['nguy hiểm', 'bình thường', 'rẻ', 'đủ'], explanation: '危険 dùng trong cảnh báo nguy hiểm.' } },
  { id: 'demo-lesson-interview-hometown', courseId: 'demo-course-interview', moduleId: 'demo-module-interview-profile', title: 'Hometown and Family', description: 'Nói về quê nhà và gia đình trong phần phỏng vấn.', lessonType: 'conversation', durationMinutes: 24, objectives: ['Giới thiệu quê nhà', 'Nói về gia đình'], vocab: [['故郷', 'quê hương', 'furusato', '故郷はハノイです。'], ['住む', 'sống', 'sumu', '家族はベトナムに住んでいます。'], ['大切', 'quan trọng', 'taisetsu', '家族を大切にします。']], question: { prompt: '大切 nghĩa là gì?', answer: 'quan trọng', options: ['quan trọng', 'nhanh', 'thấp', 'đắt'], explanation: '大切 diễn tả điều quý giá hoặc quan trọng.' } },
  { id: 'demo-lesson-interview-study', courseId: 'demo-course-interview', moduleId: 'demo-module-interview-profile', title: 'Study Plan', description: 'Trình bày cách học tiếng Nhật và kế hoạch cải thiện.', lessonType: 'conversation', durationMinutes: 27, objectives: ['Nói kế hoạch học', 'Nêu thói quen'], vocab: [['毎日', 'mỗi ngày', 'mainichi', '毎日、日本語を練習します。'], ['練習', 'luyện tập', 'renshuu', '会話を練習します。'], ['上達', 'tiến bộ', 'joutatsu', 'もっと上達したいです。']], question: { prompt: '上達したいです nghĩa là gì?', answer: 'muốn tiến bộ', options: ['muốn tiến bộ', 'muốn nghỉ', 'đã quên', 'đang đói'], explanation: '上達 diễn tả sự tiến bộ trong kỹ năng.' } },
  { id: 'demo-lesson-interview-schedule', courseId: 'demo-course-interview', moduleId: 'demo-module-interview-roleplay', title: 'Work Schedule', description: 'Trả lời về ca làm, ngày nghỉ và khả năng linh hoạt.', lessonType: 'exam-prep', durationMinutes: 24, objectives: ['Nói lịch làm', 'Trả lời linh hoạt'], vocab: [['平日', 'ngày trong tuần', 'heijitsu', '平日は働けます。'], ['休日', 'ngày nghỉ', 'kyuujitsu', '休日は勉強します。'], ['都合', 'sự thuận tiện', 'tsugou', '都合を教えてください。']], question: { prompt: '平日 nghĩa là gì?', answer: 'ngày trong tuần', options: ['ngày trong tuần', 'ngày lễ', 'buổi tối', 'tháng sau'], explanation: '平日 là các ngày làm việc trong tuần.' } },
  { id: 'demo-lesson-interview-closing', courseId: 'demo-course-interview', moduleId: 'demo-module-interview-roleplay', title: 'Close the Interview', description: 'Kết thúc phỏng vấn và thể hiện thái độ chuyên nghiệp.', lessonType: 'exam-prep', durationMinutes: 21, objectives: ['Cảm ơn', 'Kết thúc lịch sự'], vocab: [['本日は', 'hôm nay', 'honjitsu wa', '本日はありがとうございました。'], ['機会', 'cơ hội', 'kikai', '機会をいただき、ありがとうございます。'], ['よろしく', 'mong được giúp đỡ', 'yoroshiku', 'よろしくお願いいたします。']], question: { prompt: 'Câu nào phù hợp để cảm ơn cuối phỏng vấn?', answer: '本日はありがとうございました', options: ['本日はありがとうございました', '早くしてください', 'もう寝ます', 'わかりません'], explanation: 'Câu cảm ơn cuối buổi thể hiện thái độ chuyên nghiệp.' } },
  { id: 'demo-lesson-kaigo-mobility', courseId: 'demo-course-kaigo', moduleId: 'demo-module-kaigo-care', title: 'Mobility Support', description: 'Hỗ trợ đứng dậy, đi lại và di chuyển an toàn.', lessonType: 'conversation', durationMinutes: 26, objectives: ['Xin phép hỗ trợ', 'Cảnh báo an toàn'], vocab: [['立つ', 'đứng', 'tatsu', 'ゆっくり立ちましょう。'], ['歩く', 'đi bộ', 'aruku', '一緒に歩きましょう。'], ['ゆっくり', 'từ từ', 'yukkuri', 'ゆっくりで大丈夫です。']], question: { prompt: 'ゆっくり nghĩa là gì?', answer: 'từ từ', options: ['từ từ', 'ngay lập tức', 'rất cao', 'bên phải'], explanation: 'ゆっくり dùng để nhắc làm chậm và cẩn thận.' } },
  { id: 'demo-lesson-kaigo-meal', courseId: 'demo-course-kaigo', moduleId: 'demo-module-kaigo-care', title: 'Meal Assistance', description: 'Xác nhận món ăn, tốc độ và nhu cầu uống nước.', lessonType: 'vocabulary', durationMinutes: 25, objectives: ['Xác nhận bữa ăn', 'Hỗ trợ uống nước'], vocab: [['食べる', 'ăn', 'taberu', 'ゆっくり食べてください。'], ['飲む', 'uống', 'nomu', 'お茶を飲みますか。'], ['熱い', 'nóng', 'atsui', '熱いので気をつけてください。']], question: { prompt: '熱いので気をつけてください nghĩa là gì?', answer: 'Vì nóng nên hãy cẩn thận', options: ['Vì nóng nên hãy cẩn thận', 'Hãy đi ngủ', 'Tôi sẽ gọi bác sĩ', 'Tôi đã ăn xong'], explanation: '熱い là nóng và 気をつけてください là hãy cẩn thận.' } },
  { id: 'demo-lesson-kaigo-condition', courseId: 'demo-course-kaigo', moduleId: 'demo-module-kaigo-report', title: 'Health Condition', description: 'Hỏi triệu chứng và ghi nhận thay đổi sức khỏe.', lessonType: 'listening', durationMinutes: 28, objectives: ['Hỏi triệu chứng', 'Ghi nhận thay đổi'], vocab: [['気分', 'cảm giác/tâm trạng', 'kibun', '気分はいかがですか。'], ['苦しい', 'khó chịu/khó thở', 'kurushii', '苦しくないですか。'], ['顔色', 'sắc mặt', 'kaoiro', '顔色を確認します。']], question: { prompt: '気分はいかがですか nghĩa là gì?', answer: 'Cảm thấy trong người thế nào?', options: ['Cảm thấy trong người thế nào?', 'Ăn món gì?', 'Đi đâu?', 'Mấy giờ tan ca?'], explanation: '気分 hỏi cảm giác hoặc tình trạng trong người.' } },
  { id: 'demo-lesson-kaigo-handover', courseId: 'demo-course-kaigo', moduleId: 'demo-module-kaigo-report', title: 'Care Handover', description: 'Bàn giao tình trạng và việc cần theo dõi cho ca sau.', lessonType: 'conversation', durationMinutes: 29, objectives: ['Bàn giao chăm sóc', 'Nêu việc cần theo dõi'], vocab: [['様子', 'tình trạng/biểu hiện', 'yousu', '様子を見てください。'], ['変化', 'thay đổi', 'henka', '変化がありました。'], ['担当', 'người phụ trách', 'tantou', '担当者に伝えます。']], question: { prompt: '変化がありました nghĩa là gì?', answer: 'Đã có thay đổi', options: ['Đã có thay đổi', 'Đã ăn xong', 'Không có ai', 'Tôi sẽ về nhà'], explanation: '変化 là sự thay đổi trong tình trạng hoặc sự việc.' } },
);

const lessonOrder = new Map<string, number>();
const lessons = lessonBlueprints.map((lesson) => {
  const orderIndex = (lessonOrder.get(lesson.moduleId) ?? 0) + 1;
  lessonOrder.set(lesson.moduleId, orderIndex);
  return {
    id: lesson.id,
    course_id: lesson.courseId,
    module_id: lesson.moduleId,
    title: lesson.title,
    description: lesson.description,
    lesson_type: lesson.lessonType,
    status: 'published',
    duration_minutes: lesson.durationMinutes,
    objectives: lesson.objectives,
    content_markdown: `## ${lesson.title}\n\n${lesson.description}\n\n### Mục tiêu\n${lesson.objectives.map((objective) => `- ${objective}`).join('\n')}\n\n### Câu mẫu\n${lesson.vocab.map(([, , , example]) => `- ${example}`).join('\n')}`,
    order_index: orderIndex,
  };
});

const vocabulary = lessonBlueprints.flatMap((lesson) => lesson.vocab.map(([term, translation, pronunciation, example], index) => ({
  id: `demo-vocab-${lesson.id.replace('demo-lesson-', '')}-${index + 1}`,
  term,
  translation,
  example_sentence: example,
  pronunciation,
  reading: pronunciation,
  level: courses.find((course) => course.id === lesson.courseId)?.level ?? 'A1',
  metadata: { demo: true, sourceLessonId: lesson.id },
  audio_url: null,
  tags: ['demo', lesson.courseId.replace('demo-course-', '')],
})));

const lessonVocabulary = lessonBlueprints.flatMap((lesson) => lesson.vocab.map((_, index) => ({
  lesson_id: lesson.id,
  vocabulary_item_id: `demo-vocab-${lesson.id.replace('demo-lesson-', '')}-${index + 1}`,
  position: index + 1,
})));

const reviewQuestions = lessonBlueprints.map((lesson, index) => ({
  id: `demo-review-${lesson.id.replace('demo-lesson-', '')}`,
  lesson_id: lesson.id,
  prompt: lesson.question.prompt,
  explanation: lesson.question.explanation,
  order_index: index + 1,
}));

const reviewOptions = lessonBlueprints.flatMap((lesson) => lesson.question.options.map((label, index) => ({
  id: `demo-review-option-${lesson.id.replace('demo-lesson-', '')}-${index + 1}`,
  question_id: `demo-review-${lesson.id.replace('demo-lesson-', '')}`,
  label,
  is_correct: label === lesson.question.answer,
  order_index: index + 1,
})));

const lessonExercises = lessonBlueprints.flatMap((lesson) => [
  {
    id: `demo-exercise-${lesson.id}-choice`,
    lesson_id: lesson.id,
    exercise_type: 'multiple-choice',
    prompt: lesson.question.prompt,
    answer: lesson.question.answer,
    choices: lesson.question.options,
    order_index: 1,
  },
  {
    id: `demo-exercise-${lesson.id}-shadowing`,
    lesson_id: lesson.id,
    exercise_type: 'shadowing',
    prompt: `Đọc to câu mẫu của bài ${lesson.title}.`,
    answer: lesson.vocab[0][3],
    choices: [],
    order_index: 2,
  },
]);

const assessments = courses.map((course, index) => ({
  id: `demo-assessment-${course.id.replace('demo-course-', '')}`,
  course_id: course.id,
  title: `${course.title} · Checkpoint`,
  assessment_type: index % 2 === 0 ? 'vocabulary' : 'workplace',
  passing_score: 70,
  status: 'published',
  order_index: 1,
}));

const assessmentQuestions = courses.flatMap((course) => {
  const courseLessons = lessonBlueprints.filter((lesson) => lesson.courseId === course.id);
  return Array.from({ length: 8 }, (_, index) => {
    const lesson = courseLessons[index % courseLessons.length];
    return {
      id: `demo-assessment-question-${course.id.replace('demo-course-', '')}-${index + 1}`,
      assessment_id: `demo-assessment-${course.id.replace('demo-course-', '')}`,
      prompt: `${index + 1}. ${lesson.question.prompt}`,
      correct_answer: lesson.question.answer,
      options: lesson.question.options,
      order_index: index + 1,
    };
  });
});

const documents = lessonBlueprints.map((lesson, index) => ({
  id: `demo-document-${lesson.id.replace('demo-lesson-', '')}`,
  course_id: lesson.courseId,
  title: `${lesson.title} · Quick sheet`,
  document_type: index % 2 === 0 ? 'pdf' : 'post',
  status: 'published',
  external_url: null,
  storage_path: `demo/${lesson.courseId}/${lesson.id}.md`,
  summary: `Tờ nhắc nhanh cho bài ${lesson.title}: ${lesson.objectives.join(', ')}.`,
  content_markdown: `# ${lesson.title}\n\n${lesson.description}\n\n## Từ khóa\n${lesson.vocab.map(([term, translation]) => `- **${term}** — ${translation}`).join('\n')}\n\n## Gợi ý luyện tập\nĐọc từng câu mẫu hai lần, sau đó tự nói lại không nhìn tài liệu.`,
  read_time_minutes: 5 + (index % 4),
  metadata: { demo: true, pages: index % 2 === 0 ? 2 : 1, readTimeMinutes: 5 + (index % 4) },
}));

const podcastEpisodes = modules.map((module, index) => ({
  id: `demo-podcast-${module.id.replace('demo-module-', '')}`,
  course_id: module.course_id,
  lesson_id: lessons.find((lesson) => lesson.module_id === module.id)?.id ?? null,
  title: `${module.title} · Listening drill`,
  summary: `Bài nghe demo cho ${module.title}, tập trung vào câu ngắn và nhịp nói rõ.`,
  external_url: null,
  storage_path: `demo/${module.course_id}/${module.id}.txt`,
  duration_minutes: 5 + (index % 4),
  status: 'published',
}));

const packages = [
  { id: 'demo-package-free', name: 'Demo Free Starter', description: 'Gói miễn phí để kiểm tra enrollment và course workspace.', price_cents: 0, currency: 'VND', status: 'active', ai_monthly_quota: 5 },
  { id: 'demo-package-tokutei', name: 'Demo Tokutei Bundle', description: 'Workplace, interview và kaigo demo content.', price_cents: 990000, currency: 'VND', status: 'active', ai_monthly_quota: 20 },
  { id: 'demo-package-interview', name: 'Demo Interview Bundle', description: 'Tập trung tự giới thiệu và role-play phỏng vấn.', price_cents: 1290000, currency: 'VND', status: 'active', ai_monthly_quota: 30 },
];

const packageCourses = [
  { package_id: 'demo-package-free', course_id: 'demo-course-a1' },
  { package_id: 'demo-package-tokutei', course_id: 'demo-course-workplace' },
  { package_id: 'demo-package-tokutei', course_id: 'demo-course-interview' },
  { package_id: 'demo-package-tokutei', course_id: 'demo-course-kaigo' },
  { package_id: 'demo-package-interview', course_id: 'demo-course-interview' },
];

const grammarBlueprints = [
  ['demo-grammar-polite', 'polite-requests', 'Câu nhờ vả lịch sự', 'Mẫu câu dùng khi xin phép, nhờ giúp đỡ và xác nhận trong môi trường làm việc.', 'demo-course-a1'],
  ['demo-grammar-time', 'time-and-schedule', 'Nói giờ và lịch làm', 'Cách nói thời gian, lịch bắt đầu và kết thúc ca.', 'demo-course-a1'],
  ['demo-grammar-report', 'reporting-with-masu', 'Báo cáo bằng ます', 'Mẫu câu ngắn để báo cáo việc đã làm và việc sẽ làm.', 'demo-course-workplace'],
  ['demo-grammar-prohibition', 'prohibition-and-warning', 'Cấm và cảnh báo', 'Phân biệt ないでください, 禁止 và các câu cảnh báo an toàn.', 'demo-course-workplace'],
  ['demo-grammar-reason', 'reason-with-kara', 'Lý do với から', 'Nêu lý do rõ ràng khi trả lời quản lý hoặc phỏng vấn.', 'demo-course-interview'],
  ['demo-grammar-desire', 'desire-with-tai', 'Mong muốn với たい', 'Diễn đạt mục tiêu học và mong muốn làm việc.', 'demo-course-interview'],
  ['demo-grammar-permission', 'permission-with-temoii', 'Xin phép với てもいい', 'Xin phép trước khi hỗ trợ và di chuyển người sử dụng.', 'demo-course-kaigo'],
  ['demo-grammar-obligation', 'obligation-with-nakereba', 'Việc cần làm', 'Nói về quy định, ghi chép và việc phải báo ngay.', 'demo-course-kaigo'],
] as const;

const grammarTopics = grammarBlueprints.map(([id, slug, title, summary, courseId], index) => ({
  id,
  slug,
  title,
  level: courses.find((course) => course.id === courseId)?.level ?? 'A1',
  category: 'Tokutei Gino',
  summary,
  status: 'published',
  order_index: index + 1,
}));

const grammarRules = grammarBlueprints.flatMap(([id, , title], index) => [
  { id: `demo-rule-${id}-form`, topic_id: id, title: `${title} · Cấu trúc`, body_markdown: `## Cấu trúc\n\nDùng mẫu câu ngắn, đuôi lịch sự và nêu rõ chủ thể khi giao tiếp tại nơi làm việc.\n\n> Ví dụ: câu ngắn, ý rõ, kết thúc bằng です hoặc ます.`, order_index: 1 },
  { id: `demo-rule-${id}-tip`, topic_id: id, title: `${title} · Lưu ý`, body_markdown: `## Lưu ý\n\nNghe hết câu trước khi trả lời; nếu chưa rõ, hãy dùng もう一度お願いします。`, order_index: 2 },
]);

const grammarExamples = grammarBlueprints.flatMap(([id], index) => [
  { id: `demo-example-${id}-one`, topic_id: id, japanese_text: index % 2 === 0 ? 'もう一度お願いします。' : '予定を確認します。', vietnamese_text: index % 2 === 0 ? 'Xin hãy nhắc lại một lần nữa.' : 'Tôi sẽ xác nhận lịch.', explanation: 'Mẫu câu lịch sự dùng trong giao tiếp thực tế.', order_index: 1 },
  { id: `demo-example-${id}-two`, topic_id: id, japanese_text: index % 2 === 0 ? '今日もよろしくお願いします。' : 'すぐ報告します。', vietnamese_text: index % 2 === 0 ? 'Hôm nay cũng mong được giúp đỡ.' : 'Tôi sẽ báo cáo ngay.', explanation: 'Câu ngắn, dễ áp dụng trong ca làm.', order_index: 2 },
]);

const grammarTopicCourses = grammarBlueprints.map(([topicId, , , , courseId]) => ({ topic_id: topicId, course_id: courseId }));
const grammarTopicVocabulary = grammarBlueprints.flatMap(([topicId, , , , courseId]) => vocabulary.filter((item) => item.tags.includes(courseId.replace('demo-course-', ''))).slice(0, 2).map((item) => ({ topic_id: topicId, vocabulary_item_id: item.id })));

const speakingPrompts = courses.flatMap((course, index) => [
  { id: `demo-speaking-${course.id.replace('demo-course-', '')}-intro`, course_id: course.id, title: `${course.title} · Short response`, instructions: 'Nói trong 30–60 giây. Mở đầu rõ ràng, dùng đuôi lịch sự và kết thúc bằng một câu hoàn chỉnh.', rubric: { demo: true, pronunciation: 40, fluency: 30, grammar: 30 }, status: 'published', order_index: index * 2 + 1 },
  { id: `demo-speaking-${course.id.replace('demo-course-', '')}-roleplay`, course_id: course.id, title: `${course.title} · Role-play`, instructions: 'Đóng vai một tình huống tại nơi làm việc và phản hồi bằng tiếng Nhật đơn giản.', rubric: { demo: true, pronunciation: 35, fluency: 35, grammar: 30 }, status: 'published', order_index: index * 2 + 2 },
]);

const mediaPaths = [...documents.map((document) => document.storage_path), ...podcastEpisodes.map((episode) => episode.storage_path)];

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim() ?? (name === 'SUPABASE_URL' ? process.env.VITE_SUPABASE_URL?.trim() : undefined);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function randomPassword(): string {
  return `Gino2-${randomBytes(18).toString('base64url')}-aA1!`;
}

function demoUuid(index: number): string {
  return `10000000-0000-4000-8000-${index.toString().padStart(12, '0')}`;
}

function dateAt(daysAgo: number, hour = 9): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

const client = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsert(table: string, rows: Record<string, unknown>[], onConflict = 'id'): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await client.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function deleteWhere(table: string, column: string, values: string[]): Promise<void> {
  if (values.length === 0) return;
  const { error } = await client.from(table).delete().in(column, values);
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function ensureUser(email: string, displayName: string, passwordEnvName?: string): Promise<{ id: string; password: string | null }> {
  const resetPassword = process.env.RESET_DEMO_PASSWORD === 'true';
  const generatedPassword = process.env[passwordEnvName ?? (email === DEMO_ADMIN_EMAIL ? 'DEMO_ADMIN_PASSWORD' : 'DEMO_LEARNER_PASSWORD')] ?? randomPassword();
  const { data: users, error: listError } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw new Error(`auth.listUsers: ${listError.message}`);
  const existing = users.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    if (resetPassword) {
      const { error } = await client.auth.admin.updateUserById(existing.id, { password: generatedPassword, email_confirm: true, user_metadata: { display_name: displayName } });
      if (error) throw new Error(`auth.updateUserById: ${error.message}`);
      return { id: existing.id, password: generatedPassword };
    }
    return { id: existing.id, password: null };
  }

  const { data, error } = await client.auth.admin.createUser({ email, password: generatedPassword, email_confirm: true, user_metadata: { display_name: displayName } });
  if (error || !data.user) throw new Error(`auth.createUser: ${error?.message ?? 'user was not created'}`);
  return { id: data.user.id, password: generatedPassword };
}

async function uploadDemoMedia(): Promise<void> {
  for (const path of mediaPaths) {
    const isPodcast = path.endsWith('.txt');
    const body = isPodcast
      ? `Tokutei Gino demo listening transcript\n\n${path}\n\nRepeat the sentence slowly, then shadow it once.`
      : `# Tokutei Gino demo sheet\n\nThis private fixture belongs to ${path}.\n\nUse it to verify signed URLs and annotation isolation.`;
    const { error } = await client.storage.from('course-assets').upload(path, Buffer.from(body), {
      upsert: true,
      contentType: isPodcast ? 'text/plain' : 'text/markdown',
    });
    if (error) throw new Error(`storage ${path}: ${error.message}`);
  }
}

async function uploadDemoSpeakingMedia(learnerId: string): Promise<string[]> {
  const paths = [
    `${learnerId}/speaking/${DEMO_UUIDS.speakingOne}/recording`,
    `${learnerId}/speaking/${DEMO_UUIDS.speakingTwo}/recording`,
  ];
  for (const path of paths) {
    const { error } = await client.storage.from('learner-submissions').upload(path, Buffer.from('demo speaking fixture'), {
      upsert: true,
      contentType: 'audio/webm',
    });
    if (error) throw new Error(`speaking storage ${path}: ${error.message}`);
  }
  return paths;
}

async function verifySignedUrl(bucket: string, path: string): Promise<void> {
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, 60);
  if (error || !data?.signedUrl) throw new Error(`signed URL ${bucket}/${path}: ${error?.message ?? 'missing URL'}`);
}

async function ensureDemoSitePage(slug: string, title: string, body: string, adminId: string): Promise<void> {
  const { data, error } = await client.from('site_pages').select('slug').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`site_pages lookup: ${error.message}`);
  if (data) return;
  await upsert('site_pages', [{ slug, title, body_markdown: `<!-- demo-${slug} -->\n${body}`, status: 'published', updated_by: adminId }], 'slug');
}

function monthStart(): string {
  const date = new Date();
  date.setUTCDate(1);
  return date.toISOString().slice(0, 10);
}

async function seed(): Promise<void> {
  const admin = await ensureUser(DEMO_ADMIN_EMAIL, 'Demo Admin');
  const learner = await ensureUser(DEMO_LEARNER_EMAIL, 'Demo Learner');
  const staffPasswordEnvNames = ['DEMO_EDITOR_PASSWORD', 'DEMO_SUPPORT_PASSWORD', 'DEMO_ANALYST_PASSWORD'];
  const staffAccounts = await Promise.all(DEMO_STAFF_USERS.map((spec, index) => ensureUser(spec.email, spec.displayName, staffPasswordEnvNames[index])));
  const now = new Date().toISOString();

  await upsert('profiles', [
    { user_id: admin.id, email: DEMO_ADMIN_EMAIL, display_name: 'Demo Admin', profile_role: 'admin' },
    { user_id: learner.id, email: DEMO_LEARNER_EMAIL, display_name: 'Demo Learner', profile_role: 'learner' },
    ...DEMO_STAFF_USERS.map((spec, index) => ({ user_id: staffAccounts[index].id, email: spec.email, display_name: spec.displayName, profile_role: 'admin' })),
  ], 'user_id');
  await upsert('admin_roles', [
    { user_id: admin.id, role: 'owner', granted_by: admin.id },
    ...DEMO_STAFF_USERS.map((spec, index) => ({ user_id: staffAccounts[index].id, role: spec.role, granted_by: admin.id })),
  ], 'user_id');
  await upsert('learner_profiles', [{ id: 'demo-learner-profile', user_id: learner.id, display_name: 'Demo Learner', target_level: 'Tokutei / N4' }]);
  await upsert('learner_settings', [{ user_id: learner.id, timezone: 'Asia/Tokyo', daily_goal_minutes: 30, new_cards_per_day: 12, reminder_time: '19:30:00', ai_concise: true, tts_enabled: true, email_notifications: true, in_app_notifications: true, onboarding_completed_at: dateAt(20) }], 'user_id');

  await upsert('courses', courses);
  await upsert('course_modules', modules);
  await upsert('lessons', lessons);
  await upsert('vocabulary_items', vocabulary);
  await upsert('lesson_vocabulary', lessonVocabulary, 'lesson_id,vocabulary_item_id');
  await upsert('lesson_assets', lessonBlueprints.flatMap((lesson) => [
    { id: `demo-asset-audio-${lesson.id}`, lesson_id: lesson.id, asset_type: 'audio', title: `${lesson.title} pronunciation`, description: 'Demo audio metadata; playback uses the private course asset path.', external_url: null, storage_path: `demo/${lesson.courseId}/${lesson.moduleId}.txt`, metadata: { demo: true, durationSeconds: 90 } },
    { id: `demo-asset-sheet-${lesson.id}`, lesson_id: lesson.id, asset_type: 'document', title: `${lesson.title} worksheet`, description: 'Private demo worksheet fixture.', external_url: null, storage_path: `demo/${lesson.courseId}/${lesson.id}.md`, metadata: { demo: true, pages: 2 } },
  ]));
  await upsert('lesson_exercises', lessonExercises);
  await upsert('review_questions', reviewQuestions);
  await upsert('review_options', reviewOptions);
  await upsert('assessments', assessments);
  await upsert('assessment_questions', assessmentQuestions);
  await upsert('documents', documents);
  await upsert('podcast_episodes', podcastEpisodes);
  await upsert('packages', packages);
  await upsert('package_courses', packageCourses, 'package_id,course_id');
  await uploadDemoMedia();

  await upsert('grammar_topics', grammarTopics);
  await upsert('grammar_rules', grammarRules);
  await upsert('grammar_examples', grammarExamples);
  await upsert('grammar_topic_courses', grammarTopicCourses, 'topic_id,course_id');
  await upsert('grammar_topic_vocabulary', grammarTopicVocabulary, 'topic_id,vocabulary_item_id');
  await upsert('speaking_prompts', speakingPrompts);
  await upsert('ai_prompts', [
    { id: 'demo-prompt-interview', name: 'Demo interview coach', provider: 'gemini', purpose: 'interview-writing', status: 'active', prompt_body: 'Give concise Tokutei interview feedback in Vietnamese and Japanese.' },
    { id: 'demo-prompt-chat', name: 'Demo course tutor', provider: 'gemini', purpose: 'course-chat', status: 'active', prompt_body: 'Explain the course context in simple Vietnamese and Japanese.' },
    { id: 'demo-prompt-speaking', name: 'Demo speaking rubric', provider: 'gemini', purpose: 'speaking-feedback', status: 'active', prompt_body: 'Score pronunciation, fluency and grammar with actionable feedback.' },
  ]);

  const enrollmentSpecs = [
    { courseId: 'demo-course-a1', packageId: 'demo-package-free', status: 'active', progress: 50 },
    { courseId: 'demo-course-workplace', packageId: 'demo-package-tokutei', status: 'active', progress: 35 },
    { courseId: 'demo-course-interview', packageId: 'demo-package-tokutei', status: 'active', progress: 70 },
    { courseId: 'demo-course-kaigo', packageId: 'demo-package-tokutei', status: 'completed', progress: 100 },
  ] as const;
  await upsert('enrollments', enrollmentSpecs.map((entry) => ({ id: `demo-enrollment-learner-${entry.courseId.replace('demo-course-', '')}`, user_id: learner.id, package_id: entry.packageId, course_id: entry.courseId, status: entry.status, progress_percent: entry.progress, enrolled_at: dateAt(18), completed_at: entry.status === 'completed' ? dateAt(3) : null })));

  const lessonPositions = new Map<string, number>();
  const lessonProgress = lessons.map((lesson) => {
    const position = lessonPositions.get(lesson.course_id) ?? 0;
    lessonPositions.set(lesson.course_id, position + 1);
    const completed = lesson.course_id === 'demo-course-kaigo' || position < (lesson.course_id === 'demo-course-interview' ? 3 : 2);
    return { user_id: learner.id, lesson_id: lesson.id, status: completed ? 'completed' : position === 2 ? 'in-progress' : 'not-started', score: completed ? 78 + (position % 5) * 4 : null };
  });
  await upsert('lesson_progress', lessonProgress, 'user_id,lesson_id');
  await upsert('vocabulary_progress', vocabulary.map((item, index) => {
    const status = index % 7 < 3 ? 'mastered' : index % 7 < 5 ? 'learning' : 'new';
    return { user_id: learner.id, vocabulary_item_id: item.id, status, last_reviewed_at: status === 'new' ? null : dateAt(index % 10), due_at: status === 'new' ? null : index % 4 === 0 ? dateAt(-2) : dateAt((index % 3) + 1), interval_days: status === 'mastered' ? 14 : status === 'learning' ? 2 : 0, repetitions: status === 'mastered' ? 5 : status === 'learning' ? 2 : 0, lapses: index % 11 === 0 ? 1 : 0 };
  }), 'user_id,vocabulary_item_id');
  await upsert('review_attempts', reviewQuestions.map((question, index) => ({ id: `demo-review-attempt-${String(index + 1).padStart(3, '0')}`, user_id: learner.id, question_id: question.id, is_correct: index % 5 !== 2, answered_at: dateAt(index % 12, 10 + (index % 8)) })));
  await upsert('assessment_attempts', assessments.flatMap((assessment, assessmentIndex) => {
    const questions = assessmentQuestions.filter((question) => question.assessment_id === assessment.id);
    return [0, 1].map((attemptIndex) => ({
      id: `demo-assessment-attempt-${assessment.id.replace('demo-assessment-', '')}-${attemptIndex + 1}`,
      user_id: learner.id,
      assessment_id: assessment.id,
      score: attemptIndex === 0 ? 82 - assessmentIndex * 3 : 64 + assessmentIndex * 5,
      passed: attemptIndex === 0,
      attempted_at: dateAt(2 + assessmentIndex * 3 + attemptIndex * 6),
      answers: Object.fromEntries(questions.map((question, questionIndex) => [question.id, attemptIndex === 1 && questionIndex % 4 === 0 ? `demo-wrong-${questionIndex}` : question.correct_answer])),
    }));
  }));
  await upsert('learning_activity_events', Array.from({ length: 60 }, (_, index) => {
    const eventType = ['lesson_completed', 'vocabulary_reviewed', 'review_answered', 'assessment_submitted', 'journal_saved'][index % 5];
    return { id: `demo-activity-${String(index + 1).padStart(3, '0')}`, user_id: learner.id, course_id: courses[index % courses.length].id, event_type: eventType, event_label: `Demo ${eventType.replaceAll('_', ' ')}`, occurred_at: dateAt(index % 21, 8 + (index % 7)), metadata: { demo: true, source: 'seed-cloud-demo', sequence: index + 1 } };
  }));

  await upsert('achievement_definitions', [
    { id: 'demo-achievement-first-lesson', title: 'Bài học đầu tiên', description: 'Hoàn thành bài học đầu tiên.', icon: 'book-open', criteria: { lessonsCompleted: 1 }, status: 'active' },
    { id: 'demo-achievement-streak-7', title: 'Giữ nhịp 7 ngày', description: 'Học liên tục trong 7 ngày.', icon: 'flame', criteria: { streakDays: 7 }, status: 'active' },
    { id: 'demo-achievement-vocab-25', title: '25 từ vựng', description: 'Làm chủ 25 từ vựng.', icon: 'languages', criteria: { masteredVocabulary: 25 }, status: 'active' },
    { id: 'demo-achievement-exam-pass', title: 'Vượt checkpoint', description: 'Vượt qua một bài đánh giá.', icon: 'trophy', criteria: { assessmentPassed: 1 }, status: 'active' },
    { id: 'demo-achievement-writing', title: 'Bài viết đầu tiên', description: 'Hoàn thành một bài Writing.', icon: 'pen-line', criteria: { writingSubmissions: 1 }, status: 'active' },
    { id: 'demo-achievement-speaking', title: 'Tự tin nói', description: 'Nộp một bài Speaking.', icon: 'mic', criteria: { speakingSubmissions: 1 }, status: 'active' },
  ]);
  await upsert('learner_achievements', [
    { user_id: learner.id, achievement_id: 'demo-achievement-first-lesson', earned_at: dateAt(17), metadata: { demo: true } },
    { user_id: learner.id, achievement_id: 'demo-achievement-streak-7', earned_at: dateAt(8), metadata: { demo: true, streakDays: 7 } },
    { user_id: learner.id, achievement_id: 'demo-achievement-exam-pass', earned_at: dateAt(2), metadata: { demo: true, score: 82 } },
  ], 'user_id,achievement_id');

  await upsert('document_annotations', [
    { id: DEMO_UUIDS.annotation, user_id: learner.id, document_id: documents[0].id, selected_text: 'おはようございます', note: 'Câu mở đầu ca làm cần nhớ.', color: 'yellow', anchor: { demo: true, start: 0, end: 9 } },
    { id: demoUuid(16), user_id: learner.id, document_id: documents[5].id, selected_text: 'もう一度お願いします', note: 'Dùng khi chưa nghe rõ chỉ dẫn.', color: 'blue', anchor: { demo: true, start: 20, end: 32 } },
  ]);
  await upsert('ai_conversations', [
    { id: DEMO_UUIDS.conversation, user_id: learner.id, course_id: 'demo-course-a1', title: 'Demo · Hỏi về tự giới thiệu' },
    { id: demoUuid(17), user_id: learner.id, course_id: 'demo-course-interview', title: 'Demo · Luyện phỏng vấn' },
  ]);
  await upsert('ai_messages', [
    { id: DEMO_UUIDS.userMessage, conversation_id: DEMO_UUIDS.conversation, user_id: learner.id, role: 'user', content: 'Em nên mở đầu phần tự giới thiệu thế nào?', metadata: { demo: true }, created_at: dateAt(1, 12) },
    { id: DEMO_UUIDS.assistantMessage, conversation_id: DEMO_UUIDS.conversation, user_id: learner.id, role: 'assistant', content: 'Anh có thể nói tên, quê quán và mục tiêu bằng ba câu ngắn, lịch sự.', metadata: { demo: true }, created_at: dateAt(1, 12) },
    { id: demoUuid(18), conversation_id: demoUuid(17), user_id: learner.id, role: 'user', content: 'Điểm mạnh nào phù hợp khi phỏng vấn?', metadata: { demo: true }, created_at: dateAt(3, 18) },
    { id: demoUuid(19), conversation_id: demoUuid(17), user_id: learner.id, role: 'assistant', content: 'Hãy nêu một điểm mạnh có ví dụ cụ thể, chẳng hạn 真面目 và 協力.', metadata: { demo: true }, created_at: dateAt(3, 18) },
  ]);
  const writingRows = [
    { id: DEMO_UUIDS.writingSubmission, user_id: learner.id, course_id: 'demo-course-interview', prompt_id: 'demo-prompt-interview', input_text: '私はベトナムから来ました。日本でまじめに働きたいです。', result: { demo: true, score: 86, summary: 'Câu trả lời ngắn, rõ và phù hợp format phỏng vấn.', corrections: [], strengths: ['Ý chính rõ', 'Dùng đuôi lịch sự'], rewritten: '私はベトナム出身です。日本でまじめに働き、経験を積みたいです。' }, status: 'completed', created_at: dateAt(4), updated_at: dateAt(4) },
    { id: demoUuid(20), user_id: learner.id, course_id: 'demo-course-workplace', prompt_id: 'demo-prompt-interview', input_text: '問題があれば報告します。', result: { demo: true, score: 74, summary: 'Câu đúng ý; cần thêm chủ thể và thời điểm.', corrections: [{ source: '問題があれば', suggestion: '問題があったら' }], strengths: ['Dùng đúng từ 報告'], rewritten: '問題があったら、すぐに店長へ報告します。' }, status: 'completed', created_at: dateAt(7), updated_at: dateAt(7) },
    { id: demoUuid(21), user_id: learner.id, course_id: 'demo-course-kaigo', prompt_id: 'demo-prompt-interview', input_text: '利用者さんの様子を見ます。', result: { demo: true, error: 'Demo failed fixture' }, status: 'failed', created_at: dateAt(1), updated_at: dateAt(1) },
  ];
  await upsert('ai_writing_submissions', writingRows);
  await upsert('ai_usage', [
    { user_id: learner.id, period_start: monthStart(), feature: 'chat', request_count: 3 },
    { user_id: learner.id, period_start: monthStart(), feature: 'writing', request_count: 2 },
    { user_id: learner.id, period_start: monthStart(), feature: 'speaking', request_count: 1 },
  ], 'user_id,period_start,feature');
  await upsert('journal_entries', [
    { id: DEMO_UUIDS.journalOne, user_id: learner.id, title: 'Ngày đầu luyện nói', content: 'Hôm nay mình luyện chào đầu ca và tự giới thiệu. Mình sẽ nói chậm hơn ở lần sau.', prompt: 'Hôm nay mình đã học được gì?', tags: ['demo', 'speaking'], writing_submission_id: DEMO_UUIDS.writingSubmission, created_at: dateAt(4), updated_at: dateAt(2) },
    { id: DEMO_UUIDS.journalTwo, user_id: learner.id, title: 'Ghi chú sau checkpoint', content: 'Mình đã vượt bài checkpoint A1. Cần ôn lại mẫu câu xin nhắc lại và biển báo an toàn.', prompt: 'Điểm cần ôn lại', tags: ['demo', 'review'], writing_submission_id: null, created_at: dateAt(2), updated_at: dateAt(1) },
  ]);

  const speakingPaths = await uploadDemoSpeakingMedia(learner.id);
  await upsert('speaking_submissions', [
    { id: DEMO_UUIDS.speakingOne, user_id: learner.id, prompt_id: 'demo-speaking-a1-intro', course_id: 'demo-course-a1', storage_path: speakingPaths[0], mime_type: 'audio/webm', duration_seconds: 42, status: 'completed', transcript: 'おはようございます。私はルックです。よろしくお願いします。', result: { demo: true, score: 88, summary: 'Phát âm rõ, nhịp nói ổn và dùng câu lịch sự phù hợp.', strengths: ['Mở đầu rõ', 'Kết thúc lịch sự'], improvements: ['Ngắt câu ngắn hơn'], rewritten: 'おはようございます。私はルックです。ベトナムから来ました。よろしくお願いします。', transcriptConfidence: 0.94 }, created_at: dateAt(5), updated_at: dateAt(5) },
    { id: DEMO_UUIDS.speakingTwo, user_id: learner.id, prompt_id: 'demo-speaking-kaigo-roleplay', course_id: 'demo-course-kaigo', storage_path: speakingPaths[1], mime_type: 'audio/webm', duration_seconds: 35, status: 'failed', transcript: null, result: { demo: true }, error_code: 'DEMO_PROCESSING_FAILED', created_at: dateAt(1), updated_at: dateAt(1) },
  ]);

  await upsert('announcements', [{ id: DEMO_UUIDS.announcement, title: 'Demo · Lịch học tuần này', body: 'Dữ liệu demo đã sẵn sàng. Hãy thử đi theo luồng lesson → review → exam → AI.', audience: 'all_learners', action_url: '/app/courses', created_by: admin.id, published_at: dateAt(1) }]);
  await upsert('notifications', [
    { id: DEMO_UUIDS.notificationOne, user_id: learner.id, announcement_id: DEMO_UUIDS.announcement, notification_type: 'announcement', title: 'Demo · Lịch học tuần này', body: 'Dữ liệu demo đã sẵn sàng để kiểm tra.', action_url: '/app/courses', read_at: null, created_at: dateAt(1) },
    { id: DEMO_UUIDS.notificationTwo, user_id: learner.id, announcement_id: null, notification_type: 'review_due', title: 'Có từ vựng đến hạn', body: 'Hãy ôn một lượt ngắn để giữ nhịp học.', action_url: '/app/review/flashcards?mode=due', read_at: dateAt(0, 8), created_at: dateAt(0, 8) },
  ]);
  await upsert('notification_deliveries', [
    { id: DEMO_UUIDS.deliveryOne, notification_id: DEMO_UUIDS.notificationOne, channel: 'email', status: 'pending', attempts: 0 },
    { id: DEMO_UUIDS.deliveryTwo, notification_id: DEMO_UUIDS.notificationTwo, channel: 'email', status: 'skipped', attempts: 0, last_error: 'DEMO_EMAIL_NOT_SENT' },
  ]);
  await upsert('learner_intervention_notes', [{ id: DEMO_UUIDS.intervention, learner_id: learner.id, staff_id: staffAccounts[1].id, body: 'Demo note: nhắc học viên ôn lại câu xin nhắc lại trước buổi phỏng vấn.', created_at: dateAt(2), updated_at: dateAt(2) }]);
  await ensureDemoSitePage('terms', 'Điều khoản sử dụng · Demo', 'Đây là trang nội dung demo để kiểm tra route public và CMS. Nội dung pháp lý chính thức cần được Owner thay trước khi phát hành.', admin.id);
  await ensureDemoSitePage('privacy', 'Chính sách bảo mật · Demo', 'Đây là trang nội dung demo để kiểm tra route public và CMS. Nội dung pháp lý chính thức cần được Owner thay trước khi phát hành.', admin.id);
  await upsert('admin_alerts', [
    { id: 'demo-alert-seeded', severity: 'info', title: 'Demo data is active', body: 'Các record demo- đang được dùng để kiểm tra Cloud production flow.', status: 'open' },
    { id: 'demo-alert-gemini', severity: 'warning', title: 'Gemini secret check', body: 'Đặt GEMINI_API_KEY trong Supabase Secrets để bật AI live.', status: 'open' },
    { id: 'demo-alert-email', severity: 'warning', title: 'Email dispatcher check', body: 'Cấu hình Resend trước khi gửi email thật.', status: 'open' },
  ]);
  await upsert('admin_activity_logs', [
    { id: 'demo-admin-log-seed', actor_id: admin.id, action: 'seeded', entity_type: 'demo_dataset', entity_id: 'demo-cloud', metadata: { source: 'scripts/seed-cloud-demo.ts', createdAt: now } },
    { id: 'demo-admin-log-publish', actor_id: admin.id, action: 'published', entity_type: 'course', entity_id: 'demo-course-a1', metadata: { demo: true } },
  ]);
  await upsert('api_key_metadata', [
    { id: 'demo-api-key-gemini', provider: 'gemini', owner_name: 'Cloud Secret Owner', masked_key: 'not configured', status: 'missing' },
    { id: 'demo-api-key-resend', provider: 'resend', owner_name: 'Cloud Secret Owner', masked_key: 'not configured', status: 'missing' },
    { id: 'demo-api-key-google-stt', provider: 'google-stt', owner_name: 'Cloud Secret Owner', masked_key: 'not configured', status: 'missing' },
  ]);

  await verifySignedUrl('course-assets', documents[0].storage_path);
  await verifySignedUrl('learner-submissions', speakingPaths[0]);
  console.log(JSON.stringify({
    project: process.env.SUPABASE_URL,
    counts: { courses: courses.length, modules: modules.length, lessons: lessons.length, vocabulary: vocabulary.length, reviewQuestions: reviewQuestions.length, exercises: lessonExercises.length, assessments: assessments.length, assessmentQuestions: assessmentQuestions.length, documents: documents.length, podcasts: podcastEpisodes.length, grammarTopics: grammarTopics.length, speakingPrompts: speakingPrompts.length, packages: packages.length, enrollments: enrollmentSpecs.length, activityEvents: 60 },
    signedUrls: { courseAssets: 'verified', learnerSubmissions: 'verified' },
    accounts: {
      admin: { email: DEMO_ADMIN_EMAIL, password: admin.password ?? 'unchanged; set RESET_DEMO_PASSWORD=true to rotate' },
      learner: { email: DEMO_LEARNER_EMAIL, password: learner.password ?? 'unchanged; set RESET_DEMO_PASSWORD=true to rotate' },
      staff: DEMO_STAFF_USERS.map((spec, index) => ({ email: spec.email, role: spec.role, password: staffAccounts[index].password ?? 'unchanged; set RESET_DEMO_PASSWORD=true to rotate' })),
    },
  }, null, 2));
}

async function cleanup(): Promise<void> {
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`auth.listUsers: ${error.message}`);
  const demoEmails = [DEMO_ADMIN_EMAIL, DEMO_LEARNER_EMAIL, ...DEMO_STAFF_USERS.map((user) => user.email)];
  const users = data.users.filter((user) => demoEmails.includes(user.email?.toLowerCase() ?? ''));
  const userIds = users.map((user) => user.id);

  await deleteWhere('notification_deliveries', 'id', [DEMO_UUIDS.deliveryOne, DEMO_UUIDS.deliveryTwo]);
  await deleteWhere('notifications', 'id', [DEMO_UUIDS.notificationOne, DEMO_UUIDS.notificationTwo]);
  await deleteWhere('announcements', 'id', [DEMO_UUIDS.announcement]);
  const userTables = ['document_annotations', 'journal_entries', 'speaking_submissions', 'learner_achievements', 'ai_messages', 'ai_conversations', 'ai_writing_submissions', 'ai_usage', 'assessment_attempts', 'review_attempts', 'lesson_progress', 'vocabulary_progress', 'learning_activity_events', 'enrollments', 'learner_settings'];
  for (const table of userTables) await deleteWhere(table, 'user_id', userIds);
  await deleteWhere('learner_intervention_notes', 'learner_id', userIds);
  await deleteWhere('learner_profiles', 'user_id', userIds);
  await deleteWhere('package_courses', 'package_id', DEMO_PACKAGE_IDS);
  await deleteWhere('grammar_topic_courses', 'topic_id', grammarTopics.map((topic) => topic.id));
  await deleteWhere('grammar_topic_vocabulary', 'topic_id', grammarTopics.map((topic) => topic.id));
  await deleteWhere('lesson_vocabulary', 'lesson_id', lessons.map((lesson) => lesson.id));
  for (const table of ['assessment_questions', 'assessments', 'review_options', 'review_questions', 'lesson_exercises', 'lesson_assets', 'documents', 'podcast_episodes', 'speaking_prompts', 'grammar_rules', 'grammar_examples', 'grammar_topics', 'vocabulary_items', 'lessons', 'course_modules', 'courses', 'packages', 'ai_prompts', 'admin_alerts', 'admin_activity_logs', 'api_key_metadata']) {
    const { error: deleteError } = await client.from(table).delete().like('id', 'demo-%');
    if (deleteError) throw new Error(`${table}: ${deleteError.message}`);
  }
  const { error: revisionError } = await client.from('content_revisions').delete().like('entity_id', 'demo-%');
  if (revisionError) throw new Error(`content_revisions: ${revisionError.message}`);
  const { error: sitePageError } = await client.from('site_pages').delete().like('body_markdown', '<!-- demo-%');
  if (sitePageError) throw new Error(`site_pages: ${sitePageError.message}`);
  await deleteWhere('admin_roles', 'user_id', userIds);
  await deleteWhere('profiles', 'user_id', userIds);
  const { error: mediaError } = await client.storage.from('course-assets').remove(mediaPaths);
  if (mediaError) throw new Error(`storage cleanup: ${mediaError.message}`);
  const learner = users.find((user) => user.email?.toLowerCase() === DEMO_LEARNER_EMAIL);
  if (learner) {
    const speakingMediaPaths = [
      `${learner.id}/speaking/${DEMO_UUIDS.speakingOne}/recording`,
      `${learner.id}/speaking/${DEMO_UUIDS.speakingTwo}/recording`,
    ];
    const { error: speakingMediaError } = await client.storage.from('learner-submissions').remove(speakingMediaPaths);
    if (speakingMediaError) throw new Error(`speaking storage cleanup: ${speakingMediaError.message}`);
  }
  for (const user of users) {
    const { error: deleteError } = await client.auth.admin.deleteUser(user.id);
    if (deleteError) throw new Error(`auth.deleteUser: ${deleteError.message}`);
  }
  console.log(JSON.stringify({ removedUsers: userIds.length, removedDemoIds: true, removedCourseMedia: mediaPaths.length, removedSpeakingMedia: 2 }, null, 2));
}

async function countLike(table: string, column: string, pattern: string): Promise<number> {
  const { count, error } = await client.from(table).select(column, { count: 'exact', head: true }).like(column, pattern);
  if (error) throw new Error(`${table} verify: ${error.message}`);
  return count ?? 0;
}

async function countIds(table: string, column: string, values: string[]): Promise<number> {
  const { count, error } = await client.from(table).select(column, { count: 'exact', head: true }).in(column, values);
  if (error) throw new Error(`${table} verify: ${error.message}`);
  return count ?? 0;
}

async function verify(): Promise<void> {
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(`auth.listUsers: ${error.message}`);
  const demoEmails = [DEMO_ADMIN_EMAIL, DEMO_LEARNER_EMAIL, ...DEMO_STAFF_USERS.map((user) => user.email)];
  const users = data.users.filter((user) => demoEmails.includes(user.email?.toLowerCase() ?? ''));
  if (users.length !== demoEmails.length) throw new Error(`Expected ${demoEmails.length} demo accounts, found ${users.length}`);
  const counts = {
    courses: await countLike('courses', 'id', 'demo-%'),
    modules: await countLike('course_modules', 'id', 'demo-%'),
    lessons: await countLike('lessons', 'id', 'demo-%'),
    vocabulary: await countLike('vocabulary_items', 'id', 'demo-%'),
    reviewQuestions: await countLike('review_questions', 'id', 'demo-%'),
    exercises: await countLike('lesson_exercises', 'id', 'demo-%'),
    assessments: await countLike('assessments', 'id', 'demo-%'),
    documents: await countLike('documents', 'id', 'demo-%'),
    grammarTopics: await countLike('grammar_topics', 'id', 'demo-%'),
    speakingPrompts: await countLike('speaking_prompts', 'id', 'demo-%'),
    journalEntries: await countIds('journal_entries', 'id', [DEMO_UUIDS.journalOne, DEMO_UUIDS.journalTwo]),
    speakingSubmissions: await countIds('speaking_submissions', 'id', [DEMO_UUIDS.speakingOne, DEMO_UUIDS.speakingTwo]),
  };
  const minimums = { courses: 4, modules: 8, lessons: 32, vocabulary: 96, reviewQuestions: 32, exercises: 64, assessments: 4, documents: 32, grammarTopics: 8, speakingPrompts: 8, journalEntries: 2, speakingSubmissions: 2 };
  for (const [name, minimum] of Object.entries(minimums)) {
    if (counts[name as keyof typeof counts] < minimum) throw new Error(`${name} expected at least ${minimum}, found ${counts[name as keyof typeof counts]}`);
  }
  await verifySignedUrl('course-assets', documents[0].storage_path);
  const learner = users.find((user) => user.email?.toLowerCase() === DEMO_LEARNER_EMAIL);
  if (!learner) throw new Error('Demo learner account missing');
  await verifySignedUrl('learner-submissions', `${learner.id}/speaking/${DEMO_UUIDS.speakingOne}/recording`);
  console.log(JSON.stringify({ verified: true, accounts: users.length, counts, signedUrls: { courseAssets: 'verified', learnerSubmissions: 'verified' } }, null, 2));
}

const command = process.argv[2] ?? 'seed';
if (command === 'cleanup') {
  await cleanup();
} else if (command === 'seed') {
  await seed();
} else if (command === 'verify') {
  await verify();
} else {
  throw new Error(`Unknown command ${command}. Use seed, verify or cleanup.`);
}
