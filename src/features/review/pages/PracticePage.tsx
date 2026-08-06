import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/src/features/courses/store/progressStore';

import { PracticeHero } from '@/src/features/practice/components/PracticeHero';
import { ContinuePracticeCard } from '@/src/features/practice/components/ContinuePracticeCard';
import { PracticeStats } from '@/src/features/practice/components/PracticeStats';
import { PracticeCategoryFilters } from '@/src/features/practice/components/PracticeCategoryFilters';
import {
  PracticeListItemRow,
  type PracticeItemData,
} from '@/src/features/practice/components/PracticeListItemRow';
import { RecentPracticeResults } from '@/src/features/practice/components/RecentPracticeResults';
import { FloatingAudioButton } from '@/src/features/games/components/FloatingAudioButton';

export interface PracticeSection {
  id: string;
  label: string;
  count: number;
}

interface PracticePageProps {
  embedded?: boolean;
  courseSections?: PracticeSection[];
}

const mockPracticeItems: PracticeItemData[] = [
  {
    id: 'p1',
    title: 'Từ vựng Workplace cơ bản',
    type: 'vocab',
    typeLabel: 'Từ vựng',
    questionCount: 20,
    estimatedMinutes: 8,
    difficulty: 'Dễ',
    status: 'not_started',
    path: '/app/review/flashcards?mode=cram&section=vocab-workplace',
  },
  {
    id: 'p2',
    title: 'Nghe hiểu chỉ dẫn tại nơi làm việc',
    type: 'listening',
    typeLabel: 'Nghe hiểu',
    questionCount: 10,
    estimatedMinutes: 6,
    difficulty: 'Trung bình',
    status: 'in_progress',
    progressPercent: 60,
    path: '/app/exams',
  },
  {
    id: 'p3',
    title: 'Phản xạ phỏng vấn Tokutei',
    type: 'situation',
    typeLabel: 'Tình huống',
    questionCount: 15,
    estimatedMinutes: 10,
    difficulty: 'Khó',
    status: 'completed',
    scorePercent: 88,
    path: '/app/review/flashcards?mode=cram&section=interview-reaction',
  },
  {
    id: 'p4',
    title: 'Ngữ pháp chỉ thị ~ていただく',
    type: 'grammar',
    typeLabel: 'Ngữ pháp',
    questionCount: 12,
    estimatedMinutes: 7,
    difficulty: 'Trung bình',
    status: 'not_started',
    path: '/app/review/flashcards?mode=cram&section=grammar-directives',
  },
];

export default function PracticePage({ embedded = false }: PracticePageProps) {
  const navigate = useNavigate();
  const streak = useProgressStore((state) => state.streak);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => [
    { id: 'all', label: 'Tất cả', count: 8 },
    { id: 'vocab', label: 'Từ vựng', count: 3 },
    { id: 'grammar', label: 'Ngữ pháp', count: 2 },
    { id: 'listening', label: 'Nghe hiểu', count: 1 },
    { id: 'situation', label: 'Tình huống', count: 2 },
  ], []);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return mockPracticeItems;
    return mockPracticeItems.filter((item) => item.type === selectedCategory);
  }, [selectedCategory]);

  const handleAction = (item: PracticeItemData) => {
    navigate(item.path);
  };

  const handleContinueCurrent = (id: string) => {
    navigate(`/app/review/flashcards?mode=cram&session=${id}`);
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 pb-28 sm:pb-32">
      {/* 1. Hero Banner */}
      <PracticeHero />

      {/* 2. Card "TIẾP TỤC LUYỆN TẬP" */}
      <ContinuePracticeCard onContinue={handleContinueCurrent} />

      {/* 3. Thống kê nhanh */}
      <PracticeStats
        stats={{
          completedCount: 12,
          accuracyPercent: 86,
          streakDays: streak || 5,
        }}
      />

      {/* 4. Bộ lọc loại bài */}
      <PracticeCategoryFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 5. Danh sách bài luyện tập */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <PracticeListItemRow key={item.id} item={item} onAction={handleAction} />
        ))}
      </div>

      {/* 6. Kết quả gần đây */}
      <RecentPracticeResults
        onReplay={(id) => navigate(`/app/review/flashcards?mode=cram&replay=${id}`)}
        onViewAll={() => navigate('/app/exams')}
      />

      {/* 7. Floating audio/support button */}
      <FloatingAudioButton />
    </div>
  );
}
