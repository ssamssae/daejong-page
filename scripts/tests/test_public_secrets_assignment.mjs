import test from 'node:test';
import assert from 'node:assert/strict';
import { isCredentialFreePublicHttps, secretAssignmentViolations } from '../verify-public-secrets.mjs';

const publicCss = "export const BRAND_TOKENS_CSS = 'https://kangdaejong.com/brand/current/tokens.css';";
const publicJson = "export const BRAND_TOKENS_JSON = 'https://kangdaejong.com/brand/current/tokens.json';";

test('credential-free public https assignment is not a secret', () => {
  assert.equal(isCredentialFreePublicHttps('https://kangdaejong.com/brand/current/tokens.css'), true);
  assert.equal(isCredentialFreePublicHttps('https://kangdaejong.com/brand/current/tokens.json'), true);
  assert.equal(isCredentialFreePublicHttps('https://work.kangdaejong.com/brand/current/tokens.css'), true);
  assert.deepEqual(secretAssignmentViolations(publicCss), []);
  assert.deepEqual(secretAssignmentViolations(publicJson), []);
});

test('secret-shaped assignment values still fail', () => {
  // 회사 호스트의 userinfo 만 이 표본이 가른다. example.com 은 호스트만으로도 실패한다.
  // 주소는 이어 붙인다. 한 줄로 두면 pw@회사도메인 이 메일 주소로 잡힌다.
  const companyUserinfo = fakeUrl([
    'https://name:pw@',
    'kangdaejong.com/brand/current/tokens.css',
  ]);
  const samples = [
    "export const API_TOKEN = 'sk-ant-abcdefghijklmnopqrstuvwxyz';",
    "export const GH_TOKEN = 'ghp_abcdefghijklmnopqrstuvwxyz123456';",
    "export const BOT_TOKEN = '123456789:AAHdz_example_token_value_xxxx';",
    "export const API_TOKEN = 'https://name:pw@example.com/brand/current/tokens.css';",
    "export const API_TOKEN = 'https://example.com/path?token=abcdef123456';",
    "export const API_TOKEN = 'http://example.com/brand/current/tokens.css';",
    "export const PASSWORD = 'correct-horse-battery-staple';",
    `export const API_TOKEN = '${companyUserinfo}';`,
  ];
  for (const line of samples) {
    assert.deepEqual(secretAssignmentViolations(line), ['secret assignment literal']);
  }
  assert.equal(isCredentialFreePublicHttps(companyUserinfo), false);
});

function assertSecretUrl(value, line) {
  assert.deepEqual(secretAssignmentViolations(line), ['secret assignment literal']);
  assert.equal(isCredentialFreePublicHttps(value), false);
}

// 가짜 주소는 파일 안에서 이어 붙이지 않는다. 한 줄로 두면 푸시 보호가 웹훅으로 본다.
function fakeUrl(parts) {
  return parts.join('');
}

test('slack webhook url assignment is a secret', () => {
  const value = fakeUrl([
    'https://hooks.slack.com/services/',
    'T0000AAAA/',
    'B0000BBBB/',
    'Abcd1234',
    'Efgh5678',
    'Ijkl9012',
  ]);
  assertSecretUrl(value, `SLACK_WEBHOOK_SECRET='${value}'`);
});

test('discord webhook url assignment is a secret', () => {
  const value = fakeUrl([
    'https://discord.com/api/webhooks/',
    '123456789012345678',
    '/',
    'AbcdEfgh1234',
    'IjklMnop5678',
    'QrstUvwx9012',
    'Yzab',
  ]);
  assertSecretUrl(value, `DISCORD_WEBHOOK_TOKEN='${value}'`);
});

test('telegram bot api url assignment is a secret', () => {
  const value = fakeUrl([
    'https://api.telegram.org/bot',
    '123456789',
    ':',
    'AAHexampleFAKE',
    'tokenVALUE1234567890a',
    '/sendMessage',
  ]);
  assertSecretUrl(value, `BOT_TOKEN_URL='${value}'`);
});

test('opaque path segment url assignment is a secret', () => {
  const value = fakeUrl([
    'https://example.com/s/',
    'Ab12Cd34',
    'Ef56Gh78',
    'Ij90Kl12',
    'Mn34Op56',
  ]);
  assertSecretUrl(value, `export const PATH_TOKEN = '${value}'`);
});

test('foreign host and company-host token path stay secrets', () => {
  assertSecretUrl(
    'https://example.com/brand/current/tokens.css',
    "export const API_TOKEN = 'https://example.com/brand/current/tokens.css';",
  );
  const companyTokenPath = fakeUrl([
    'https://kangdaejong.com/s/',
    'Ab12Cd34',
    'Ef56Gh78',
    'Ij90Kl12',
    'Mn34Op56',
  ]);
  assertSecretUrl(companyTokenPath, `export const API_TOKEN = '${companyTokenPath}';`);
  assertSecretUrl(
    'https://evilkangdaejong.com/brand/current/tokens.css',
    "export const API_TOKEN = 'https://evilkangdaejong.com/brand/current/tokens.css';",
  );
  assertSecretUrl(
    'https://kangdaejong.com.evil.com/brand/current/tokens.css',
    "export const API_TOKEN = 'https://kangdaejong.com.evil.com/brand/current/tokens.css';",
  );
});
