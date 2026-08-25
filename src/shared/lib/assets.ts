const assetBaseUrl = import.meta.env?.BASE_URL ?? '/';

export const assetPath = (path: string) => `${assetBaseUrl}${path.replace(/^\/+/, '')}`;

const asset = (path: string) => assetPath(`assets/${path}`);
const appImage = (name: string) => asset(`app-images/${name}`);

export const assets = {
  shared: {
    backgrounds: {
      dashboardLibrary: appImage('background-dashboard-library.webp'),
      englishHero: appImage('background-english-hero.webp'),
      fujiLandscape: appImage('background-fuji-landscape.webp'),
      fujiScene: appImage('background-fuji-scene.webp'),
    },
    mascots: {
      aiTutorTanuki: appImage('mascot-ai-tutor-tanuki.webp'),
      brand: appImage('mascot-brand.webp'),
      meow: appImage('mascot-meow.webp'),
      quickLearn: appImage('quick-learn.webp'),
      quickLearnActive: appImage('mascot-quick-learn-active.webp'),
      tanukiWaving: appImage('mascot-tanuki-waving.webp'),
      headerWaving: appImage('mascot-hero-wave.webp'),
      readingBook: appImage('mascot-reading-book.webp'),
      vocabWriting: appImage('mascot-vocab-writing.webp'),
      practicePencil: appImage('mascot-practice-pencil.webp'),
      nextLessonN5: appImage('mascot-next-lesson-n5.webp'),
      backpack: appImage('mascot-backpack.webp'),
      sleep: appImage('mascot-sleep.webp'),
      faceWinking: appImage('mascot-face-winking.webp'),
      speechBubble: appImage('speech-bubble.webp'),
      speechBanner: appImage('speech-study-together.webp'),
      courseLauncherBanner: appImage('course-launcher-banner.webp'),
      lightbulb: appImage('mascot-lightbulb.webp'),
      sleepingMeow: appImage('mascot-sleeping-meow.webp'),
    },
    dashboard: {
      chestGold: appImage('dashboard-chest-gold.webp'),
      xpStar: appImage('dashboard-xp-star.webp'),
      flameStreak: appImage('dashboard-flame-streak.webp'),
      badgeStreak: appImage('dashboard-badge-streak.webp'),
      badgeReward30xp: appImage('dashboard-badge-reward.webp'),
      studyTimer: appImage('dashboard-study-timer.webp'),
      bookStack: appImage('dashboard-book-stack.webp'),
      checklist: appImage('dashboard-checklist.webp'),
      openBook: appImage('dashboard-open-book.webp'),
      passSign: appImage('dashboard-pass-sign.webp'),
      trophy: appImage('dashboard-trophy.webp'),
    },
    navigation: {
      courses: appImage('navigation-courses.webp'),
      exams: appImage('navigation-exams.webp'),
      home: appImage('navigation-home.webp'),
      practice: appImage('navigation-practice.webp'),
      profile: appImage('navigation-profile.webp'),
      vocabulary: appImage('course-mode-vocabulary.webp'),
    },
  },
  courses: {
    workspace: {
      documents: appImage('course-mode-documents.webp'),
      exam: appImage('navigation-exams.webp'),
      games: appImage('course-mode-game.webp'),
      practice: appImage('course-mode-practice.webp'),
      vocabulary: appImage('course-mode-vocabulary.webp'),
    },
  },
  practice: {
    icons: {
      badgeOrangeAa: appImage('practice-badge-orange-aa.webp'),
      completed: appImage('practice-completed.webp'),
      flashcards: appImage('practice-flashcards.webp'),
      goal: appImage('practice-goal.webp'),
      heroWorkbook: appImage('practice-hero-workbook.webp'),
      listening: appImage('practice-listening.webp'),
      streak: appImage('practice-streak.webp'),
      vocabularyBook: appImage('practice-vocabulary-book.webp'),
      worksheetQuiz: appImage('practice-worksheet-quiz.webp'),
    },
  },
  games: {
    giftBox: appImage('game-gift-box.webp'),
    mascot: appImage('game-tanuki.webp'),
    icons: {
      calendar: appImage('game-calendar.webp'),
      chart: appImage('game-chart.webp'),
      gamepad: appImage('game-gamepad.webp'),
      trophy: appImage('game-trophy.webp'),
    },
    thumbnails: {
      flappy: appImage('game-flappy.webp'),
      situation: appImage('game-situation.webp'),
      sprint: appImage('game-sprint.webp'),
    },
  },
  exams: {
    mascot: appImage('exam-tanuki.webp'),
  },
  documents: {
    mascot: appImage('document-tanuki.webp'),
  },
  vocabulary: {
    mascot: appImage('vocabulary-tanuki.webp'),
  },
  loading: {
    vocabulary: asset('loading/vocabulary.webp'),
    documents: asset('loading/documents.webp'),
    practice: asset('loading/practice.webp'),
    games: asset('loading/games.webp'),
    exams: asset('loading/exams.webp'),
  },
} as const;
