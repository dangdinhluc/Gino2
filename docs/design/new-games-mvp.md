# DESIGN: New Engagement Games MVP

Ngày tạo: 2026-05-17  
Plan: `plans/2026-05-17-new-games-engagement/awf-plan.md`  
Spec: `docs/specs/new-games-engagement.md`  
Scope: **MVP — Memory Match + Word Builder** (Listening Lab + Story Quest đẩy sang Future Phase)

> ⚠️ Cập nhật 2026-07-11: Vocab thật đã đổi từ tiếng Đức sang tiếng Nhật romaji (Tokutei Ginou). Field `article` (der/die/das) và `isUmlaut`/Umlaut chip đã bị xóa khỏi implementation thật (`types.ts`, `WordBuilder.tsx`, `builderData.ts`) vì không có khái niệm tương đương trong tiếng Nhật. Các đoạn dưới đây còn nhắc Umlaut/article là tài liệu lịch sử (đã lỗi thời so với code), giữ lại để hiểu bối cảnh thiết kế ban đầu — không dùng làm spec thi công mới.

---

## 0. Mục tiêu thiết kế

Plan đã chốt: thêm 2 game mới đa dạng cơ chế (trí nhớ trực quan + xếp chữ romaji), reuse `GameShell` + `gameStore` + `courseGameStore` pattern hiện tại.

Document này biến plan/spec thành bản thiết kế cụ thể: data shape, component props, state machine, animation timing, acceptance criteria, test outline — đủ chi tiết để `/awf-code` cầm là chạy được, không cần đoán.

Nguyên tắc:
- **Reuse > Build**: bám sát pattern của VocabSprint/SituationGame (cùng GameShell, cùng gameStore lifecycle)
- **Mock-first**: data nằm trong TS file, generator nhận `CourseVocabularyItem[]` từ courseGameStore (giống `fromCourseVocab.ts` hiện tại)
- **No new deps**: dùng `motion`, `lucide-react`, `tailwind`, `zustand` đã có
- **A11y day-1**: keyboard nav + focus ring + aria-label, honor `prefers-reduced-motion`

---

## 1. Reference

| Item | Path |
|------|------|
| Plan | `plans/2026-05-17-new-games-engagement/awf-plan.md` |
| Spec | `docs/specs/new-games-engagement.md` |
| Existing GameShell | `src/features/games/GameShell.tsx` |
| Existing gameStore | `src/features/games/gameStore.ts` |
| Existing courseGameStore | `src/features/games/courseGameStore.ts` |
| Existing GameResult | `src/features/games/GameResult.tsx` |
| Existing useGameSession hook | `src/features/games/useGameSession.ts` |
| Existing generator pattern | `src/features/games/generators/fromCourseVocab.ts` |
| Existing progressStore (SRS + XP) | `src/features/courses/store/progressStore.ts` |
| Hub page | `src/features/hub/pages/LearningHubPage.tsx` |
| Game route | `src/app/router/game-routes.tsx` |
| GameScreen normalizer | `src/features/games/GameScreen.tsx` |

---

## 2. Data Model

### 2.0 Mở rộng `gameStore` API (revise từ AI challenge P1-3)

`gameStore` hiện không có cách trừ điểm. Word Builder hint cần API riêng. Bổ sung:

```ts
// src/features/games/gameStore.ts (mở rộng interface GameState)

interface GameState {
  // ... fields hiện có
  hintsUsed: number;             // NEW — đếm số hint đã dùng (per session)

  // ... methods hiện có
  deductPoints: (amount: number) => void;       // NEW
  registerHint: () => void;                     // NEW — combo: deduct 50 + tăng hintsUsed
}
```

**Implementation pseudo:**
```ts
deductPoints: (amount) =>
  set((s) => ({ score: Math.max(0, s.score - amount) })),

registerHint: () =>
  set((s) => ({
    score: Math.max(0, s.score - 50),
    hintsUsed: s.hintsUsed + 1,
  })),
```

**Reset rules:** `startGame()` và `reset()` đều set `hintsUsed = 0`.

**Lý do API mới (không tính trong component):**
- Reusable cho game tương lai (Listening Lab có thể có hint-replay tương tự)
- `score` luôn là single source of truth — tránh mismatch giữa local state và store
- Test outline có thể test `deductPoints` riêng, dễ verify

---

### 2.1 Mở rộng `types.ts`

```ts
// Existing:
export type CourseGameType = 'vocab-sprint' | 'flappy-vocab' | 'situation-game';

// CHANGE: thêm 2 type mới vào CourseGameType (vì 2 game này nhận courseGameStore context)
export type CourseGameType =
  | 'vocab-sprint'
  | 'flappy-vocab'
  | 'situation-game'
  | 'memory-match'
  | 'word-builder';

// GameId union — đã dọn sạch các placeholder tiếng Đức chưa dùng (2026-07-11)
export type GameId = CourseGameType | 'daily-challenge';
```

### 2.2 Round types mới

```ts
// src/features/games/types.ts (append cuối file)

/** Memory Match — 1 round = 1 grid với nhiều cặp */
export interface MemoryRound extends GameRound {
  data: {
    pairs: MemoryPair[];     // 6-8 cặp / round
    gridCols: 3 | 4;         // 4 cột mặc định, 3 cho mobile hẹp
    timeLimitSec?: number;   // optional, default 90s
  };
}

export interface MemoryPair {
  id: string;                // unique trong round
  word: string;              // tiếng Nhật romaji ("houkoku")
  meaning: string;           // tiếng Việt
  sourceVocabId?: string;    // map về course vocab → SRS
}

/** Word Builder — 1 round = 1 từ cần xếp */
export interface BuilderRound extends GameRound {
  data: {
    word: string;            // đáp án romaji ("houkoku")
    meaning: string;         // "cái bàn"
    letterPool: string[];    // ['T', 'i', 's', 'c', 'h', 'B'] — kèm 1-2 distractor
    hintsUsed: number;       // tracked tại runtime
    sourceVocabId?: string;  // map → SRS
  };
}
```

### 2.3 Mock data files

```
src/features/games/data/
├── memoryData.ts      # MEMORY_ROUNDS: MemoryRound[]   (4 round, mỗi round 6-8 pairs)
└── builderData.ts     # BUILDER_ROUNDS: BuilderRound[] (15-20 từ)
```

**memoryData.ts mẫu:**
```ts
export const MEMORY_ROUNDS: MemoryRound[] = [
  {
    id: 'mem-r1',
    prompt: 'Cặp đôi từ vựng — Vào ca & giao tiếp',
    data: {
      gridCols: 4,
      timeLimitSec: 90,
      pairs: [
        { id: 'mem-r1-p1', word: 'ohayou gozaimasu', meaning: 'chào buổi sáng' },
        { id: 'mem-r1-p2', word: 'houkoku', meaning: 'báo cáo' },
        { id: 'mem-r1-p3', word: 'kyukei', meaning: 'giờ nghỉ' },
        // ... 3-5 cặp nữa
      ],
    },
  },
  // 2 round nữa, chủ đề khác (Hồ sơ & giấy tờ / Tác phong & an toàn)
];

export function getShuffledMemoryRounds(count = 3): MemoryRound[] { /* ... */ }
```

**builderData.ts mẫu:**
```ts
export const BUILDER_ROUNDS: BuilderRound[] = [
  {
    id: 'wb-1',
    prompt: 'báo cáo',
    data: {
      word: 'houkoku',
      meaning: 'báo cáo',
      letterPool: ['h', 'o', 'u', 'k', 'o', 'k', 'u', 'm'], // last char = decoy
      hintsUsed: 0,
    },
  },
  // ... 19 từ nữa (romaji, không có Umlaut vì đây là tiếng Nhật)
];

export function getShuffledBuilderRounds(count = 8): BuilderRound[] { /* ... */ }
```

### 2.4 Generator từ CourseVocabularyItem (cho courseGameStore integration)

```
src/features/games/generators/
├── fromCourseVocabMemory.ts    # generateMemoryRounds(vocab) → MemoryRound[]
└── fromCourseVocabBuilder.ts   # generateBuilderRounds(vocab) → BuilderRound[]
```

**Logic chính:**
- **Memory**: nhóm vocab theo ngữ cảnh (theo lesson nếu có), mỗi nhóm 6-8 cặp → 1 round
- **Builder**: lấy mỗi từ → tách chữ cái → thêm 1-2 decoy random → 1 round/từ
- Nếu vocab < 6 → chỉ 1 round Memory với grid 3×N
- Nếu vocab < 1 → return [] và game hiển thị empty state

### 2.5 Relationships

```
courseGameStore.context.vocabulary (CourseVocabularyItem[])
    │
    ├──── generateMemoryRounds()  → MemoryRound[]   → MemoryMatch
    └──── generateBuilderRounds() → BuilderRound[]  → WordBuilder

Khi không có context:
    src/features/games/data/memoryData.ts (MEMORY_ROUNDS)
    src/features/games/data/builderData.ts (BUILDER_ROUNDS)
```

### 2.6 Constraints

| Constraint | Lý do |
|------------|-------|
| Memory pairs ≤ 8 / round | grid 4×4 max trên mobile 375px vẫn đọc được |
| Word ≤ 12 chữ cái | slot dài hơn không vừa container 360px |
| Letter pool ≤ word.length + 2 | decoy nhiều quá khó tối, ít quá lộ đáp án |
| Round count ≤ 10 | session ≤ 5 phút để giữ engagement |

---

## 3. Screens / Component Tree

### 3.1 Memory Match

```
MemoryMatch.tsx
└── GameShell (existing)
    ├── header: title="Memory Match" accent="#A855F7"
    ├── progress bar (round X/Y)
    ├── feedback bar (visible khi match đúng/sai)
    └── children:
        ├── <TimerBar timeLeftSec={42} totalSec={90} warning={timeLeftSec < 15} />
        └── <MemoryGrid>
            ├── <MemoryCard id={pair.id} side="word" />
            ├── <MemoryCard id={pair.id} side="meaning" />
            └── ... (12-16 cards / round)
```

**`<TimerBar>` spec:**
- Position: top of children area, dưới progress bar
- Visual: thanh ngang, chiều dài tỷ lệ `timeLeftSec / totalSec`
- Color: `#A855F7` khi `warning=false`; `#EF4444` + pulse 1Hz khi `warning=true` (timeLeft < 15s)
- Text: hiển thị số giây còn lại bên phải, format `m:ss`
- Khi pause (feedback visible) → opacity 0.6 + thêm `Pause` icon
- Khi expire → trigger `onTimeUp` callback parent xử lý

**Component props:**

```ts
interface MemoryMatchProps {
  rounds?: MemoryRound[];
  returnTo?: string;
  courseTitle?: string;
}

interface MemoryGridProps {
  pairs: MemoryPair[];
  cols: 3 | 4;
  onMatch: (pair: MemoryPair) => void;
  onMiss: (a: MemoryPair, b: MemoryPair) => void;
}

interface MemoryCardProps {
  id: string;          // unique cardId (= pairId + side)
  pairId: string;
  text: string;        // word hoặc meaning
  side: 'word' | 'meaning';
  flipped: boolean;
  matched: boolean;
  disabled: boolean;
  onClick: () => void;
}
```

**States:**
- loading: render skeleton 12 cards
- empty: nếu courseGameStore vocab < 4 → hiện CTA "Học thêm từ để mở game"
- success (round complete): GameResult
- error: nếu generator fail → fallback mock

**Visual baseline (chốt ở `/awf-visualize`):**
- Card mặt sau: gradient tím + dấu chấm hỏi
- Card mặt trước: text trắng trên nền `#1A2332` (giống VocabSprint)
- Animation: rotateY 0 → 180deg, duration 320ms, easing `[0.4, 0, 0.2, 1]`
- Match: pulse glow `#10B981` 600ms rồi fade matched=true (opacity 0.4)
- Miss: shake X 8px 400ms rồi flip lại

### 3.2 Word Builder

```
WordBuilder.tsx
└── GameShell (existing)
    ├── header: title="Word Builder" accent="#F59E0B"
    └── children:
        ├── <BuilderPrompt meaning="cái bàn" article="der" />
        ├── <BuilderSlots length={5} placedLetters={['T','i','s',null,null]} />
        ├── <BuilderControls onHint={...} hintsUsed={0} canSubmit={isFull} onSubmit={...} />
        └── <LetterPool letters={['T','i','s','c','h','B']} placedIds={[0,1,2]} />
```

**Component props:**

```ts
interface WordBuilderProps {
  rounds?: BuilderRound[];
  returnTo?: string;
  courseTitle?: string;
}

interface BuilderSlotsProps {
  length: number;
  slots: (LetterChip | null)[];
  highlightedSlot?: number;       // hint reveal
  onTapSlot: (index: number) => void;
}

interface LetterPoolProps {
  letters: LetterChip[];
  placedChipIds: Set<string>;
  onTapLetter: (chipId: string) => void;
}

interface BuilderControlsProps {
  hintsUsed: number;
  maxHints: number;          // 2 mặc định
  canSubmit: boolean;        // true khi mọi slot đã filled
  onHint: () => void;
  onSubmit: () => void;
}

interface LetterChip {
  id: string;          // unique trong round
  char: string;        // 'T', 'ä', 'ß' ...
  isUmlaut: boolean;   // styling đặc biệt
}
```

**States:**
- `idle`: slots trống, pool đầy, Submit disabled
- `partial`: 1+ slot đã điền, Submit enabled chỉ khi mọi slot đầy
- `submittable`: tất cả slot điền, Submit button **nổi bật pulse** (manual click)
- `correct`: glow xanh + advance (sau khi click Submit)
- `wrong`: shake đỏ + cho user fix (slots giữ nguyên, không reset)
- `hint`: 1 slot reveal sẵn (chữ đúng, lock không tap được), chip pool tương ứng disable, score −50

> ⚠️ **Quan trọng (revise từ AI challenge P1-1):** KHÔNG auto-submit khi slots full. User phải tap nút "Kiểm tra" để check. Lý do: tap nhầm chữ cuối → user cần khoảnh khắc undo bằng cách tap slot đó trả về pool. Auto-submit cướp UX này.

**Hint reveal logic (revise từ P2-4):**

```text
Khi user tap Hint:
  1. So target word với current slots
  2. Tìm index `i` đầu tiên thỏa: slots[i] === null OR slots[i].char !== word[i]
  3. Nếu slots[i] có chữ (sai) → trả chip về pool (xóa khỏi placedChipIds)
  4. Tìm chip trong pool có char === word[i] và id chưa trong placedChipIds
  5. Đặt chip đó vào slots[i], thêm vào placedChipIds
  6. Mark slots[i] là `revealed` (lock, user không tap đẩy ra được)
  7. hintsUsed += 1, gọi gameStore.deductPoints(50)
```

**Visual baseline:**
- Slot: dashed border `#3F4756`, h-14, w-14, font-black 24px
- Slot có chip: solid border `#F59E0B`, fill chip background
- Slot revealed (hint): solid border `#A855F7`, lock icon nhỏ góc trên-phải
- Letter chip: rounded-xl `#1A2332` border `#3F4756`, hover `#F59E0B`/30
- Umlaut chip: thêm dot indicator nhỏ (`#F59E0B`) phía trên chữ
- **Submit button**: sticky bottom (trong `BuilderControls`), `bg-[#F59E0B]` khi `canSubmit=true`, gray khi false. Label "Kiểm tra"
- Hint button: `Lightbulb` icon + "−50pt" + counter `0/2`

---

## 4. State Machines

### 4.1 Memory Match

```
                    ┌──────────────┐
                    │ idle (load)  │
                    └──────┬───────┘
                           │ rounds ready
                           ▼
             ┌─────────────────────────────┐
        ┌───▶│ playing (timer chạy)        │
        │    └─────────────────────────────┘
        │           │                    │
        │           │ user click card    │ timer = 0
        │           ▼                    ▼
        │    ┌─────────────────────┐  ┌─────────────────────┐
        │    │ first-flip          │  │ time-up             │
        │    └──────┬──────────────┘  │ force completeGame  │
        │           │ click card thứ 2└──────────┬──────────┘
        │           ▼                            │
        │    ┌─────────────────────┐             │
        │    │ second-flip (lock)  │             │
        │    └──────┬──────────────┘             │
        │           │ check                      │
        │   ┌───────┴────────┐                   │
        │   ▼                ▼                   │
        │ match           miss                   │
        │   │                │                   │
        │   │ pulse 600ms    │ shake 400ms       │
        │   │ matched=true   │ flip back         │
        │   ▼                ▼                   │
        └───┴────────────────┘                   │
                  │                              │
        đủ pairs? │                              │
                  ▼                              ▼
              ┌───────────────────────────────────┐
              │ result (GameResult)               │
              │  - score hiện tại                 │
              │  - badge "⏰ Hết giờ" nếu timeout │
              └───────────────────────────────────┘
```

**Timer rules:**
- Timer bắt đầu count-down khi state = `playing` lần đầu (round 1)
- Timer **giữ tiếp tục cross-round** (1 cây timer cho cả session) — fair với learner đã match nhanh
- Timer pause khi `feedback.visible=true` (đợi user dismiss feedback)
- Timer pause khi state = `result`
- Khi timer = 0 → force `completeGame()` ngay, state → `result` với flag `timedOut=true`

**Transitions ↔ gameStore:**
| FSM event | gameStore call |
|-----------|----------------|
| Start round 1 | `startGame('memory-match', totalRounds)` + start local timer |
| Match đúng | `answerCorrect(100)` + show feedback "Match!" |
| Miss | `answerWrong(pairId)` + show feedback "Sai cặp!" |
| Round done (đủ pairs) | `nextRound()` (timer KHÔNG reset) |
| Last round done | `completeGame()` |
| **Timer expire** | `completeGame()` ngay, kèm local flag `timedOut=true` truyền vào GameResult |

**Combo cross-round (chốt từ AI challenge P2-6):** Combo **giữ cross-round**, không reset khi `nextRound()`. Lý do:
- Đồng bộ với gameStore hiện tại (`nextRound` không clear combo)
- Reward streak dài → tăng engagement
- Pattern cũ của VocabSprint/SituationGame cũng giữ cross-round → consistency

### 4.2 Word Builder

```
                ┌─────────────┐
                │ idle (load) │
                └──────┬──────┘
                       │
                       ▼
        ┌────────────────────────────┐
        │ playing (slots empty)      │
        └──────┬─────────────────────┘
               │ tap letter
               ▼
        ┌────────────────────────────┐
   ┌───▶│ partial (≥1 slot filled)   │
   │    └──┬───────────────────────┬─┘
   │       │ tap letter            │ tap filled slot
   │       ▼                       ▼
   │   slot += letter          slot -= letter
   │       │                       │
   │       └──────┬────────────────┘
   │              │ slots full
   │              ▼
   │       ┌──────────────┐
   │       │ checking     │
   │       └─┬──────────┬─┘
   │       correct    wrong
   │         │          │
   │         │          │ shake; cho phép sửa
   └─────────┘          ▼
            │      [partial again]
            ▼
       glow + advance
            │
            ▼
       next round
```

**Hint button**: chỉ enable khi state = idle hoặc partial. Click → reveal 1 slot trống đầu tiên với chữ đúng + chip pool tương ứng disabled. Trừ 50 điểm tích lũy (qua score override).

---

## 5. Flows

### 5.1 Happy path — Memory Match từ Hub

```
User ở /app/hub
  → click card "Memory Match"
  → navigate /app/game/memory-match
  → GameScreen normalizer → render <MemoryMatch />
  → MemoryMatch fallback rounds = MEMORY_ROUNDS (mock)
  → useEffect: gameStore.startGame('memory-match', 3)
  → render grid round 1 (8 pairs, 16 cards face-down)
  → user tap card A → first-flip
  → user tap card B (cùng pairId) → match! pulse → answerCorrect → feedback "Match!"
  → user dismiss feedback → continue tap
  → tất cả pairs match → nextRound (round 2)
  → ...
  → round cuối done → status='complete' → render <GameResult />
  → onRestart: store.reset() + restart game
  → Về Hub: navigate /app/hub
```

### 5.2 Happy path — Word Builder từ Course

```
User ở /app/courses/:id/learn (tab Game)
  → click card "Word Builder"
  → courseGameStore.setCourseGameContext({ vocabulary, courseTitle, returnPath })
  → navigate /app/game/word-builder?courseId=:id
  → GameScreen → buildCourseContext → generateBuilderRounds(vocab)
  → render <WordBuilder rounds={...} returnTo="/app/courses/:id/learn" courseTitle="A1.1 Văn phòng" />
  → useEffect: gameStore.startGame('word-builder', 8)
  → render round 1: prompt "cái bàn", 5 slot, pool 6 chữ
  → user tap T, i, s, c, h theo thứ tự → slots full
  → state = checking → match → answerCorrect → glow advance
  → ... 7 round nữa
  → complete → GameResult với "Về khóa học" CTA
```

### 5.3 Validation paths

| Tình huống | Hệ thống xử lý |
|-----------|----------------|
| User tap đúng cặp cuối Memory | match + advance round (hoặc complete nếu round cuối) |
| User tap chip rồi tap chính slot vừa đặt | trả chip về pool, slot trống lại |
| User tap pool khi tất cả slot đầy | no-op |
| Word có Umlaut nhưng pool không có Umlaut | bug data — `npm run lint` test sẽ assert (xem test outline) |
| courseVocab.length < 4 | game fallback mock data + log warn |

### 5.4 Error/edge paths

| Edge | Handling |
|------|----------|
| User refresh giữa game | gameStore reset (không persist) → quay về /app/hub |
| Timer Memory Match expire | force complete với score hiện tại |
| User tap nhanh 2 card cùng lúc | second-flip lock, ignore extra clicks |
| Hint click khi không còn slot trống | disable button visually |
| `prefers-reduced-motion` | flip animation thay bằng opacity fade 200ms |
| Mobile 375px, grid 4×4 quá chật | tự động giảm xuống 4×3 (6 pairs) |

---

## 6. Acceptance Criteria

### AC — Memory Match

- [ ] AC-MM-01: User mở `/app/game/memory-match` → game render trong < 500ms với grid 12-16 cards face-down
- [ ] AC-MM-02: Tap 2 card cùng pairId trong 2 lượt liên tiếp → match animation (pulse glow xanh) → matched=true (opacity 0.4)
- [ ] AC-MM-03: Tap 2 card khác pairId → shake 400ms → cả 2 flip về mặt sau
- [ ] AC-MM-04: Match liên tục đúng → combo tăng (hiển thị header "x2", "x3"); combo **giữ cross-round** khi sang round mới
- [ ] AC-MM-05: Match hết tất cả pairs trong round → tự động `nextRound`; timer KHÔNG reset
- [ ] AC-MM-06: Hoàn thành round cuối → render `GameResult` với score/maxCombo/accuracy
- [ ] AC-MM-07: Có courseGameContext → tiêu đề hiển thị courseTitle, button result hiện "Về khóa học"
- [ ] AC-MM-08: Wrong pairs (sourceVocabId) → push vào `progressStore.addToSrs`
- [ ] AC-MM-09: Honor `prefers-reduced-motion` (fade thay vì flip 3D)
- [ ] AC-MM-10: Keyboard nav: Tab focus card, Space/Enter để flip, focus ring rõ
- [ ] AC-MM-11: Responsive: 375px / 768px / 1440px đều chơi mượt
- [ ] **AC-MM-12 (timer)**: TimerBar hiển thị từ round 1, count-down `timeLimitSec` (default 90s), pause khi feedback bar visible
- [ ] **AC-MM-13 (timer warning)**: Khi timeLeft < 15s → TimerBar đổi `#EF4444` + pulse 1Hz
- [ ] **AC-MM-14 (timer expire)**: timeLeft = 0 → force `completeGame()` ngay, GameResult hiển thị badge "⏰ Hết giờ" với score hiện tại
- [ ] **AC-MM-15 (perf Android)**: Trên Pixel 4a (proxy mid-tier Android), flip animation duy trì ≥ 50fps; nếu fail → fallback rotateZ thay rotateY (note ở Polish phase)

### AC — Word Builder

- [ ] AC-WB-01: User mở `/app/game/word-builder` → render prompt + slot trống + pool letters + nút Submit (disabled)
- [ ] AC-WB-02: Tap chữ trong pool → slot trống đầu tiên fill chữ đó, chip pool grayed
- [ ] AC-WB-03: Tap slot đã điền (không phải slot revealed) → trả chip về pool, slot trống lại
- [ ] AC-WB-04: Mọi slot điền → nút Submit enable + pulse `#F59E0B` thu hút attention
- [ ] AC-WB-05: User tap Submit, đáp án đúng → glow xanh advance + `answerCorrect`
- [ ] AC-WB-06: User tap Submit, đáp án sai → shake slots, slots giữ nguyên, user tự sửa
- [ ] AC-WB-07: Hint button: tap → tìm slot trống/sai đầu tiên (so target word), replace bằng chip đúng từ pool, lock slot (icon khóa), `gameStore.registerHint()` (score −50, hintsUsed +1)
- [ ] AC-WB-08: Word có Umlaut (ä, ö, ü, ß) → pool render Umlaut chip với indicator dot
- [ ] AC-WB-09: Tap Umlaut chip → slot fill chữ Umlaut chính xác (không bị normalize về `a`)
- [ ] AC-WB-10: Có courseGameContext → tiêu đề courseTitle, generator dùng vocab khóa
- [ ] AC-WB-11 (revised): Round có `hintsUsed >= 1` HOẶC submit sai → push `sourceVocabId` vào SRS queue (lý do: dùng hint = chưa thuộc tự nhiên, cần ôn lại)
- [ ] AC-WB-12: Responsive 375px → slot/chip co lại đẹp, không tràn; nút Submit sticky bottom safe-area
- [ ] AC-WB-13: Honor `prefers-reduced-motion` (shake → flash bg `#EF4444` 200ms linear)
- [ ] AC-WB-14: Hint button hiển thị counter `0/2`; max 2 hint/round, vượt → button disabled
- [ ] AC-WB-15: Submit button disabled → ARIA `aria-disabled="true"` + visual gray

### AC — Foundation (cả 2 game)

- [ ] AC-F-01: `types.ts` có `GameId` mới `memory-match` + `word-builder`
- [ ] AC-F-02: Hub `LearningHubPage` thêm 2 game card mới (icon Brain + Hammer, accent tím + cam)
- [ ] AC-F-03: Click card Hub → navigate đúng route
- [ ] AC-F-04: `GameScreen` normalizer xử lý 2 gameId mới, return `<Navigate>` nếu invalid
- [ ] AC-F-05: `npm run lint` pass (tsc --noEmit)
- [ ] AC-F-06: `npm run build` pass

---

## 7. Test Outline

> Project có `npm run test` chạy `tsx src/test/run-tests.ts`. Em sẽ thêm test theo pattern hiện có (kiểm tra generator + reducer logic, không test UI).

### Unit / generator tests

**`src/test/games/memoryGenerator.test.ts`** (hoặc append vào run-tests.ts)
- TC-MM-G-01: `generateMemoryRounds([])` → `[]`
- TC-MM-G-02: `generateMemoryRounds(vocab=3 items)` → 1 round 3 pairs (grid co lại 3×2)
- TC-MM-G-03: `generateMemoryRounds(vocab=20 items)` → 3 round (8+8+4 pairs)
- TC-MM-G-04: round.pairs[i].sourceVocabId === vocabItem.id (truy ngược được SRS)
- TC-MM-G-05: pair.word có article nếu vocabItem.article !== '—'

**`src/test/games/builderGenerator.test.ts`**
- TC-WB-G-01: `generateBuilderRounds([])` → `[]`
- TC-WB-G-02: `generateBuilderRounds([{ word: 'Tisch' }])` → 1 round, letterPool.length === 6 (5 + 1 decoy)
- TC-WB-G-03: Word có Umlaut → letterPool giữ nguyên ký tự Umlaut (không normalize)
- TC-WB-G-04: Decoy không trùng ký tự đã có trong word
- TC-WB-G-05: Word > 12 chars → bị filter ra (skip)

### Reducer/store tests
*(reuse pattern test gameStore hiện có nếu có; nếu chưa, không bắt buộc cho MVP)*

**`src/test/games/gameStore.test.ts`** — bổ sung do mở rộng API (P1-3)
- TC-GS-01: `startGame()` reset `hintsUsed = 0`
- TC-GS-02: `reset()` reset `hintsUsed = 0`
- TC-GS-03: `deductPoints(50)` khi score = 100 → score = 50
- TC-GS-04: `deductPoints(150)` khi score = 100 → score = 0 (không âm)
- TC-GS-05: `registerHint()` → score −50 + hintsUsed +1 trong 1 lần gọi

### Manual QA checklist (cho Phase 04 — Polish)

**Memory Match:**
- [ ] Browser Chrome desktop: tap → match → complete → result
- [ ] Browser Safari mobile (375): grid không tràn, tap nhạy
- [ ] Disable JS animation (DevTools `prefers-reduced-motion`): fade thay flip
- [ ] Keyboard only: Tab + Space chơi được hết round

**Word Builder:**
- [ ] Tap chữ thường → slot fill
- [ ] Tap chữ Umlaut → slot fill ký tự đúng
- [ ] Tap slot đã điền → chip về pool
- [ ] Hint: 1 slot reveal, chip disable, score −50
- [ ] Sai → shake, fix được, không phải làm lại từ đầu

### Integration smoke

- [ ] Từ Hub → Memory Match → Result → Hub: end-to-end OK
- [ ] Từ Course tab Game → Word Builder (có courseId) → Result "Về khóa học" → Course: OK
- [ ] Mở 2 game liên tiếp → gameStore reset đúng, không leak state
- [ ] Wrong items xuất hiện trong ReviewCenter SRS queue

---

## 8. Animation Timing

| Animation | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Memory card flip | 320ms | `[0.4, 0, 0.2, 1]` | rotateY 0 → 180 |
| Memory match pulse | 600ms | spring (stiff 300, damp 25) | scale 1 → 1.08 → 1, glow `#10B981` |
| Memory miss shake | 400ms | linear | translateX ±8px, 4 oscillations |
| Builder slot fill | 180ms | spring | scale 0.8 → 1 + opacity 0 → 1 |
| Builder correct glow | 500ms | ease-out | border + bg `#10B981`/20 |
| Builder shake | 400ms | linear | translateX ±6px |
| Hint reveal | 300ms | ease-out | slot solid border + chip flash |
| Reduced-motion fallback | 200ms | linear | chỉ opacity transition |

---

## 9. Hub Card Spec

Thêm vào `LearningHubPage.tsx`, dưới hero Flappy Vocab + Stats Strip, grid 2 cột (md+):

```tsx
<section className="grid gap-4 md:grid-cols-2">
  <GameCard
    to="/app/game/memory-match"
    icon={Brain}
    title="Memory Match"
    subtitle="Lật bài ghép cặp từ vựng"
    accent="#A855F7"
    level="A1 → A2"
  />
  <GameCard
    to="/app/game/word-builder"
    icon={Hammer}
    title="Word Builder"
    subtitle="Xếp chữ thành cụm tiếng Nhật"
    accent="#F59E0B"
    level="A1 → A2"
  />
</section>
```

`GameCard` là component nhỏ (không tồn tại — sẽ tạo trong Phase 01) với layout:
- icon trái (gradient từ accent), title + subtitle giữa, level badge phải
- hover translateY -2
- click → Link

---

## 10. File Plan (cuối cùng cho `/awf-code`)

### Tạo mới
| Path | Mục đích |
|------|----------|
| `src/features/games/MemoryMatch.tsx` | Game component |
| `src/features/games/WordBuilder.tsx` | Game component |
| `src/features/games/data/memoryData.ts` | Mock fallback data |
| `src/features/games/data/builderData.ts` | Mock fallback data |
| `src/features/games/generators/fromCourseVocabMemory.ts` | Course → MemoryRound[] |
| `src/features/games/generators/fromCourseVocabBuilder.ts` | Course → BuilderRound[] |
| `src/features/hub/components/GameCard.tsx` | Reusable hub card |
| `src/test/games/memoryGenerator.test.ts` | Unit test |
| `src/test/games/builderGenerator.test.ts` | Unit test |

### Sửa
| Path | Thay đổi |
|------|----------|
| `src/features/games/types.ts` | + `MemoryRound`, `BuilderRound`, `MemoryPair`, `LetterChip`; mở rộng `CourseGameType` |
| `src/features/games/gameStore.ts` | + `hintsUsed`, `deductPoints(amount)`, `registerHint()`; reset cả 2 ở `startGame` + `reset` |
| `src/features/games/GameScreen.tsx` | + 2 normalizer case + 2 import + render branch |
| `src/features/hub/pages/LearningHubPage.tsx` | + grid 2 GameCard mới dưới hero |
| `src/test/run-tests.ts` | + import 2 test mới |

### Không đụng
- `GameShell.tsx`, `courseGameStore.ts`, `GameResult.tsx`, `useGameSession.ts`, `progressStore.ts`, `game-routes.tsx`

---

## 11. Open Questions

Đã chốt sau AI Challenge 2026-05-17:

| # | Question | Decision |
|---|----------|----------|
| 1 | Memory Match round count | **3 round / session** (~4 phút) |
| 2 | Word Builder hint pricing | **−50 điểm cố định** + max **2 hint/round** |
| 3 | Hub layout | **Grid 2 cột dưới hero Flappy** |
| 4 | Word Builder submit | **Manual Submit button** (không auto) |
| 5 | Memory Match combo | **Giữ cross-round** (sync với gameStore pattern) |
| 6 | Memory Match timer | **Default 90s, giữ cross-round, expire = force complete** |
| 7 | SRS push Word Builder | **Push khi hint ≥ 1 HOẶC submit sai** |
| 8 | Hint reveal logic | **Replace slot trống/sai đầu tiên** với chip đúng + lock |

Không còn open questions blocking. Ready cho `/awf-ready` rồi `/awf-code`.

---

## 12. Handoff

- ✅ Design v2 (post AI challenge): data shape, component tree, state machine, animation timing, AC, test outline đầy đủ
- ✅ 6 issue P1+P2 từ AI challenge đã fixed (Submit manual, Timer expire flow, deductPoints API, hint reveal logic, SRS push khi hint, combo cross-round)
- ✅ File plan rõ: 9 file tạo mới, **5 file sửa** (thêm `gameStore.ts`), 6 file không đụng
- ⚠️ P3 (perf Android cũ, reduced-motion Builder shake spec màu) — verify trong Polish phase

Next: `/awf-ready` để check readiness, sau đó `/awf-code` Phase 01 (Foundation).

---
Tạo bởi AWF v4.1 /awf-design  
Revised 2026-05-17 sau AI challenge: docs/reports/ai_challenge_2026-05-17.md
