import { expect, test } from '@playwright/test';

const learnerEmail = process.env.E2E_LEARNER_EMAIL;
const learnerPassword = process.env.E2E_LEARNER_PASSWORD;

test.describe('authenticated learner journey', () => {
  test('@authenticated learner can navigate core experience', async ({ page }) => {
    test.skip(!learnerEmail || !learnerPassword, 'E2E learner credentials are not configured.');

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('./login/learner');
    await page.getByLabel('Email').fill(learnerEmail!);
    await page.getByLabel('Mật khẩu').fill(learnerPassword!);
    await page.getByRole('button', { name: 'Vào khu học tập' }).click();
    await page.waitForURL(/\/app\/(dashboard|courses)/);

    if (new URL(page.url()).pathname.endsWith('/app/courses')) {
      test.skip(true, 'The configured E2E learner has no active course; no production enrollment is mutated by tests.');
    }

    await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Hôm nay' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Luyện tập' })).toBeVisible();

    await expect(page.getByRole('heading', { name: /Nhiệm vụ hôm nay/i })).toBeVisible();
    await page.getByRole('button', { name: 'Thông tin nhiệm vụ' }).click();
    await expect(page.getByText(/GINO ưu tiên ba việc/)).toBeVisible();

    await page.getByRole('link', { name: 'Luyện tập' }).click();
    await expect(page.getByRole('heading', { name: 'Luyện tập' })).toBeVisible();
    await expect(page.getByText(/từ cần ôn|Chưa tải được lịch ôn|Đang kiểm tra/)).toBeVisible();

    await page.getByRole('link', { name: 'Cá nhân' }).click();
    await expect(page.getByRole('heading', { name: 'Thành tích' })).toBeVisible();
    await expect(page.getByText('Tổng XP', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Khóa học' }).click();
    await expect(page.getByRole('heading', { name: 'Khóa học' })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./app/dashboard');
    await expect(page.getByRole('navigation', { name: 'Thanh điều hướng chính' })).toBeVisible();
    await expect(page.getByText('Luyện tập', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Mở Học ngay' }).click();
    await expect(page.getByRole('dialog', { name: 'Học ngay' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Học ngay' })).toBeHidden();
  });
});
