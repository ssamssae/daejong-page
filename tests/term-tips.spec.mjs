import { expect, test } from '@playwright/test';

// T-261025-009: 글 본문 용어 툴팁(빌드 때 rehype-glossary-tips 가 달고, TermTips.astro 가 여닫는다).
// 미리보기 서버(npm run build && npx astro preview --port 8772)에 대고 돌린다.
const base = process.env.WORKSHOP_PREVIEW_URL || 'http://localhost:8772';
const insight = `${base}/insights/2026-10-25-vibe-coding-ui-terms-24-codekkaknoin/`;
const DRAWER = '화면 옆에서 서랍처럼 열리는 패널. 한가운데 뜨는 모달과 달리 하던 일을 덜 끊는다.';

const drawer = (page) => page.locator('.term-tip').filter({ has: page.getByRole('button', { name: '드로어', exact: true }) }).first();

test.describe('with a mouse and keyboard', () => {
  test.use({ viewport: { width: 1440, height: 900 }, hasTouch: false, isMobile: false });

  test('pointing at a term shows its one-line definition and leaving hides it', async ({ page }) => {
    await page.goto(insight);
    const tip = drawer(page);
    const body = tip.getByRole('tooltip');
    await expect(body).toBeHidden();
    await tip.getByRole('button').hover();
    await expect(body).toBeVisible();
    await expect(body).toHaveText(DRAWER);
    await page.mouse.move(5, 5);
    await expect(body).toBeHidden();
  });

  test('keyboard focus shows the definition and Escape hides it without moving focus', async ({ page }) => {
    await page.goto(insight);
    const button = drawer(page).getByRole('button');
    await button.focus();
    await expect(drawer(page).getByRole('tooltip')).toBeVisible();
    await expect(button).toHaveAccessibleDescription(DRAWER);
    await page.keyboard.press('Escape');
    await expect(drawer(page).getByRole('tooltip')).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('the term looks like text with a dotted underline', async ({ page }) => {
    await page.goto(insight);
    const style = await drawer(page).getByRole('button').evaluate((button) => {
      const s = getComputedStyle(button);
      return { line: s.textDecorationLine, style: s.textDecorationStyle, background: s.backgroundColor, border: s.borderTopWidth };
    });
    expect(style).toEqual({ line: 'underline', style: 'dotted', background: 'rgba(0, 0, 0, 0)', border: '0px' });
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 360, height: 780 }, hasTouch: true, isMobile: true });

  test('a tap opens the definition, a second tap or a tap elsewhere closes it', async ({ page }) => {
    await page.goto(insight);
    const button = drawer(page).getByRole('button');
    const body = drawer(page).getByRole('tooltip');
    await button.tap();
    await expect(body).toBeVisible();
    await button.tap();
    await expect(body).toBeHidden();
    await button.tap();
    await expect(body).toBeVisible();
    await page.locator('.reading-header h1').tap();
    await expect(body).toBeHidden();
  });

  test('every definition stays inside the screen', async ({ page }) => {
    await page.goto(insight);
    const tips = page.locator('.term-tip');
    expect(await tips.count()).toBeGreaterThan(3);
    for (const tip of await tips.all()) {
      await tip.getByRole('button').scrollIntoViewIfNeeded();
      await tip.getByRole('button').tap();
      const box = await tip.getByRole('tooltip').boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(360);
      await tip.getByRole('button').tap();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});
