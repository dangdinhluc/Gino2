import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronRight,
  Clock3,
  Headphones,
  Mic2,
  PenLine,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { getPublicLearnerEntryPath } from '@/src/features/auth/lib/authRouteDecisions';
import { assets } from '@/src/shared/lib/assets';

const learningSteps = [
  {
    number: '01',
    title: 'Nắm nền tảng',
    description: 'Kana, kanji và mẫu câu được sắp theo mức độ để anh không bị ngợp.',
    image: assets.courses.workspace.vocabulary,
  },
  {
    number: '02',
    title: 'Luyện theo nghề',
    description: 'Từ vựng và tình huống thực tế cho nhà hàng, điều dưỡng, xây dựng.',
    image: assets.courses.workspace.documents,
  },
  {
    number: '03',
    title: 'Thi thử, biết mình đang ở đâu',
    description: 'Ôn tập, làm đề và xem lại lỗi sai trong cùng một lộ trình.',
    image: assets.courses.workspace.exam,
  },
] as const;

const learningTools = [
  { icon: BookOpenCheck, title: 'Bài học có thứ tự', description: 'Mỗi ngày mở app là biết nên học gì tiếp theo.' },
  { icon: Headphones, title: 'Nghe và phản xạ', description: 'Luyện cách nói tự nhiên trong những tình huống đi làm.' },
  { icon: Mic2, title: 'Luyện phỏng vấn', description: 'Tập trả lời ngắn, rõ ý và tự tin hơn trước buổi phỏng vấn.' },
  { icon: PenLine, title: 'Ôn lại đúng lúc', description: 'SRS nhắc lại từ vựng trước khi anh quên hẳn.' },
] as const;

export default function LandingPage() {
  const auth = useAuth();
  const isAuthenticated = !auth.isLoading && auth.isAuthenticated;
  const learnerEntryPath = getPublicLearnerEntryPath(isAuthenticated);
  const primaryLabel = isAuthenticated ? 'Tiếp tục học' : 'Bắt đầu miễn phí';

  return (
    <div className="landing-v2">
      <a className="landing-v2-skip" href="#landing-content">Bỏ qua điều hướng</a>

      <header className="landing-v2-header">
        <Link className="landing-v2-brand" to="/" aria-label="TOKUTEI GINO trang chủ">
          <span className="landing-v2-brand-mark"><img src={assets.shared.mascots.brand} alt="" aria-hidden="true" /></span>
          <span><strong>TOKUTEI GINO</strong><small>HỌC TIẾNG NHẬT CÓ ĐÍCH</small></span>
        </Link>

        <nav className="landing-v2-nav" aria-label="Điều hướng chính">
          <a href="#path">Lộ trình</a>
          <a href="#tools">Cách học</a>
          <Link className="landing-v2-nav-login" to={learnerEntryPath}>{isAuthenticated ? 'Vào học' : 'Đăng nhập'}</Link>
        </nav>
      </header>

      <main id="landing-content">
        <section className="landing-v2-hero" aria-labelledby="landing-v2-title">
          <div className="landing-v2-hero-copy">
            <p className="landing-v2-kicker"><span className="landing-v2-kicker-dot" aria-hidden="true" /> Lộ trình tiếng Nhật cho người đi Nhật</p>
            <h1 id="landing-v2-title">Học vững hôm nay.<br /><span>Vững bước ngày mai.</span></h1>
            <p className="landing-v2-hero-description">Từ nền tảng tiếng Nhật đến JFT-Basic, giao tiếp nơi làm việc và phỏng vấn Tokutei — học theo một đường đi rõ ràng.</p>

            <div className="landing-v2-actions">
              <Link className="landing-v2-primary" to={learnerEntryPath}>{primaryLabel}<ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="landing-v2-secondary" to="/onboarding">Kiểm tra trình độ<ChevronRight size={16} aria-hidden="true" /></Link>
            </div>

            <div className="landing-v2-proof" aria-label="Lợi ích chính">
              <span><Check size={15} aria-hidden="true" /> Học theo mục tiêu</span>
              <span><Check size={15} aria-hidden="true" /> Theo dõi tiến độ</span>
              <span><Check size={15} aria-hidden="true" /> Ôn tập mỗi ngày</span>
            </div>
          </div>

          <div className="landing-v2-hero-visual" aria-label="Xem trước khu học tập">
            <div className="landing-v2-visual-glow" aria-hidden="true" />
            <div className="landing-v2-orbit-label landing-v2-orbit-label-top" aria-hidden="true">JFT-BASIC</div>
            <div className="landing-v2-product-card">
              <div className="landing-v2-product-top">
                <img src={assets.shared.backgrounds.fujiScene} alt="" aria-hidden="true" />
                <div className="landing-v2-product-topline"><span>TOKUTEI GINO</span><span className="landing-v2-live-dot"><i aria-hidden="true" /> Đang học</span></div>
                <div className="landing-v2-product-title"><small>LỘ TRÌNH CỦA BẠN</small><strong>Tiếng Nhật đi làm</strong></div>
              </div>

              <div className="landing-v2-product-body">
                <div className="landing-v2-product-stat-row"><div><span>HÔM NAY</span><strong>20 phút học tập</strong></div><div className="landing-v2-time-badge"><Clock3 size={14} aria-hidden="true" /> 20:00</div></div>
                <div className="landing-v2-progress-label"><span>Tiến độ tuần này</span><strong>68%</strong></div>
                <div className="landing-v2-progress-track" aria-hidden="true"><span /></div>

                <div className="landing-v2-next-lesson">
                  <img src={assets.courses.workspace.vocabulary} alt="" aria-hidden="true" />
                  <div><small>BÀI TIẾP THEO</small><strong>Từ vựng nhà hàng</strong><span>12 từ · 8 phút</span></div>
                  <ChevronRight size={18} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="landing-v2-mascot-card" aria-hidden="true"><img src={assets.shared.mascots.brand} alt="" /><span><Sparkles size={12} /> Gino đồng hành cùng anh</span></div>
            <div className="landing-v2-orbit-label landing-v2-orbit-label-bottom" aria-hidden="true">毎日 · MỖI NGÀY</div>
          </div>
        </section>

        <section className="landing-v2-section landing-v2-path" id="path" aria-labelledby="landing-v2-path-title">
          <div className="landing-v2-section-heading"><p className="landing-v2-eyebrow">LỘ TRÌNH RÕ RÀNG</p><h2 id="landing-v2-path-title">Không cần học lan man.</h2><p>Chỉ cần mở app, chọn bài tiếp theo và giữ nhịp học đều mỗi ngày.</p></div>
          <div className="landing-v2-step-grid">
            {learningSteps.map((step) => (
              <article className="landing-v2-step" key={step.number}>
                <div className="landing-v2-step-image"><img src={step.image} alt="" aria-hidden="true" /></div>
                <div className="landing-v2-step-number">{step.number}</div><h3>{step.title}</h3><p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-v2-section landing-v2-tools" id="tools" aria-labelledby="landing-v2-tools-title">
          <div className="landing-v2-tools-intro"><p className="landing-v2-eyebrow">MỘT NƠI ĐỂ HỌC</p><h2 id="landing-v2-tools-title">Đủ công cụ để tiến bộ thật.</h2><p>Những gì anh cần cho hành trình Tokutei được gom lại trong một khu học tập nhẹ và dễ dùng.</p><Link className="landing-v2-text-link" to={learnerEntryPath}>Khám phá khu học tập <ArrowRight size={15} aria-hidden="true" /></Link></div>
          <div className="landing-v2-tool-grid">
            {learningTools.map(({ icon: Icon, title, description }) => <article className="landing-v2-tool" key={title}><span className="landing-v2-tool-icon"><Icon size={18} aria-hidden="true" /></span><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </section>

        <section className="landing-v2-final-cta" aria-labelledby="landing-v2-cta-title"><div><p className="landing-v2-eyebrow">BẮT ĐẦU TỪ HÔM NAY</p><h2 id="landing-v2-cta-title">Một bài học nhỏ mỗi ngày.</h2><p>Để tiếng Nhật tiến gần hơn đến công việc anh muốn.</p></div><Link className="landing-v2-primary landing-v2-primary-light" to={learnerEntryPath}>{primaryLabel}<ArrowRight size={17} aria-hidden="true" /></Link></section>
      </main>

      <footer className="landing-v2-footer"><span>© 2026 TOKUTEI GINO</span><div><Link to="/terms">Điều khoản</Link><Link to="/privacy">Bảo mật</Link><Link to={learnerEntryPath}>{isAuthenticated ? 'Vào học' : 'Đăng nhập'}</Link></div></footer>
    </div>
  );
}
