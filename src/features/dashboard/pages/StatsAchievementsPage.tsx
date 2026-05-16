import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CalendarDays, CheckCircle2, Flame, Lock, Sparkles, Trophy } from 'lucide-react';
import { statsShell } from '@/src/data/phaseOneMock';
import { cn } from '@/src/lib/utils';

export default function StatsAchievements() {
  const dailyProgress = Math.round((statsShell.completedToday / statsShell.dailyGoal) * 100);
  const maxMinutes = Math.max(...statsShell.weeklyActivity.map((activity) => activity.minutes));

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      <section className="overflow-hidden rounded-[2.75rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-6 shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Link to="/app/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-2 text-sm font-black text-gray-600 transition-all hover:bg-orange-50">
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">Stats + Achievements</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">Tiến độ học của anh</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-gray-500">Màn này gom streak, XP, kỹ năng và huy hiệu để sau này nối dữ liệu thật từ hồ sơ học.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[1.5rem] border border-orange-100 bg-white/80 px-4 py-4 text-center">
              <Flame className="mx-auto fill-orange-500 text-orange-500" size={24} />
              <div className="mt-2 text-2xl font-black text-gray-900">{statsShell.streakDays}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Ngày</div>
            </div>
            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 px-4 py-4 text-center">
              <Sparkles className="mx-auto text-blue-500" size={24} />
              <div className="mt-2 text-2xl font-black text-gray-900">{statsShell.xp}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">XP</div>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-4 py-4 text-center">
              <Trophy className="mx-auto text-emerald-500" size={24} />
              <div className="mt-2 text-2xl font-black text-gray-900">{statsShell.level}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">Level</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
            <CalendarDays size={14} /> Mục tiêu hôm nay
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-5xl font-black text-gray-900">{statsShell.completedToday}</div>
              <div className="mt-1 text-sm font-bold text-gray-400">/{statsShell.dailyGoal} XP hôm nay</div>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-black text-orange-600">{dailyProgress}%</div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#efe5d7]">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" initial={{ width: 0 }} whileInView={{ width: `${dailyProgress}%` }} />
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }).map((_, index) => {
              const activeLevel = index % 5;
              return <div key={index} className={cn('h-8 rounded-lg border border-white', activeLevel > 2 ? 'bg-orange-400' : activeLevel > 0 ? 'bg-orange-200' : 'bg-[#f1e7d9]')} />;
            })}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
            <Sparkles size={14} /> Tổng kết tuần
          </div>
          <div className="mt-5 flex h-64 items-end gap-3 rounded-[2rem] border border-blue-100 bg-blue-50/50 p-4">
            {statsShell.weeklyActivity.map((activity) => {
              const height = Math.max(12, Math.round((activity.minutes / maxMinutes) * 100));
              return (
                <div key={activity.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end rounded-full bg-white/80 p-1">
                    <motion.div className="w-full rounded-full bg-gradient-to-t from-blue-500 to-cyan-300" initial={{ height: 0 }} whileInView={{ height: `${height}%` }} />
                  </div>
                  <div className="text-[10px] font-black uppercase text-blue-500">{activity.day}</div>
                  <div className="text-[10px] font-bold text-gray-400">{activity.minutes}'</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.42fr_1fr]">
        <aside className="space-y-4">
          {statsShell.highlights.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <div key={highlight.label} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{highlight.label}</div>
                    <div className="text-xl font-black text-gray-900">{highlight.value}</div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Kỹ năng</div>
            <div className="mt-4 space-y-4">
              {statsShell.skills.map((skill) => (
                <div key={skill.label}>
                  <div className="mb-2 flex justify-between text-xs font-bold text-gray-500">
                    <span>{skill.label}</span>
                    <span>{skill.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#efe5d7]">
                    <motion.div className={cn('h-full rounded-full', skill.color)} initial={{ width: 0 }} whileInView={{ width: `${skill.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Achievements</p>
              <h2 className="text-2xl font-black tracking-tight text-gray-900">Huy hiệu</h2>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600">2 đã mở</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statsShell.achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              const isUnlocked = achievement.status === 'unlocked';
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cn('rounded-[2rem] border p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.16)]', isUnlocked ? 'border-orange-100 bg-orange-50/60' : 'border-[#e6ddd1] bg-[#fffdf8]')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn('flex h-14 w-14 items-center justify-center rounded-[1.35rem] border bg-white shadow-sm', isUnlocked ? 'border-orange-100 text-orange-500' : 'border-gray-100 text-gray-300')}>
                      <Icon size={26} />
                    </div>
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', isUnlocked ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-400')}>
                      {isUnlocked ? <CheckCircle2 size={18} /> : <Lock size={16} />}
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-black text-gray-900">{achievement.title}</h3>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" initial={{ width: 0 }} whileInView={{ width: `${achievement.progress}%` }} />
                  </div>
                  <div className="mt-2 text-xs font-bold text-gray-400">{achievement.progress}%</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
