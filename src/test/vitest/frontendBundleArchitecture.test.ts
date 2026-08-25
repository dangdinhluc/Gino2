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

  it('keeps push subscription code out of the startup module', () => {
    const main = source('src/main.tsx');
    expect(main).not.toContain('pushRepository');
    expect(main).toContain('navigator.serviceWorker.register');
  });

  it('creates stable vendor boundaries for the heaviest shared libraries', () => {
    const viteConfig = source('vite.config.ts');
    expect(viteConfig).toContain("return 'vendor-react'");
    expect(viteConfig).toContain("return 'vendor-supabase'");
    expect(viteConfig).toContain("return 'vendor-motion'");
    expect(viteConfig).toContain("return 'vendor-icons'");
    expect(viteConfig).toContain("return 'vendor-state'");
  });
});
