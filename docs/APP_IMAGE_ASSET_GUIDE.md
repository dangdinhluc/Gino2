# Gino2 app image assets

Canonical folder: [`public/assets/app-images`](../public/assets/app-images)

This folder contains 64 local images referenced by the app asset registry plus the PWA brand icon. Remote course thumbnails from database URLs are intentionally not copied here.

## Optimization applied

- PNG/JPEG source assets were converted to WebP with `cwebp -m 6`.
- Transparent UI/mascot images use quality 85 and alpha quality 100.
- Large illustrated backgrounds use quality 80–82 and are capped at the maximum useful display dimension.
- Existing WebP files were copied without a second lossy encode.
- Small UI assets are capped at 256px; mascots/illustrations at 512px; banners/backgrounds at 1024–1920px.
- Recommended CSS sizes below are the rendered box sizes. The exported pixel size is intentionally up to 2–3× larger for Retina displays.
- Components should keep fixed aspect-ratio/box dimensions and use `object-contain` for transparent artwork or `object-cover` for thumbnails/backgrounds.

## Summary

| Metric | Before | Canonical folder |
|---|---:|---:|
| Files | 64 | 64 |
| Total size | 14428 KB | 1425 KB |
| Reduction | — | 90% |

## Asset manifest

| Canonical file | Role | Source px | Output px | Source size | Output size | Reduction | Recommended rendered size | Method |
|---|---|---:|---:|---:|---:|---:|---|---|
| `navigation-profile.webp` | navigation icon | 1254×1254 | 256×256 | 1105 KB | 8.6 KB | 99% | 24–48px | WebP q85, alpha 100, giới hạn 256px |
| `navigation-exams.webp` | navigation icon | 1309×1201 | 256×235 | 1214 KB | 13.3 KB | 99% | 24–48px | WebP q85, alpha 100, giới hạn 256px |
| `course-mode-game.webp` | course mode icon | 1254×1254 | 256×256 | 983.9 KB | 9.0 KB | 99% | 24–48px | WebP q85, alpha 100, giới hạn 256px |
| `quick-learn.webp` | quick action icon | 1122×1402 | 205×256 | 1713 KB | 19.6 KB | 99% | 48–72px | WebP q85, alpha 100, giới hạn 256px |
| `course-mode-practice.webp` | course mode icon | 1254×1254 | 256×256 | 1028 KB | 6.9 KB | 99% | 24–48px | WebP q85, alpha 100, giới hạn 256px |
| `navigation-home.webp` | navigation icon | 1254×1254 | 256×256 | 933.9 KB | 9.3 KB | 99% | 24–48px | WebP q85, alpha 100, giới hạn 256px |
| `navigation-courses.webp` | navigation icon | 1254×1254 | 256×256 | 972.2 KB | 8.1 KB | 99% | 24–48px | WebP q85, alpha 100, giới hạn 256px |
| `navigation-practice.webp` | navigation icon | 1254×1254 | 256×256 | 986.5 KB | 9.7 KB | 99% | 24–48px | WebP q85, alpha 100, giới hạn 256px |
| `course-mode-vocabulary.webp` | course mode icon | 1254×1254 | 256×256 | 1019.7 KB | 7.8 KB | 99% | 24–48px | WebP q85, alpha 100, giới hạn 256px |
| `course-mode-documents.webp` | course mode icon | 1254×1254 | 256×256 | 919.2 KB | 8.2 KB | 99% | 24–48px | WebP q85, alpha 100, giới hạn 256px |
| `mascot-lightbulb.webp` | small mascot | 170×165 | 170×165 | 34.6 KB | 5.6 KB | 84% | 32–64px | WebP q85, alpha 100 |
| `mascot-tanuki-waving.webp` | small mascot | 296×295 | 296×295 | 163.2 KB | 25.5 KB | 84% | 48–96px | WebP q85, alpha 100 |
| `speech-bubble.webp` | decorative UI | 200×120 | 200×120 | 35.7 KB | 8.0 KB | 78% | 32–80px | WebP q85, alpha 100 |
| `mascot-hero-wave.webp` | hero mascot | 312×344 | 312×344 | 183.7 KB | 31.9 KB | 83% | 120–240px | WebP q85, alpha 100 |
| `mascot-reading-book.webp` | hero mascot | 276×362 | 276×362 | 178.4 KB | 31.3 KB | 82% | 120–240px | WebP q85, alpha 100 |
| `mascot-vocab-writing.webp` | feature mascot | 374×300 | 374×300 | 184.6 KB | 35.5 KB | 81% | 80–180px | WebP q85, alpha 100 |
| `mascot-practice-pencil.webp` | feature mascot | 297×371 | 297×371 | 182.3 KB | 31.5 KB | 83% | 80–180px | WebP q85, alpha 100 |
| `mascot-next-lesson-n5.webp` | feature mascot | 245×288 | 245×288 | 132.9 KB | 23.8 KB | 82% | 80–180px | WebP q85, alpha 100 |
| `mascot-backpack.webp` | feature mascot | 236×353 | 236×353 | 150.1 KB | 28.1 KB | 81% | 80–180px | WebP q85, alpha 100 |
| `dashboard-book-stack.webp` | dashboard icon | 174×181 | 174×181 | 52.4 KB | 10.2 KB | 81% | 32–96px | WebP q85, alpha 100 |
| `dashboard-checklist.webp` | dashboard icon | 184×193 | 184×193 | 52.5 KB | 10.6 KB | 80% | 32–96px | WebP q85, alpha 100 |
| `dashboard-open-book.webp` | dashboard icon | 240×170 | 240×170 | 59.2 KB | 10.9 KB | 82% | 32–96px | WebP q85, alpha 100 |
| `dashboard-pass-sign.webp` | dashboard icon | 164×180 | 164×180 | 46.3 KB | 10.0 KB | 78% | 32–96px | WebP q85, alpha 100 |
| `background-fuji-scene.webp` | illustrated background | 349×194 | 349×194 | 117.1 KB | 25.7 KB | 78% | full card width | WebP q82, alpha 100 |
| `dashboard-study-timer.webp` | dashboard icon | 123×127 | 123×127 | 26.2 KB | 5.5 KB | 79% | 32–96px | WebP q85, alpha 100 |
| `dashboard-xp-star.webp` | dashboard icon | 107×108 | 107×108 | 17.7 KB | 3.8 KB | 79% | 24–64px | WebP q85, alpha 100 |
| `dashboard-badge-streak.webp` | dashboard badge | 184×87 | 184×87 | 23.4 KB | 4.4 KB | 81% | 32–96px | WebP q85, alpha 100 |
| `dashboard-badge-reward.webp` | dashboard badge | 211×80 | 211×80 | 31.2 KB | 6.9 KB | 78% | 32–96px | WebP q85, alpha 100 |
| `dashboard-trophy.webp` | dashboard badge | 151×152 | 151×152 | 40.2 KB | 10.1 KB | 75% | 32–96px | WebP q85, alpha 100 |
| `speech-study-together.webp` | decorative mascot | 238×131 | 238×131 | 42.7 KB | 9.3 KB | 78% | 80–180px | WebP q85, alpha 100 |
| `mascot-quick-learn-active.webp` | quick action mascot | 298×293 | 298×293 | 160.8 KB | 29.6 KB | 82% | 48–120px | WebP q85, alpha 100 |
| `mascot-sleep.webp` | small mascot | 245×248 | 245×248 | 103.7 KB | 18.2 KB | 82% | 48–120px | WebP q85, alpha 100 |
| `course-launcher-banner.webp` | launcher banner | 539×179 | 539×179 | 151.6 KB | 22.1 KB | 85% | full card width | WebP q82, alpha 100 |
| `background-fuji-landscape.webp` | illustrated background | 643×211 | 643×211 | 231.2 KB | 32.0 KB | 86% | full card width | WebP q82, alpha 100 |
| `mascot-face-winking.webp` | small mascot | 173×157 | 173×157 | 55.2 KB | 10.3 KB | 81% | 32–64px | WebP q85, alpha 100 |
| `dashboard-chest-gold.webp` | dashboard illustration | 198×168 | 198×168 | 61.7 KB | 12.1 KB | 80% | 48–120px | WebP q85, alpha 100 |
| `dashboard-flame-streak.webp` | streak illustration | 122×157 | 122×157 | 30.5 KB | 6.3 KB | 79% | 24–64px | WebP q85, alpha 100 |
| `background-dashboard-library.webp` | app background | 1024×1024 | 1024×1024 | 291.6 KB | 291.6 KB | 0% | cover; 1024px source | giữ WebP hiện có |
| `background-english-hero.webp` | app background | 1920×1080 | 1920×1080 | 133.2 KB | 59.2 KB | 56% | cover; up to 1920px | WebP q80, alpha 100 |
| `mascot-ai-tutor-tanuki.webp` | AI mascot | 512×570 | 460×512 | 50.8 KB | 43.4 KB | 15% | 64–180px | WebP q85, alpha 100, giới hạn 512px |
| `mascot-brand.webp` | brand mascot | 512×512 | 512×512 | 35.3 KB | 35.3 KB | 0% | 32–160px | giữ WebP hiện có |
| `mascot-meow.webp` | profile mascot | 512×512 | 512×512 | 21.1 KB | 21.1 KB | 0% | 48–160px | giữ WebP hiện có |
| `mascot-sleeping-meow.webp` | small mascot | 512×393 | 512×393 | 24.3 KB | 24.3 KB | 0% | 48–120px | giữ WebP hiện có |
| `practice-badge-orange-aa.webp` | practice icon | 88×86 | 88×86 | 4.9 KB | 4.9 KB | 0% | 32–72px | giữ WebP hiện có |
| `practice-completed.webp` | practice icon | 80×91 | 80×91 | 4.6 KB | 4.6 KB | 0% | 32–72px | giữ WebP hiện có |
| `practice-flashcards.webp` | practice icon | 122×70 | 122×70 | 5.9 KB | 5.9 KB | 0% | 32–72px | giữ WebP hiện có |
| `practice-goal.webp` | practice icon | 111×94 | 111×94 | 7.3 KB | 7.3 KB | 0% | 32–72px | giữ WebP hiện có |
| `practice-hero-workbook.webp` | practice illustration | 285×128 | 285×128 | 17.5 KB | 17.5 KB | 0% | 120–240px | giữ WebP hiện có |
| `practice-listening.webp` | practice icon | 92×94 | 92×94 | 5.8 KB | 5.8 KB | 0% | 32–72px | giữ WebP hiện có |
| `practice-streak.webp` | practice icon | 82×98 | 82×98 | 4.7 KB | 4.7 KB | 0% | 32–72px | giữ WebP hiện có |
| `practice-vocabulary-book.webp` | practice icon | 110×88 | 110×88 | 5.3 KB | 5.3 KB | 0% | 32–72px | giữ WebP hiện có |
| `practice-worksheet-quiz.webp` | practice icon | 86×96 | 86×96 | 5.2 KB | 5.2 KB | 0% | 32–72px | giữ WebP hiện có |
| `game-gift-box.webp` | game illustration | 512×512 | 512×512 | 23.2 KB | 23.2 KB | 0% | 64–160px | giữ WebP hiện có |
| `game-tanuki.webp` | game mascot | 512×512 | 512×512 | 29.0 KB | 29.0 KB | 0% | 64–160px | giữ WebP hiện có |
| `game-calendar.webp` | game icon | 97×94 | 97×94 | 18.1 KB | 6.1 KB | 66% | 24–64px | WebP q85, alpha 100 |
| `game-chart.webp` | game icon | 110×85 | 110×85 | 14.4 KB | 5.6 KB | 61% | 24–64px | WebP q85, alpha 100 |
| `game-gamepad.webp` | game icon | 179×113 | 179×113 | 33.3 KB | 8.4 KB | 75% | 24–64px | WebP q85, alpha 100 |
| `game-trophy.webp` | game icon | 105×92 | 105×92 | 16.3 KB | 6.3 KB | 61% | 24–64px | WebP q85, alpha 100 |
| `game-flappy.webp` | game thumbnail | 512×512 | 512×512 | 42.0 KB | 42.0 KB | 0% | 160–320px square | giữ WebP hiện có |
| `game-situation.webp` | game thumbnail | 512×512 | 512×512 | 19.5 KB | 19.5 KB | 0% | 160–320px square | giữ WebP hiện có |
| `game-sprint.webp` | game thumbnail | 512×512 | 512×512 | 45.0 KB | 45.0 KB | 0% | 160–320px square | giữ WebP hiện có |
| `exam-tanuki.webp` | exam mascot | 512×544 | 482×512 | 42.7 KB | 41.1 KB | 4% | 64–180px | WebP q85, alpha 100, giới hạn 512px |
| `document-tanuki.webp` | document mascot | 512×452 | 512×452 | 39.1 KB | 39.1 KB | 0% | 64–180px | giữ WebP hiện có |
| `vocabulary-tanuki.webp` | vocabulary mascot | 512×489 | 512×489 | 63.8 KB | 63.8 KB | 0% | 64–180px | giữ WebP hiện có |

## Files intentionally not copied

- Duplicate PNG exports beside existing WebP files.
- Unreferenced PSD/layer exports, screenshots, and legacy alternatives.
- Course thumbnail URLs supplied by Supabase; those are remote content, not local app assets.
