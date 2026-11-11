import test from 'node:test';
import assert from 'node:assert/strict';
import { isCredentialFreePublicHttps, secretAssignmentViolations } from '../verify-public-secrets.mjs';

const publicCss = "export const BRAND_TOKENS_CSS = 'https://kangdaejong.com/brand/current/tokens.css';";
const publicJson = "export const BRAND_TOKENS_JSON = 'https://kangdaejong.com/brand/current/tokens.json';";

test('credential-free public https assignment is not a secret', () => {
  assert.equal(isCredentialFreePublicHttps('https://kangdaejong.com/brand/current/tokens.css'), true);
  assert.equal(isCredentialFreePublicHttps('https://kangdaejong.com/brand/current/tokens.json'), true);
  assert.deepEqual(secretAssignmentViolations(publicCss), []);
  assert.deepEqual(secretAssignmentViolations(publicJson), []);
});

test('secret-shaped assignment values still fail', () => {
  const samples = [
    "export const API_TOKEN = 'sk-ant-abcdefghijklmnopqrstuvwxyz';",
    "export const GH_TOKEN = 'ghp_abcdefghijklmnopqrstuvwxyz123456';",
    "export const BOT_TOKEN = '123456789:AAHdz_example_token_value_xxxx';",
    "export const API_TOKEN = 'https://user:secret@example.com/brand/current/tokens.css';",
    "export const API_TOKEN = 'https://example.com/path?token=abcdef123456';",
    "export const API_TOKEN = 'http://example.com/brand/current/tokens.css';",
    "export const PASSWORD = 'correct-horse-battery-staple';",
  ];
  for (const line of samples) {
    assert.deepEqual(secretAssignmentViolations(line), ['secret assignment literal']);
  }
});
