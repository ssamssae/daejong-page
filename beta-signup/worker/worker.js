#!/usr/bin/env node
// memoyo beta-tester polling worker
// 1) GET pendingGroupAdd → list of emails with status=registered
// 2) For each email: add to Google Groups via Playwright
// 3) POST markGroupAdded → set status=group_added
// 4) Telegram notification on success/failure

import { chromium } from 'playwright';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIPT_ID = 'AKfycbzAdwQvLm5c3veXrm-OnZ3hAwYqxq0gBnhxgk9TFmFRtrjPmKTd56SCa6Nf-zZaX3lDGA';
const APPS_SCRIPT_URL = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;
const ADMIN_SECRET = 'memoyo2026';

const TELEGRAM_BOT_TOKEN = '8312381862:AAHD9jAGeY9Z-ELOA23wyn71Ngymfn9hrcE';
const TELEGRAM_CHAT_ID = '538806975';

const GROUP_URL = 'https://groups.google.com/g/memoyo-beta-testers/members';
const USER_DATA_DIR = resolve(__dirname, '.chromium-profile');
const LOG_FILE = resolve(__dirname, 'worker.log');

async function log(line) {
  const ts = new Date().toISOString();
  const msg = `[${ts}] ${line}\n`;
  process.stdout.write(msg);
  try { await appendFile(LOG_FILE, msg); } catch {}
}

async function tg(text) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
    });
    if (!res.ok) await log(`telegram failed: ${res.status} ${await res.text()}`);
  } catch (e) {
    await log(`telegram error: ${e.message}`);
  }
}

async function getPending() {
  const url = `${APPS_SCRIPT_URL}?action=pendingGroupAdd&secret=${ADMIN_SECRET}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`pendingGroupAdd HTTP ${res.status}`);
  const json = await res.json();
  return json.pending || [];
}

async function markDone(email) {
  const url = `${APPS_SCRIPT_URL}?action=markGroupAdded&email=${encodeURIComponent(email)}&secret=${ADMIN_SECRET}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`markGroupAdded HTTP ${res.status}`);
  return res.json();
}

async function addOneToGroup(ctx, email) {
  const page = await ctx.newPage();
  try {
    await page.goto(GROUP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    if (page.url().includes('accounts.google.com')) {
      throw new Error('NEED_LOGIN');
    }

    const addMemberBtn = page.getByRole('button', { name: '회원 추가' }).first();
    try {
      await addMemberBtn.waitFor({ state: 'visible', timeout: 20000 });
    } catch (e) {
      const shot = resolve(__dirname, `debug-${Date.now()}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      await log(`could not find 회원 추가 button. url=${page.url()} screenshot=${shot}`);
      throw e;
    }
    await addMemberBtn.click();

    const combo = page.getByRole('combobox', { name: '그룹 멤버' });
    await combo.waitFor({ timeout: 10000 });
    await combo.click();
    await combo.fill(email);
    await combo.press('Enter');

    const msgBox = page.getByRole('textbox', { name: /초대 메시지|환영 메시지/ });
    await msgBox.waitFor({ timeout: 5000 });
    await msgBox.fill('메모요 Android 비공개 테스트에 초대합니다.');

    await page.getByRole('checkbox', { name: '회원 직접 추가' }).click();

    await page.getByRole('button', { name: '회원 추가', exact: true }).last().click();

    try {
      const captchaFrame = page.frameLocator('iframe[title*="reCAPTCHA"], iframe[src*="recaptcha"]').first();
      const checkbox = captchaFrame.getByRole('checkbox', { name: /로봇이 아닙니다|I.m not a robot/ });
      await checkbox.waitFor({ timeout: 4000 });
      await checkbox.click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: '회원 추가', exact: true }).last().click();
    } catch {
      // no captcha
    }

    const successHeading = page.getByRole('heading', { name: '회원이 업데이트되었습니다' });
    try {
      await successHeading.waitFor({ timeout: 15000 });
    } catch {
      const shot = resolve(__dirname, `debug-nosuccess-${Date.now()}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      const bodyText = await page.locator('body').innerText().catch(() => '');
      await log(`no success heading. url=${page.url()} screenshot=${shot} bodyExcerpt=${bodyText.slice(0, 600).replace(/\n/g, ' | ')}`);
      return { ok: false, error: '회원이 업데이트되었습니다 다이얼로그 안 뜸 (이메일 거부 가능성)' };
    }

    const confirmBtn = page.getByRole('button', { name: '확인' });
    await confirmBtn.waitFor({ timeout: 5000 });
    await confirmBtn.click();
    await page.waitForTimeout(500);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally {
    await page.close();
  }
}

async function main() {
  await mkdir(dirname(LOG_FILE), { recursive: true }).catch(() => {});
  await log('worker tick');

  let pending;
  try {
    pending = await getPending();
  } catch (e) {
    await log(`getPending failed: ${e.message}`);
    process.exit(0);
  }

  if (!pending.length) {
    await log('no pending');
    return;
  }

  await log(`pending=${pending.length}: ${pending.map(p => p.email).join(', ')}`);

  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    args: [
      '--disable-blink-features=AutomationControlled',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const results = { ok: [], fail: [], needLogin: false };

  try {
    for (const { email } of pending) {
      const r = await addOneToGroup(ctx, email);
      if (r.ok) {
        try { await markDone(email); } catch (e) { await log(`markDone failed for ${email}: ${e.message}`); }
        results.ok.push(email);
        await log(`added ${email}`);
      } else if (r.error === 'NEED_LOGIN') {
        results.needLogin = true;
        await log(`NEED_LOGIN while processing ${email}`);
        break;
      } else {
        results.fail.push({ email, error: r.error });
        await log(`failed ${email}: ${r.error}`);
      }
    }
  } finally {
    await ctx.close();
  }

  if (results.needLogin) {
    await tg(`⚠️ 메모요 베타 워커: Google 로그인 만료. 헤드풀 모드로 수동 로그인 필요.\nnode ${resolve(__dirname, 'login.js')} 실행해줘.`);
    return;
  }

  const parts = [];
  if (results.ok.length) parts.push(`✅ ${results.ok.length}명 Google Groups 추가: ${results.ok.join(', ')}`);
  if (results.fail.length) parts.push(`❌ 실패 ${results.fail.length}건:\n` + results.fail.map(f => `- ${f.email}: ${f.error}`).join('\n'));
  if (parts.length) await tg(parts.join('\n\n'));
}

main().catch(async (e) => {
  await log(`FATAL: ${e.stack || e.message}`);
  await tg(`🔥 메모요 베타 워커 오류: ${e.message}`);
  process.exit(1);
});
