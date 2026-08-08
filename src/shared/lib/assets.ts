const assetBaseUrl = import.meta.env?.BASE_URL ?? '/';

export const assetPath = (path: string) => `${assetBaseUrl}${path.replace(/^\/+/, '')}`;

const asset = (path: string) => assetPath(`assets/${path}`);

export const assets = {
  shared: {
    backgrounds: {
      dashboardLibrary: asset('shared/backgrounds/dashboard-library-background.png'),
      englishHero: asset('shared/backgrounds/english-hero-background.jpg'),
    },
    mascots: {
      aiTutorTanuki: asset('shared/mascots/ai-tutor-tanuki.png'),
      brand: asset('shared/mascots/brand-mascot.png'),
      meow: asset('shared/mascots/meow-mascot.png'),
      sleepingMeow: asset('shared/mascots/sleeping-meow-mascot.png'),
    },
    navigation: {
      courses: asset('shared/navigation/courses.png'),
      exams: asset('shared/navigation/exams.png'),
      home: asset('shared/navigation/home.png'),
      profile: asset('shared/navigation/profile.png'),
      vocabulary: asset('shared/navigation/vocabulary.png'),
    },
  },
  courses: {
    workspace: {
      documents: asset('courses/workspace/documents.png'),
      exam: asset('courses/workspace/exam.png'),
      games: asset('courses/workspace/game.png'),
      practice: asset('courses/workspace/practice.png'),
      vocabulary: asset('courses/workspace/vocabulary.png'),
    },
  },
  practice: {
    icons: {
      badgeOrangeAa: asset('practice/icons/badge-orange-aa.webp'),
      completed: asset('practice/icons/completed.webp'),
      flashcards: asset('practice/icons/flashcards.webp'),
      goal: asset('practice/icons/goal.webp'),
      heroWorkbook: asset('practice/icons/hero-workbook.webp'),
      listening: asset('practice/icons/listening.webp'),
      streak: asset('practice/icons/streak.webp'),
      vocabularyBook: asset('practice/icons/vocabulary-book.webp'),
      worksheetQuiz: asset('practice/icons/worksheet-quiz.webp'),
    },
  },
  games: {
    giftBox: asset('games/gift-box.png'),
    mascot: asset('games/game-tanuki.png'),
    icons: {
      calendar: asset('games/icons/calendar.png'),
      chart: asset('games/icons/chart.png'),
      gamepad: asset('games/icons/gamepad.png'),
      trophy: asset('games/icons/trophy.png'),
    },
    thumbnails: {
      flappy: asset('games/thumbnails/flappy.png'),
      situation: asset('games/thumbnails/situation.png'),
      sprint: asset('games/thumbnails/sprint.png'),
    },
  },
  exams: {
    mascot: asset('exams/tanuki.png'),
  },
  documents: {
    mascot: asset('documents/tanuki.png'),
  },
  vocabulary: {
    mascot: asset('vocabulary/tanuki.png'),
  },
} as const;
