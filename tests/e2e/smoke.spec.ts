import { expect, test } from '@playwright/test';

test.describe('production smoke', () => {
  test('@smoke landing page loads', async ({ page }) => {
    await page.goto('./');
    const heroTitle = page.locator('#landing-v2-title');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('Học vững hôm nay.');
    await expect(heroTitle).toContainText('Vững bước ngày mai.');
  });

  test('@smoke learner login is reachable', async ({ page }) => {
    await page.goto('./login/learner');
    await expect(page.locator('body')).toContainText(/Cần cấu hình Supabase Cloud|Đăng nhập học viên|Tiếp tục hành trình/);
  });

  test('@smoke quick login exposes learner and admin choices', async ({ page }) => {
    await page.goto('./quick-login');
    await expect(page.locator('body')).toContainText(/Cần cấu hình Supabase Cloud|TOKUTEI GINO/);
    if (await page.getByRole('link', { name: /Đăng nhập Học viên/i }).count()) {
      await expect(page.getByRole('link', { name: /Đăng nhập Học viên/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Đăng nhập Admin/i })).toBeVisible();
    }
  });

  test('@smoke protected learner route shows its auth boundary', async ({ page }) => {
    await page.goto('./app/dashboard');
    await expect(page.locator('body')).toContainText(/Cần cấu hình Supabase Cloud|Đăng nhập|TOKUTEI GINO/);
  });
});
