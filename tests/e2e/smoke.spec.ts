import { expect, test } from '@playwright/test';

test.describe('production smoke', () => {
  test('@smoke landing page loads', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { name: /Học tiếng Nhật.*Tokutei/i })).toBeVisible();
  });

  test('@smoke login boundary is reachable', async ({ page }) => {
    await page.goto('./login');
    await expect(page.locator('body')).toContainText(/Cần cấu hình Supabase Cloud|Đăng nhập tài khoản Supabase Cloud|Đăng nhập Học viên|Lộ trình Tokutei rõ từ/);
  });

  test('@smoke protected learner route shows its auth boundary', async ({ page }) => {
    await page.goto('./app/dashboard');
    await expect(page.locator('body')).toContainText(/Cần cấu hình Supabase Cloud|Đăng nhập|TOKUTEI GINO/);
  });
});
