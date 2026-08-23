import { AnimatePresence, motion } from 'motion/react';
import { Bell, ChevronRight, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardTask {
  title: string;
  status: string;
  action: string;
  icon: LucideIcon;
  path: string;
}

interface DashboardQuestsModalProps {
  open: boolean;
  onClose: () => void;
  tasks: DashboardTask[];
}

export function DashboardQuestsModal({ open, onClose, tasks }: DashboardQuestsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Nhiệm vụ Tokutei hôm nay"
        >
          <motion.section
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-[#fde6d2] bg-[#fffaf5] shadow-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#f5ece1] bg-gradient-to-r from-[#fff7f0] to-[#ffeedd] px-5 py-4 sm:px-6">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#d83a00] shadow-2xs">
                  <Bell size={11} className="text-[#d83a00]" /> GIỮ NHỊP MỖI NGÀY
                </span>
                <h2 className="font-[var(--font-heading)] text-lg font-black text-[#0f172a]">
                  Nhiệm vụ Tokutei hôm nay ⚔️
                </h2>
                <p className="text-xs font-semibold text-[#717d8f]">
                  Hoàn thành để giữ chuỗi và tích điểm XP.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng nhiệm vụ"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#5f6b7c] transition-colors hover:bg-white hover:text-[#d83a00]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 py-4 sm:px-6">
              {tasks.map((task) => {
                const Icon = task.icon;
                return (
                  <Link
                    key={task.title}
                    to={task.path}
                    onClick={onClose}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-[#f5ece1] bg-white p-3.5 transition-all duration-200 hover:border-orange-200 hover:bg-[#fff7f0] hover:shadow-2xs"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#d83a00] border border-orange-200/60 transition-transform group-hover:scale-105">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-black text-sm text-[#0f172a] transition-colors group-hover:text-[#d83a00]">
                          {task.title}
                        </span>
                        <span className="block truncate text-xs font-semibold text-[#717d8f]">{task.status}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-xs font-black text-[#b45309]">{task.action}</span>
                      <ChevronRight size={16} className="text-[#95a0af] transition-colors group-hover:text-[#d83a00]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { DashboardTask };
