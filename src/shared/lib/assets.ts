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
import meoIcon from '@/src/img/meo.png';
import tanukiWavingIcon from '@/src/img/tanuki_waving.png';
import mascotActiveRingIcon from '@/src/img/mascot_active_ring.png';
import speechBubbleIcon from '@/src/img/speech_bubble.png';

// Native 3D Assets & Layers from PSD (src/img/ICON & src/img/anh)
import mascotHeroWave from '@/src/img/ICON/01-mascot-hero-wave.png';
import mascotReadingBook from '@/src/img/ICON/02-mascot-reading-book.png';
import mascotVocabWriting from '@/src/img/ICON/03-mascot-vocab-writing.png';
import mascotPracticePencil from '@/src/img/ICON/04-mascot-practice-pencil.png';
import mascotNextLessonN5 from '@/src/img/ICON/05-mascot-next-lesson-n5.png';
import mascotBackpack from '@/src/img/ICON/06-mascot-backpack.png';
import iconJapaneseBooks from '@/src/img/ICON/07-icon-japanese-books.png';
import iconChecklist from '@/src/img/ICON/08-icon-checklist.png';
import iconOpenBook from '@/src/img/ICON/09-icon-open-book.png';
import iconPassSign from '@/src/img/ICON/10-icon-pass-sign.png';
import sceneJapanFujiTorii from '@/src/img/ICON/11-scene-japan-fuji-torii.png';
import iconStudyTimer from '@/src/img/ICON/15-icon-study-timer.png';
import iconXpStar from '@/src/img/ICON/16-icon-xp-star.png';
import badgeStreak12 from '@/src/img/ICON/18-badge-streak-12.png';
import badgeReward30xp from '@/src/img/ICON/19-badge-reward-30xp.png';
import trophyAchievement from '@/src/img/ICON/20-trophy-achievement.png';
import speechStudyTogether from '@/src/img/ICON/21-speech-study-together.png';
import mascotQuickLearnActive from '@/src/img/ICON/22-mascot-quick-learn-active.png';
import mascotSleep from '@/src/img/ICON/23-mascot-sleep.png';
import courseLauncherBanner from '@/src/img/ICON/Lớp_3.png';

// Legacy / Alternative layers from src/img/anh
import fujiLandscapeBanner from '@/src/img/anh/Lớp_1.png';
import mascotFaceWinking from '@/src/img/anh/Lớp_24.png';
import chestGold from '@/src/img/anh/Lớp_19.png';
import flameStreak from '@/src/img/anh/Lớp_17.png';

const assetBaseUrl = import.meta.env?.BASE_URL ?? '/';

export const assetPath = (path: string) => `${assetBaseUrl}${path.replace(/^\/+/, '')}`;

const asset = (path: string) => assetPath(`assets/${path}`);

export const assets = {
  shared: {
    backgrounds: {
      dashboardLibrary: asset('shared/backgrounds/dashboard-library-background.webp'),
      englishHero: asset('shared/backgrounds/english-hero-background.jpg'),
      fujiLandscape: fujiLandscapeBanner,
      fujiScene: sceneJapanFujiTorii,
    },
    mascots: {
      aiTutorTanuki: asset('shared/mascots/ai-tutor-tanuki.webp'),
      brand: asset('shared/mascots/brand-mascot.webp'),
      meow: asset('shared/mascots/meow-mascot.webp'),
      quickLearn: hocnhanhIcon,
      quickLearnActive: mascotQuickLearnActive,
      tanukiWaving: tanukiWavingIcon,
      headerWaving: mascotHeroWave,
      readingBook: mascotReadingBook,
      vocabWriting: mascotVocabWriting,
      practicePencil: mascotPracticePencil,
      nextLessonN5: mascotNextLessonN5,
      backpack: mascotBackpack,
      sleep: mascotSleep,
      faceWinking: mascotFaceWinking,
      speechBubble: speechBubbleIcon,
      speechBanner: speechStudyTogether,
      courseLauncherBanner,
      lightbulb: meoIcon,
      sleepingMeow: asset('shared/mascots/sleeping-meow-mascot.webp'),
    },
    dashboard: {
      chestGold,
      xpStar: iconXpStar,
      flameStreak,
      badgeStreak: badgeStreak12,
      badgeReward30xp,
      studyTimer: iconStudyTimer,
      bookStack: iconJapaneseBooks,
      checklist: iconChecklist,
      openBook: iconOpenBook,
      passSign: iconPassSign,
      trophy: trophyAchievement,
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
