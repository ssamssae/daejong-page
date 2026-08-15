#!/usr/bin/env node
// Manual debug: run the Playwright add flow headfully against a given email.
// Usage: node debug-add.js some@email.com

import { chromium } from 'playwright';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = resolve(__dirname, '.chromium-profile');
const GROUP_URL = 'https://groups.google.com/g/memoyo-beta-testers/members';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node debug-add.js <email>');
  process.exit(1);
}

const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
  channel: 'chrome',
  headless: false,
  viewport: { width: 1280, height: 800 },
  args: ['--disable-blink-features=AutomationControlled'],
  ignoreDefaultArgs: ['--enable-automation'],
});

await ctx.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});

const page = await ctx.newPage();
console.log('goto', GROUP_URL);
await page.goto(GROUP_URL, { waitUntil: 'domcontentloaded' });

const addMemberBtn = page.getByRole('button', { name: '회원 추가' }).first();
await addMemberBtn.waitFor({ state: 'visible', timeout: 20000 });
console.log('click 회원 추가');
await addMemberBtn.click();

const combo = page.getByRole('combobox', { name: '그룹 멤버' });
await combo.waitFor();
await combo.click();
await combo.fill(email);
await combo.press('Enter');
console.log('typed email, pressed enter');

const msgBox = page.getByRole('textbox', { name: /초대 메시지|환영 메시지/ });
await msgBox.waitFor();
await msgBox.fill('메모요 Android 비공개 테스트에 초대합니다.');

await page.getByRole('checkbox', { name: '회원 직접 추가' }).click();
console.log('checked 직접 추가');

await page.getByRole('button', { name: '회원 추가', exact: true }).last().click();
console.log('clicked 회원 추가 submit');

try {
  const captchaFrame = page.frameLocator('iframe[title*="reCAPTCHA"], iframe[src*="recaptcha"]').first();
  const checkbox = captchaFrame.getByRole('checkbox', { name: /로봇이 아닙니다|I.m not a robot/ });
  await checkbox.waitFor({ timeout: 4000 });
  console.log('CAPTCHA detected, clicking checkbox');
  await checkbox.click();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: '회원 추가', exact: true }).last().click();
  console.log('clicked 회원 추가 again');
} catch {
  console.log('no captcha');
}

console.log('waiting for success heading or error…');
try {
  await page.getByRole('heading', { name: '회원이 업데이트되었습니다' }).waitFor({ timeout: 20000 });
  console.log('SUCCESS heading appeared');
} catch (e) {
  console.log('NO SUCCESS HEADING:', e.message);
  const bodyText = await page.locator('body').innerText();
  console.log('BODY TEXT:', bodyText.slice(0, 800));
}

console.log('will stay open for 30s so you can inspect. Press Ctrl+C to exit.');
await page.waitForTimeout(30000);
await ctx.close();
