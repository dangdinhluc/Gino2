import { assets } from '@/src/shared/lib/assets';
import type { CourseWorkspaceSection } from '@/src/features/courses/lib/courseWorkspaceNavigation';

interface MascotLoadingModeConfig {
  image: string;
  message: string;
}

const modeConfig: Record<CourseWorkspaceSection, MascotLoadingModeConfig> = {
  vocabulary: {
    image: assets.vocabulary.mascot,
    message: 'Đang chuẩn bị từ vựng…',
  },
  documents: {
    image: assets.shared.mascots.readingBook,
    message: 'Đang chuẩn bị tài liệu…',
  },
  practice: {
    image: assets.shared.mascots.practicePencil,
    message: 'Đang chuẩn bị câu hỏi…',
  },
  games: {
    image: assets.games.mascot,
    message: 'Đang tải trò chơi…',
  },
  exams: {
    image: assets.exams.mascot,
    message: 'Đang chuẩn bị đề thi…',
  },
};

export function MascotLoadingCompanion({
  mode,
  visible,
  message,
}: {
  mode: CourseWorkspaceSection;
  visible: boolean;
  message?: string;
}) {
  const config = modeConfig[mode];

  return (
    <div
      aria-hidden={!visible}
      className={`gino2-mascot-loading gino2-mascot-loading--${mode}`}
      data-visible={visible}
    >
      <div className="gino2-mascot-loading__content">
        <img
          src={config.image}
          alt=""
          aria-hidden="true"
          className="gino2-mascot-loading__image"
          decoding="async"
          loading="lazy"
        />
        {visible && (
          <p role="status" aria-live="polite" className="gino2-mascot-loading__message">
            {message ?? config.message}
          </p>
        )}
      </div>
    </div>
  );
}
