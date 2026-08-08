import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Bell,
  Check,
  ChevronRight,
  Database,
  Globe,
  Moon,
  Palette,
  RotateCcw,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Volume2,
  Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { APP_BACKGROUNDS, useAppTheme } from '@/src/app/theme/AppThemeProvider';
import { assetPath } from '@/src/shared/lib/assets';

export default function SettingsPage() {
  const { background, setBackground } = useAppTheme();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    dailyReminder: true,
    srsPriority: true,
    autoSpeakVocab: true,
    autoSpeakExample: false,
    floatingAiBubble: true,
    conciseAiFeedback: true,
    showStreakBadges: true,
    soundEffects: true,
  });

  const [cacheCleared, setCacheCleared] = useState(false);

  const toggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-4 pb-24 md:py-6">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-6 shadow-[0_12px_36px_rgba(217,74,19,0.06)] md:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/10 blur-2xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#d83a00] shadow-2xs">
              <Settings size={13} className="text-orange-500" />
              <span>CÀI ĐẶT ỨNG DỤNG</span>
            </div>

            <h1 className="font-[var(--font-heading)] text-2xl font-black text-[#0f172a] md:text-3xl">
              Cài đặt & Tùy chọn học tập
            </h1>

            <p className="max-w-xl text-xs font-semibold leading-relaxed text-[#5f6b7c] md:text-sm">
              Tùy chỉnh không khí học tập, chế độ tự động đọc, nhắc nhở SRS và trợ lý AI để có trải nghiệm học Tokutei hoàn hảo nhất.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/terms"
              className="flex items-center gap-1.5 rounded-2xl border border-[#eee3d5] bg-white px-4 py-2.5 text-xs font-bold text-[#5f6b7c] shadow-2xs transition-all hover:bg-slate-50 hover:text-[#0f172a]"
            >
              <Shield size={14} className="text-slate-400" />
              <span>Điều khoản</span>
            </Link>
            <Link
              to="/privacy"
              className="flex items-center gap-1.5 rounded-2xl border border-[#eee3d5] bg-white px-4 py-2.5 text-xs font-bold text-[#5f6b7c] shadow-2xs transition-all hover:bg-slate-50 hover:text-[#0f172a]"
            >
              <Globe size={14} className="text-slate-400" />
              <span>Bảo mật</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Theme Background Selector */}
      <section className="rounded-[28px] border border-[#f5ece1] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#f5ece1] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#d83a00] border border-orange-200/60">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">
                Nền ứng dụng & Không khí học
              </h2>
              <p className="text-xs font-semibold text-[#717d8f]">
                Chọn giao diện nền phù hợp với thời gian và không gian học của anh.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black text-[#d83a00] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/50 self-start sm:self-auto">
            ✨ Tự động lưu
          </span>
        </div>

        <div className="grid gap-3.5 md:grid-cols-3" role="radiogroup" aria-label="Chọn nền ứng dụng">
          {APP_BACKGROUNDS.map((option) => {
            const isSelected = background === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setBackground(option.id)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 active:scale-98',
                  isSelected
                    ? 'border-[#d83a00] bg-gradient-to-br from-[#fff9f3] to-[#ffeedd] shadow-md ring-2 ring-[#d83a00]'
                    : 'border-[#eee3d5] bg-white hover:border-orange-200 hover:bg-[#fffcf9]'
                )}
              >
                {/* Preview Image Container */}
                <div
                  className="relative h-24 w-full overflow-hidden rounded-xl border border-black/10 shadow-2xs"
                  style={{ background: option.preview }}
                >
                  {option.id === 'cherry-blossom' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <span className="text-2xl drop-shadow-md">🌸 🗻</span>
                    </div>
                  )}
                  {option.id === 'paper-light' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-orange-50/20">
                      <Sun size={24} className="text-amber-500/80 drop-shadow-2xs" />
                    </div>
                  )}
                  {option.id === 'quiet-night' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Moon size={24} className="text-indigo-300 drop-shadow-2xs" />
                    </div>
                  )}
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#d83a00] text-white shadow-md">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-0.5">
                  <span className={cn('block font-black text-sm', isSelected ? 'text-[#d83a00]' : 'text-[#0f172a]')}>
                    {option.label}
                  </span>
                  <span className="block text-xs font-semibold text-[#717d8f] line-clamp-2">
                    {option.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Settings Categories (Grid 2 columns) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Column 1: Âm thanh & Flashcard SRS */}
        <section className="rounded-[28px] border border-[#f5ece1] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f5ece1] pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#d83a00] border border-orange-200/60">
              <Volume2 size={18} />
            </div>
            <div>
              <h2 className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">
                Âm thanh & Flashcards SRS
              </h2>
              <p className="text-xs font-semibold text-[#717d8f]">Chế độ phát âm và lật thẻ tự động</p>
            </div>
          </div>

          <div className="space-y-3">
            <SettingSwitch
              icon={Volume2}
              title="Tự động phát âm từ vựng"
              subtitle="Phát âm giọng Nhật chuẩn ngay khi mở thẻ mới"
              checked={toggles.autoSpeakVocab}
              onChange={() => toggle('autoSpeakVocab')}
            />

            <SettingSwitch
              icon={Sparkles}
              title="Đọc câu ví dụ mẫu"
              subtitle="Tự động đọc ví dụ sử dụng sau khi lật xem đáp án"
              checked={toggles.autoSpeakExample}
              onChange={() => toggle('autoSpeakExample')}
            />

            <SettingSwitch
              icon={Zap}
              title="Ưu tiên thẻ sắp quên (SRS)"
              subtitle="Đưa các câu hỏi phỏng vấn & từ vựng khó lên đầu danh sách"
              checked={toggles.srsPriority}
              onChange={() => toggle('srsPriority')}
            />

            <SettingSwitch
              icon={Bell}
              title="Nhắc nhở học tập mỗi ngày"
              subtitle="Hiện nhắc nhở khi chưa hoàn thành chỉ tiêu XP hôm nay"
              checked={toggles.dailyReminder}
              onChange={() => toggle('dailyReminder')}
            />
          </div>
        </section>

        {/* Column 2: Trợ lý AI & Giao diện */}
        <section className="rounded-[28px] border border-[#f5ece1] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f5ece1] pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#d83a00] border border-orange-200/60">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">
                Trợ lý AI & Hiển thị
              </h2>
              <p className="text-xs font-semibold text-[#717d8f]">Tùy chọn tương tác AI Chat & Bảng điểm</p>
            </div>
          </div>

          <div className="space-y-3">
            <SettingSwitch
              icon={Sparkles}
              title="Nút Mèo Tanuki AI Chat nổi"
              subtitle="Hiển thị nút bấm AI Chat nổi lơ lửng góc dưới màn hình"
              checked={toggles.floatingAiBubble}
              onChange={() => toggle('floatingAiBubble')}
            />

            <SettingSwitch
              icon={Zap}
              title="Phản hồi AI ngắn gọn"
              subtitle="Giới hạn câu trả lời của AI ở dạng súc tích, dễ nhớ"
              checked={toggles.conciseAiFeedback}
              onChange={() => toggle('conciseAiFeedback')}
            />

            <SettingSwitch
              icon={Sparkles}
              title="Bảng điểm Streak & XP"
              subtitle="Hiện chuỗi ngày streak và điểm XP trên header trang chủ"
              checked={toggles.showStreakBadges}
              onChange={() => toggle('showStreakBadges')}
            />

            <SettingSwitch
              icon={Volume2}
              title="Hiệu ứng âm thanh (SFX)"
              subtitle="Phát âm thanh chúc mừng khi hoàn thành bài luyện tập"
              checked={toggles.soundEffects}
              onChange={() => toggle('soundEffects')}
            />
          </div>
        </section>
      </div>

      {/* 4. Account & Storage Section */}
      <section className="rounded-[28px] border border-[#f5ece1] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#f5ece1] pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#d83a00] border border-orange-200/60">
            <Database size={18} />
          </div>
          <div>
            <h2 className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">
              Bộ nhớ tạm & Thông tin ứng dụng
            </h2>
            <p className="text-xs font-semibold text-[#717d8f]">Quản lý dữ liệu lưu trữ local và phiên bản</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#f5ece1] bg-[#fffcf9] p-4">
            <div className="space-y-0.5">
              <span className="block font-black text-sm text-[#0f172a]">Xóa bộ nhớ đệm (Cache)</span>
              <span className="block text-xs font-semibold text-[#717d8f]">Giải phóng dung lượng tạm trên thiết bị</span>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-black text-[#d83a00] hover:bg-orange-100 active:scale-95 transition-all"
            >
              <RotateCcw size={14} className={cacheCleared ? 'animate-spin' : ''} />
              <span>{cacheCleared ? 'Đã xóa!' : 'Xóa đệm'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#f5ece1] bg-[#fffcf9] p-4">
            <div className="space-y-0.5">
              <span className="block font-black text-sm text-[#0f172a]">Phiên bản ứng dụng</span>
              <span className="block text-xs font-semibold text-[#717d8f]">Tokutei Gino v4.0.2 Production</span>
            </div>
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-black text-[#059669]">
              Mới nhất
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

interface SettingSwitchProps {
  icon: typeof Volume2;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: () => void;
}

function SettingSwitch({ icon: Icon, title, subtitle, checked, onChange }: SettingSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#f5ece1] bg-[#fffcf9] p-3.5 text-left transition-all duration-200 hover:border-orange-200"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
          checked ? 'bg-orange-50 text-[#d83a00] border border-orange-200/60' : 'bg-slate-100 text-slate-400'
        )}>
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-black text-xs text-[#0f172a] sm:text-sm">{title}</span>
          <span className="block truncate text-[11px] font-semibold text-[#717d8f]">{subtitle}</span>
        </div>
      </div>

      <div
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 ease-in-out',
          checked ? 'bg-[#d83a00]' : 'bg-slate-200'
        )}
      >
        <span
          className={cn(
            'block h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </div>
    </button>
  );
}
