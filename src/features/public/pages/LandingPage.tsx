import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Headphones,
  Layers,
  Library,
  Mic,
  PenLine,
  Sparkles,
  Target,
} from 'lucide-react';
import { assets } from '@/src/shared/lib/assets';

const heroStats = [
  { value: 'JFT', label: 'BASIC' },
  { value: 'SRS', label: 'ÔN TẬP' },
  { value: 'AI', label: 'COACH' },
];

const methods = [
  { icon: Target, title: 'Tiếng Nhật nền', desc: 'Kana, kanji và mẫu câu từ N5 đến N4.' },
  { icon: Layers, title: 'Từ vựng công việc', desc: 'Nhà hàng, xây dựng, điều dưỡng và nhiều chủ đề Tokutei.' },
  { icon: Headphones, title: 'Luyện JFT-Basic', desc: 'Nghe, đọc và phản xạ theo dạng bài thực tế.' },
  { icon: Mic, title: 'Giao tiếp hiện trường', desc: 'Hourensou, anzen và cách nói lịch sự nơi làm việc.' },
  { icon: PenLine, title: 'Phỏng vấn Tokutei', desc: 'Tập trả lời ngắn, đúng ý, có romaji và dịch Việt.' },
  { icon: Library, title: 'Đề luyện thi', desc: 'Theo dõi điểm, lỗi sai và nhịp ôn mỗi ngày.' },
];

const sakuraPetals = [
  ['4%', 14, '-2s', '16s'],
  ['11%', 10, '-8s', '19s'],
  ['18%', 16, '-5s', '14s'],
  ['26%', 12, '-11s', '18s'],
  ['34%', 9, '-4s', '15s'],
  ['43%', 15, '-14s', '21s'],
  ['51%', 11, '-7s', '17s'],
  ['59%', 17, '-1s', '20s'],
  ['67%', 10, '-10s', '14s'],
  ['75%', 14, '-6s', '18s'],
  ['83%', 9, '-13s', '16s'],
  ['92%', 15, '-3s', '22s'],
] as const;

export default function LandingPage() {
  return (
    <div className="landing-page">
      <a className="landing-skip" href="#landing-main">
        Bỏ qua điều hướng
      </a>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div
          className="landing-hero-background"
          style={{ backgroundImage: `url("${assets.shared.backgrounds.englishHero}")` }}
          aria-hidden="true"
        />
        <div className="landing-hero-overlay" aria-hidden="true" />
        <div className="landing-sakura-layer" aria-hidden="true">
          {sakuraPetals.map(([left, size, delay, duration], index) => (
            <span
              className="landing-sakura-petal"
              key={`${left}-${index}`}
              style={{ left, width: size, height: size, animationDelay: delay, animationDuration: duration }}
            />
          ))}
        </div>

        <header className="landing-header">
          <Link className="landing-brand" to="/" aria-label="TOKUTEI GINO trang chủ">
            <img src={assets.shared.mascots.meow} alt="Meow" />
            <span>
              <strong>TOKUTEI GINO</strong>
              <small>TIẾNG NHẬT ĐI LÀM</small>
            </span>
          </Link>

          <nav className="landing-nav" aria-label="Điều hướng chính">
            <Link to="/onboarding">Test đầu vào</Link>
            <Link to="/login">Đăng nhập</Link>
            <Link className="landing-nav-cta" to="/login">
              Bắt đầu miễn phí
            </Link>
          </nav>
        </header>

        <div className="landing-hero-content">
          <h1 id="landing-title">
            Học tiếng Nhật
            <br />
            vững bước <span>Tokutei</span>
          </h1>

          <div className="landing-actions">
            <Link className="landing-primary-button" to="/app/courses">
              Bắt đầu lộ trình
            </Link>
            <Link className="landing-secondary-button" to="/onboarding">
              Làm test đầu vào
            </Link>
          </div>

          <div className="landing-stats" aria-label="Thông tin nền tảng">
            {heroStats.map((stat) => (
              <span key={stat.label}>
                <strong>{stat.value}</strong> {stat.label}
              </span>
            ))}
          </div>

          <img
            className="landing-mascot"
            src={assets.shared.mascots.meow}
            alt="Mascot Gino đang học tiếng Nhật"
          />
          <div className="landing-floating-badge landing-streak-badge">
            <small>NHỊP HỌC</small>
            <strong>☀️ Mỗi ngày</strong>
          </div>
          <div className="landing-floating-badge landing-xp-badge">
            <small>TIẾN ĐỘ</small>
            <strong>🔒 Riêng tư</strong>
          </div>
        </div>
      </section>

      <main id="landing-main">
        <section className="landing-methods" aria-labelledby="methods-title">
          <div className="landing-section-inner">
            <p className="landing-section-kicker">Lộ trình Tokutei</p>
            <h2 id="methods-title">Học đúng thứ cần cho Tokutei</h2>
            <p className="landing-section-intro">
              Từ nền tiếng Nhật đến JFT-Basic, giao tiếp hiện trường và phỏng vấn — mọi thứ đi theo một lộ trình rõ ràng.
            </p>

            <div className="landing-method-grid">
              {methods.map(({ icon: Icon, title, desc }, index) => (
                <article className="landing-method gino-hover-lift" key={title}>
                  <div className="landing-method-topline">
                    <span className="landing-method-icon">
                      <Icon size={19} aria-hidden="true" focusable="false" />
                    </span>
                    <span className="landing-method-index">0{index + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta" aria-labelledby="cta-title">
          <div className="landing-section-inner">
            <Sparkles size={18} aria-hidden="true" focusable="false" />
            <h2 id="cta-title">Bắt đầu lộ trình Tokutei</h2>
            <p>Ôn tiếng Nhật, luyện JFT và chuẩn bị phỏng vấn trong một chỗ.</p>
            <Link className="landing-primary-button" to="/login">
              Bắt đầu học <ArrowRight size={16} aria-hidden="true" focusable="false" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>
          <BookOpen size={15} aria-hidden="true" focusable="false" /> TOKUTEI GINO © 2026
        </span>
        <nav aria-label="Liên kết cuối trang">
          <Link to="/terms">Điều khoản</Link>
          <Link to="/privacy">Bảo mật</Link>
          <Link to="/login">Đăng nhập</Link>
        </nav>
      </footer>
    </div>
  );
}
