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
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <section className="overflow-hidden rounded-[2.75rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-6 shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Link to="/app/exams" className="inline-flex items-center gap-2 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-2 text-sm font-black text-gray-600 transition-all hover:bg-orange-50">
              <ArrowLeft size={16} />
              Về Exam Center
            </Link>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">Exam Result</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">Kết quả mock exam</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-gray-500">{examShell.title} đã được chấm bằng dữ liệu giả lập để anh xem trước layout feedback sau thi.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-[2.5rem] border border-orange-100 bg-white/80 p-6 text-center shadow-xl shadow-orange-100/60"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200">
              <Trophy size={36} />
            </div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Tổng điểm</div>
            <div className="mt-1 text-5xl font-black text-orange-600">{averageScore}</div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
              <CheckCircle2 size={13} /> Pass mock
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
              className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.16)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-500">
                  <Icon size={22} />
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">{skill.answered}/{skill.totalQuestions}</span>
              </div>
              <h3 className="mt-5 text-xl font-black text-gray-900">{skill.label}</h3>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-black text-gray-900">{skill.score}</span>
                <span className="pb-1 text-xs font-bold text-gray-400">/100</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" initial={{ width: 0 }} whileInView={{ width: `${skill.score}%` }} />
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
            <Sparkles size={14} /> Lỗi đáng sửa
          </div>
          <div className="mt-5 space-y-3">
            {[
              'Tiếng Nhật: khoanh cụm từ khóa trước khi chọn đáp án.',
              'Tình huống: ưu tiên phản xạ an toàn và đúng tác phong nơi làm việc.',
              'Hồ sơ: nhớ kiểm tra thứ tự giấy tờ và tình huống cần báo cáo.',
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-[#eadfce] bg-[#fffdf8] px-5 py-4 text-sm font-medium text-gray-600">
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-red-100 bg-red-50/70 p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">Phần yếu nhất</div>
            <div className="mt-2 text-2xl font-black text-gray-900">{weakestSkill.label}</div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-red-600/80">Ưu tiên luyện lại phần này trong phiên tiếp theo.</p>
          </div>
          <Link to={`/app/exams/${examId}/start`} className="flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-black text-orange-600 transition-all hover:bg-orange-50">
            <RotateCcw size={16} /> Làm lại đề
          </Link>
          <Link to="/app/review/flashcards" className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
            Luyện phần yếu
            <ChevronRight size={16} />
          </Link>
        </aside>
      </section>
    </div>
  );
}
