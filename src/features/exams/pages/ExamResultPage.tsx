import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, ChevronRight, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { examShell } from '@/src/data/phaseOneMock';

export default function ExamResult() {
  const { id } = useParams();
  const examId = id ?? examShell.id;
  const averageScore = Math.round(examShell.skills.reduce((total, skill) => total + skill.score, 0) / examShell.skills.length);
  const weakestSkill = examShell.skills.reduce((lowest, skill) => (skill.score < lowest.score ? skill : lowest), examShell.skills[0]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-24">
      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Link to="/app/exams" className="inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-2 text-sm font-semibold text-[#5f6b7c] transition-colors hover:text-orange-700">
              <ArrowLeft size={16} strokeWidth={1.8} />
              Về trung tâm luyện thi
            </Link>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">Kết quả</p>
              <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-[#172033] md:text-4xl">Kết quả mock exam</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5f6b7c]">{examShell.title} đã được chấm bằng dữ liệu giả lập để anh xem trước layout feedback sau thi.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-6 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-700 text-white">
              <Trophy size={36} strokeWidth={1.8} />
            </div>
            <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#95a0af]">Tổng điểm</div>
            <div className="mt-1 font-[var(--font-heading)] text-5xl font-bold text-orange-700">{averageScore}</div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={13} strokeWidth={1.8} /> Pass mock
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {examShell.skills.map((skill, index) => {
          const Icon = skill.icon;
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <span className="rounded-full border border-[#e8dccb] bg-[#fffdf8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b8796]">{skill.answered}/{skill.totalQuestions}</span>
              </div>
              <h3 className="mt-5 font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]">{skill.label}</h3>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-[var(--font-heading)] text-4xl font-bold text-[#172033]">{skill.score}</span>
                <span className="pb-1 text-xs font-semibold text-[#95a0af]">/100</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
                <motion.div className="h-full rounded-full bg-orange-700" initial={{ width: 0 }} whileInView={{ width: `${skill.score}%` }} />
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.42fr]">
        <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-700">
            <Sparkles size={14} strokeWidth={1.8} /> Lỗi đáng sửa
          </div>
          <div className="mt-5 space-y-3">
            {[
              'Tiếng Nhật: khoanh cụm từ khóa trước khi chọn đáp án.',
              'Tình huống: ưu tiên phản xạ an toàn và đúng tác phong nơi làm việc.',
              'Hồ sơ: nhớ kiểm tra thứ tự giấy tờ và tình huống cần báo cáo.',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-5 py-4 text-sm text-[#5f6b7c]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-500">Phần yếu nhất</div>
            <div className="mt-2 font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033]">{weakestSkill.label}</div>
            <p className="mt-2 text-sm leading-relaxed text-rose-600/80">Ưu tiên luyện lại phần này trong phiên tiếp theo.</p>
          </div>
          <Link to={`/app/exams/${examId}/start`} className="flex items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-[#5f6b7c] transition-colors hover:border-orange-300 hover:text-orange-700">
            <RotateCcw size={16} strokeWidth={1.8} /> Làm lại đề
          </Link>
          <Link to="/app/review/flashcards" className="flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-800">
            Luyện phần yếu
            <ChevronRight size={16} strokeWidth={1.8} />
          </Link>
        </aside>
      </section>
    </div>
  );
}
