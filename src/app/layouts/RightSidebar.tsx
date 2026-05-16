import { Link } from 'react-router-dom';
import { Search, Flame, BookOpen, Clock, ChevronRight, Volume2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function RightSidebar() {
  const stats = [
    { label: 'Cụm đã khóa', value: '0', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50', gradient: 'from-blue-400 to-cyan-300' },
    { label: 'Lượt ôn', value: '0', icon: Clock, color: 'text-sky-500', bg: 'bg-sky-50', gradient: 'from-sky-400 to-blue-300' },
    { label: 'Streak', value: '0', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', gradient: 'from-orange-400 to-amber-300' },
  ];

  return (
    <aside className="hidden w-80 p-6 pb-8 flex-col gap-6 h-full overflow-y-auto lg:flex no-scrollbar bg-gradient-to-b from-white via-orange-50/10 to-white">
      {/* Search với hiệu ứng glass và shadow */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/app/search" className="relative group block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-orange-500" size={18} />
          <span className="block w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm text-gray-400 transition-all shadow-lg shadow-orange-50 hover:shadow-xl hover:ring-2 hover:ring-orange-400">
            Tìm flashcards, hồ sơ, mock Tokutei...
          </span>
        </Link>
      </motion.div>

      {/* Stats với thiết kế gradient và hiệu ứng nổi */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-orange-50 space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-pink-400" />
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
          <Sparkles size={16} className="text-orange-400" />
          Thống kê học tập
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          {stats.map((stat) => (
            <motion.div 
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="space-y-2"
            >
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} p-0.5 shadow-lg`}>
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center py-3">
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
              <div>
                <div className="text-lg font-black">{stat.value}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <Link to="/app/stats" className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center justify-center gap-1 hover:bg-gray-50 transition-all shadow-sm">
          Xem chi tiết <ChevronRight size={14} />
        </Link>
      </motion.section>

      {/* Quiz với gradient background lung linh giống Dashboard */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative flex flex-1 flex-col space-y-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 via-amber-500 to-orange-400 p-6 text-white shadow-2xl shadow-orange-200"
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl" />
        <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-pink-300/20 rounded-full blur-2xl" />
        
        <header className="flex items-center justify-between relative z-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Thử thách hôm nay</h3>
          <Link to="/app/hub/gino-runner" className="text-[10px] font-bold hover:underline text-white/80">Xem thêm →</Link>
        </header>

        <div className="text-center py-4 flex flex-col items-center gap-2 relative z-10">
          <p className="text-[10px] font-bold text-white/60">Cụm nào đúng với hành động cần làm?</p>
          <div className="flex items-center gap-2">
            <h4 className="text-xl font-black">houkoku</h4>
            <Link to="/app/hub/listening" aria-label="Mở luyện nghe" className="text-white/70 transition hover:text-white">
              <Volume2 size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          {['báo cáo cho quản lý', 'đổi ca làm ngay', 'đi nghỉ giữa giờ', 'kiểm tra đồng phục'].map((opt) => (
            <motion.div key={opt} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/app/hub/gino-runner" className="block bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-3 text-[10px] font-bold transition-all leading-tight backdrop-blur-sm">
                {opt}
              </Link>
            </motion.div>
          ))}
        </div>

        <footer className="text-center space-y-2 pt-4 border-t border-white/10 relative z-10">
          <p className="text-[9px] font-medium text-white/60">Mini challenge 1 phút để giữ nhịp Tokutei</p>
          <Link to="/app/hub/gino-runner" className="text-[10px] font-bold flex items-center gap-1 justify-center w-full text-white/80 hover:text-white">
            Làm mới 🔄
          </Link>
        </footer>
      </motion.section>
    </aside>
  );
}
