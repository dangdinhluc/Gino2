import canhanIcon from '@/src/img/canhan.png';
import cupIcon from '@/src/img/cup.png';
import gameIcon from '@/src/img/game.png';
import hocnhanhIcon from '@/src/img/hocnhanh.png';
import hoctapIcon from '@/src/img/hoctap.png';
import homeIcon from '@/src/img/home.png';
import khoahocIcon from '@/src/img/khoahoc.png';
import luyentapIcon from '@/src/img/luyentap.png';
import ontapIcon from '@/src/img/ontap.png';
import tailieuIcon from '@/src/img/tailieu.png';

const assetBaseUrl = import.meta.env?.BASE_URL ?? '/';

export const assetPath = (path: string) => `${assetBaseUrl}${path.replace(/^\/+/, '')}`;

const asset = (path: string) => assetPath(`assets/${path}`);

export const assets = {
  shared: {
    backgrounds: {
      dashboardLibrary: asset('shared/backgrounds/dashboard-library-background.webp'),
      englishHero: asset('shared/backgrounds/english-hero-background.jpg'),
    },
    mascots: {
      aiTutorTanuki: asset('shared/mascots/ai-tutor-tanuki.webp'),
      brand: asset('shared/mascots/brand-mascot.webp'),
      meow: asset('shared/mascots/meow-mascot.webp'),
      quickLearn: hocnhanhIcon,
      sleepingMeow: asset('shared/mascots/sleeping-meow-mascot.webp'),
    },
    navigation: {
      courses: khoahocIcon,
      exams: cupIcon,
      home: homeIcon,
      practice: luyentapIcon,
      profile: canhanIcon,
      vocabulary: ontapIcon,
    },
  },
  courses: {
    workspace: {
      documents: tailieuIcon,
      exam: cupIcon,
      games: gameIcon,
      practice: hoctapIcon,
      vocabulary: ontapIcon,
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
    giftBox: asset('games/gift-box.webp'),
    mascot: asset('games/game-tanuki.webp'),
    icons: {
      calendar: asset('games/icons/calendar.png'),
      chart: asset('games/icons/chart.png'),
      gamepad: asset('games/icons/gamepad.png'),
      trophy: asset('games/icons/trophy.png'),
    },
    thumbnails: {
      flappy: asset('games/thumbnails/flappy.webp'),
      situation: asset('games/thumbnails/situation.webp'),
      sprint: asset('games/thumbnails/sprint.webp'),
    },
  },
  exams: {
    mascot: asset('exams/tanuki.webp'),
  },
  documents: {
    mascot: asset('documents/tanuki.webp'),
  },
  vocabulary: {
    mascot: asset('vocabulary/tanuki.webp'),
  },
} as const;
