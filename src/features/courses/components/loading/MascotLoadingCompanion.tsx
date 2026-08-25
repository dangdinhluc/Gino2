import { assets } from '@/src/shared/lib/assets';
import type { CourseWorkspaceSection } from '@/src/features/courses/lib/courseWorkspaceNavigation';

interface MascotLoadingModeConfig {
  image: string;
  message: string;
}

const modeConfig: Record<CourseWorkspaceSection, MascotLoadingModeConfig> = {
  vocabulary: {
    image: assets.loading.vocabulary,
    message: 'Đang chuẩn bị từ vựng…',
  },
  documents: {
    image: assets.loading.documents,
    message: 'Đang chuẩn bị tài liệu…',
  },
  practice: {
    image: assets.loading.practice,
    message: 'Đang chuẩn bị bài luyện…',
  },
  games: {
    image: assets.loading.games,
    message: 'Đang khởi động trò chơi…',
  },
  exams: {
    image: assets.loading.exams,
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
          width={512}
          height={512}
          decoding="async"
          loading="eager"
        />
        <p role="status" aria-live="polite" className="gino2-mascot-loading__message" aria-hidden={!visible}>
          {message ?? config.message}
        </p>
      </div>
    </div>
  );
}
