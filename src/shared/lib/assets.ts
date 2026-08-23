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

// Native 3D Assets & Layers from PSD (src/img/anh)
import fujiLandscapeBanner from '@/src/img/anh/Lớp_1.png';
import headerMascotWaving from '@/src/img/anh/Lớp_30.png';
import mascotReadingGino from '@/src/img/anh/Lớp_29.png';
import mascotWriting from '@/src/img/anh/Lớp_28.png';
import mascotLaptop from '@/src/img/anh/Lớp_27.png';
import mascotCelebrate from '@/src/img/anh/Lớp_26.png';
import pagodaLandscape from '@/src/img/anh/Lớp_25.png';
import mascotFaceWinking from '@/src/img/anh/Lớp_24.png';
import mascotFaceSmiling from '@/src/img/anh/Lớp_23.png';
import chestGold from '@/src/img/anh/Lớp_19.png';
import xpStar from '@/src/img/anh/Lớp_18.png';
import flameStreak from '@/src/img/anh/Lớp_17.png';
import calendarPaw from '@/src/img/anh/Lớp_16.png';
import pawPrint from '@/src/img/anh/Lớp_14.png';
import lightbulb3D from '@/src/img/anh/Lớp_10.png';
import trophyGold from '@/src/img/anh/Lớp_9.png';
import gamepadPurple from '@/src/img/anh/Lớp_7.png';
import openBookFlower from '@/src/img/anh/Lớp_5.png';
import bookStackNihongo from '@/src/img/anh/Lớp_4.png';
import speechBanner from '@/src/img/anh/Lớp_3.png';

const assetBaseUrl = import.meta.env?.BASE_URL ?? '/';

export const assetPath = (path: string) => `${assetBaseUrl}${path.replace(/^\/+/, '')}`;

const asset = (path: string) => assetPath(`assets/${path}`);

export const assets = {
  shared: {
    backgrounds: {
      dashboardLibrary: asset('shared/backgrounds/dashboard-library-background.webp'),
      englishHero: asset('shared/backgrounds/english-hero-background.jpg'),
      fujiLandscape: fujiLandscapeBanner,
      pagodaLandscape,
    },
    mascots: {
      aiTutorTanuki: asset('shared/mascots/ai-tutor-tanuki.webp'),
      brand: asset('shared/mascots/brand-mascot.webp'),
      meow: asset('shared/mascots/meow-mascot.webp'),
      quickLearn: hocnhanhIcon,
      quickLearnActive: mascotActiveRingIcon,
      tanukiWaving: tanukiWavingIcon,
      headerWaving: headerMascotWaving,
      faceWinking: mascotFaceWinking,
      faceSmiling: mascotFaceSmiling,
      writing: mascotWriting,
      reading: mascotReadingGino,
      laptop: mascotLaptop,
      celebrate: mascotCelebrate,
      speechBubble: speechBubbleIcon,
      speechBanner,
      lightbulb: lightbulb3D,
      pawPrint,
      sleepingMeow: asset('shared/mascots/sleeping-meow-mascot.webp'),
    },
    dashboard: {
      chestGold,
      xpStar,
      flameStreak,
      calendarPaw,
      trophy: trophyGold,
      gamepad: gamepadPurple,
      bookStack: bookStackNihongo,
      openBook: openBookFlower,
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
