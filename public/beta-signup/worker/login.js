#!/usr/bin/env node
// One-shot: open headful browser so you can sign in to Google once.
// The session is stored in .chromium-profile and reused by worker.js.

import { chromium } from 'playwright';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = resolve(__dirname, '.chromium-profile');

const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
  channel: 'chrome',
  headless: false,
  viewport: { width: 1280, height: 800 },
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
  ],
  ignoreDefaultArgs: ['--enable-automation'],
});

await ctx.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});

const page = ctx.pages()[0] ?? await ctx.newPage();
await page.goto('https://groups.google.com/g/memoyo-beta-testers/members');

console.log('Sign in to Google (gayoremix@gmail.com) in the opened window.');
console.log('When you can see the members list, close the browser.');

await new Promise((resolve) => {
  ctx.on('close', resolve);
});
