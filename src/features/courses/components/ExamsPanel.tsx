import { type CSSProperties } from 'react';
import { Award, BarChart3, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, Headphones, Lock, Play } from 'lucide-react';
import {
  type CourseExamItem,
} from '@/src/features/courses/courseLearning.types';
import { cn } from '@/src/lib/utils';
import { focusRing } from '@/src/features/courses/components/coursePanelStyles';

interface ExamsPanelProps {
  exams: CourseExamItem[];
  onStartExam: (examId: string) => void;
}

export function ExamsPanel({ exams, onStartExam }: ExamsPanelProps) {
  const statusLabels = {
    ready: 'Sẵn sàng',
    in_progress: 'Đang làm dở',
    completed: 'Đã hoàn thành',
    locked: 'Chưa mở khóa',
  } satisfies Record<CourseExamItem['status'], string>;
  const completedExams = exams.filter((exam) => exam.status === 'completed');
  const inProgressExam = exams.find((exam) => exam.status === 'in_progress');
  const recentExam = completedExams[completedExams.length - 1];

  return (
    <div className="course-exam-dashboard review-practice-page is-embedded course-exam-practice-page">
      <div className="review-practice-glow review-practice-glow-one" />
      <div className="review-practice-glow review-practice-glow-two" />

      <header className="course-exam-hero">
        <div className="course-exam-hero-icon"><ClipboardCheck size={30} aria-hidden="true" focusable="false" /></div>
        <div>
          <p className="course-exam-hero-eyebrow">Tokutei Foundation Sprint</p>
          <h1>THI THỬ TOKUTEI</h1>
          <p>Luyện đề – Làm quen áp lực – Tăng tự tin</p>
        </div>
        <div className="course-exam-hero-sakura" aria-hidden="true">✦</div>
      </header>

      {inProgressExam && (
        <section className="course-exam-continue" aria-label="Tiếp tục bài đang làm">
          <div className="course-exam-section-kicker"><Headphones size={16} aria-hidden="true" focusable="false" /> Tiếp tục bài đang làm <span>✦</span></div>
          <div className="course-exam-continue-body">
            <div className="course-exam-continue-icon"><Headphones size={26} aria-hidden="true" focusable="false" /></div>
            <div className="course-exam-continue-copy">
              <h2>{inProgressExam.title}</h2>
              <div className="course-exam-continue-meta">
                <span><Clock3 size={16} aria-hidden="true" focusable="false" /> {inProgressExam.duration}</span>
                {inProgressExam.latestScore !== undefined && <span><BarChart3 size={16} aria-hidden="true" focusable="false" /> Tiến độ <strong>{inProgressExam.latestScore}%</strong></span>}
              </div>
              {inProgressExam.latestScore !== undefined && (
                <div className="course-exam-progress" aria-label={`Tiến độ ${inProgressExam.latestScore}%`}>
                  <span style={{ width: `${inProgressExam.latestScore}%` }} />
                </div>
              )}
            </div>
            <button type="button" onClick={() => onStartExam(inProgressExam.id)} className={cn('course-exam-continue-button', focusRing)}>
              Tiếp tục <ChevronRight size={20} aria-hidden="true" focusable="false" />
            </button>
          </div>
        </section>
      )}

      <section className="course-exam-list-section" aria-label="Danh sách đề thi trong khóa học">
        <div className="course-exam-list-heading">
          <h2><ClipboardCheck size={22} aria-hidden="true" focusable="false" /> Danh sách đề thi</h2>
          <span>{exams.length} đề</span>
        </div>

        <div className="course-exam-card-grid">
          {exams.map((exam, index) => {
            const isLocked = exam.status === 'locked';
            return (
            <article key={exam.id} className={cn('course-exam-card', `is-${exam.status}`)}>
              <div className="course-exam-card-heading">
                <span className="course-exam-card-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="course-exam-card-status-icon">
                  {exam.status === 'completed' ? <CheckCircle2 size={21} aria-hidden="true" focusable="false" /> : exam.status === 'in_progress' ? <Headphones size={21} aria-hidden="true" focusable="false" /> : exam.status === 'locked' ? <Lock size={21} aria-hidden="true" focusable="false" /> : <ClipboardCheck size={21} aria-hidden="true" focusable="false" />}
                </span>
              </div>
              <div className="course-exam-card-content">
                <h2>{exam.title}</h2>
                <div className="course-exam-card-meta">
                  <span><Clock3 size={14} /> {exam.duration}</span>
                  {exam.status === 'in_progress' && exam.latestScore !== undefined && <span>Tiến độ <strong>{exam.latestScore}%</strong></span>}
                  {exam.status === 'completed' && exam.latestScore !== undefined && <span>Điểm cao nhất <strong>{exam.latestScore}%</strong></span>}
                  {isLocked && exam.unlockLabel && <span><Lock size={14} /> {exam.unlockLabel}</span>}
                </div>
                <span className="course-exam-status">{statusLabels[exam.status]}</span>
              </div>
              <button
                type="button"
                onClick={() => onStartExam(exam.id)}
                disabled={isLocked}
                className={cn('course-exam-start', focusRing)}
                aria-label={isLocked ? `Đề ${exam.title} chưa mở khóa` : exam.status === 'completed' ? `Làm lại đề ${exam.title}` : exam.status === 'in_progress' ? `Tiếp tục đề ${exam.title}` : `Làm đề ${exam.title}`}
              >
                <span>{isLocked ? 'Đang khóa' : exam.status === 'completed' ? 'Làm lại' : exam.status === 'in_progress' ? 'Tiếp tục' : 'Làm đề ngay'}</span>
                {isLocked ? <Lock size={15} aria-hidden="true" focusable="false" /> : <Play size={15} fill="currentColor" aria-hidden="true" focusable="false" />}
              </button>
            </article>
            );
          })}
        </div>
      </section>

      <div className="course-exam-stats" aria-label="Tổng quan đề thi">
        <div><span className="review-summary-icon review-summary-icon-red"><ClipboardCheck size={15} /></span><strong>{exams.length}</strong><small>đề trong khóa</small></div>
        <div><span className="review-summary-icon review-summary-icon-blue"><Clock3 size={15} /></span><strong>{exams[0]?.duration ?? '—'}</strong><small>đề khởi động</small></div>
        <div><span className="review-summary-icon review-summary-icon-gold"><Award size={15} /></span><strong>{completedExams.length}</strong><small>đã hoàn thành</small></div>
      </div>

      {recentExam?.latestScore !== undefined && (
        <section className="course-exam-recent" aria-label="Kết quả gần đây">
          <div className="course-exam-recent-heading"><h2><BarChart3 size={20} aria-hidden="true" focusable="false" /> Kết quả gần đây</h2><span>Hoàn thành</span></div>
          <div className="course-exam-recent-body">
            <div className={cn('course-exam-score-ring', recentExam.latestScore >= 80 && 'is-gold')} style={{ '--score': `${recentExam.latestScore}%` } as CSSProperties}><strong>{recentExam.latestScore}%</strong><small>{recentExam.latestScore >= 80 ? 'Xuất sắc' : 'Điểm cao nhất'}</small></div>
            <div className="course-exam-recent-copy"><h3>{recentExam.title}</h3><p><Clock3 size={15} aria-hidden="true" focusable="false" /> {recentExam.duration}</p><span><CheckCircle2 size={15} aria-hidden="true" focusable="false" /> Hoàn thành</span></div>
          </div>
        </section>
      )}
    </div>
  );
}
