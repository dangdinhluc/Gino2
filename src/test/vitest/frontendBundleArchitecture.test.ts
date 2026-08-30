import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function source(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
}

describe('frontend cold-start boundaries', () => {
  it('keeps non-critical route chrome and launcher code behind lazy imports', () => {
    const publicRoutes = source('src/app/router/public-routes.tsx');
    const mainLayout = source('src/app/layouts/MainLayout.tsx');
    const bottomNav = source('src/app/layouts/BottomNav.tsx');

    expect(publicRoutes).toContain("const LandingPage = lazy(() => import('@/src/features/public/pages/LandingPage'))");
    expect(publicRoutes).not.toContain("import LandingPage from '@/src/features/public/pages/LandingPage'");
    expect(mainLayout).toContain('LazyMobileAITutorPopover');
    expect(mainLayout).toContain('LazyTokuteiAppChrome');
    expect(bottomNav).toContain('LazyLearningLauncherSheet');
    expect(bottomNav).not.toContain("import { LearningLauncherSheet } from '@/src/features/courses/components/LearningLauncherSheet'");
  });

  it('keeps Motion out of the learner cold-start shell and Home route', () => {
    const mainLayout = source('src/app/layouts/MainLayout.tsx');
    const bottomNav = source('src/app/layouts/BottomNav.tsx');
    const todayPage = source('src/features/dashboard/pages/TodayPage.tsx');

    expect(mainLayout).not.toContain("from 'motion/react'");
    expect(bottomNav).not.toContain("from 'motion/react'");
    expect(todayPage).not.toContain("from 'motion/react'");
    expect(mainLayout).not.toContain('mode="wait"');
    expect(mainLayout).toContain('gino-route-enter');
    expect(todayPage).toContain('gino-toast-enter');
  });

  it('defers service-worker registration until after load/idle', () => {
    const main = source('src/main.tsx');
    expect(main).toContain('registerServiceWorker');
    expect(main).toContain('requestIdleCallback');
    expect(main).toContain("window.addEventListener('load'");
  });

  it('prefetches primary destinations only on user intent and respects Data Saver', () => {
    const bottomNav = source('src/app/layouts/BottomNav.tsx');
    expect(bottomNav).toContain('routePreloaders');
    expect(bottomNav).toContain('onPointerEnter');
    expect(bottomNav).toContain('onPointerDown');
    expect(bottomNav).toContain('connection?.saveData');
    expect(bottomNav).toContain("/^(slow-)?2g$/i");
  });

  it('creates stable vendor boundaries without forcing tree-shakeable icons into one chunk', () => {
    const viteConfig = source('vite.config.ts');
    expect(viteConfig).toContain("return 'vendor-react'");
    expect(viteConfig).toContain("return 'vendor-supabase'");
    expect(viteConfig).toContain("return 'vendor-motion'");
    expect(viteConfig).toContain("return 'vendor-state'");
    expect(viteConfig).not.toContain("return 'vendor-icons'");
  });

  it('enforces bundle budgets in the production build', () => {
    const packageJson = source('package.json');
    const budgetScript = source('scripts/check-bundle-budget.mjs');
    expect(packageJson).toContain('node scripts/check-bundle-budget.mjs');
    expect(budgetScript).toContain('entry JS gzip');
    expect(budgetScript).toContain('vendor-motion');
  });
});
