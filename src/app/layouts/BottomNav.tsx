import { Home, GraduationCap, Bookmark, Layout, RotateCcw } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/app/dashboard' },
    { icon: Layout, label: 'Khóa học', path: '/app/courses' },
    { icon: RotateCcw, label: 'Ôn tập', path: '/app/review' },
    { icon: GraduationCap, label: 'Luyện thi', path: '/app/exams' },
    { icon: Bookmark, label: 'Từ của tôi', path: '/app/grammar' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex min-h-[4.35rem] items-center justify-around border-t border-[#e6ddd1] bg-[#fffaf3]/92 px-1 pb-safe shadow-[0_-12px_36px_-20px_rgba(148,163,184,0.2)] backdrop-blur-xl md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "bottom-nav-item relative flex flex-1 flex-col items-center justify-center gap-1 px-0.5 py-1 transition-all duration-300"
            )
          }
        >
          {({ isActive }) => (
            <motion.div 
              className="flex min-w-0 flex-col items-center gap-1"
              whileTap={{ scale: 0.9 }}
            >
              <div className={cn(
                "relative rounded-xl p-1.5 transition-all",
                isActive && "bg-gradient-to-br from-orange-100 to-[#f7efe4] shadow-sm"
              )}>
                <item.icon 
                  size={21} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-orange-500" : "text-gray-400"
                  )} 
                />
              </div>
              <span className={cn(
                "bottom-nav-label max-w-full truncate text-[10px] font-bold tracking-tight",
                isActive ? "text-orange-500" : "text-gray-400"
              )}>{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-sm" />
              )}
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
