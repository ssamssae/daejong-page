#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const roots = ["src", "public", "dist"].filter((path) => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
});

const textExtensions = new Set([
  ".astro",
  ".css",
  ".csv",
  ".gs",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
]);

const placeholderValues = new Set([
  "",
  "[REDACTED]",
  "<ADMIN_SECRET>",
  "<CHAT_ID>",
  "<GROUP_CHAT_ID>",
  "<TELEGRAM_BOT_ID>",
  "<TELEGRAM_BOT_TOKEN>",
  "anything",
]);

const checks = [
  {
    name: "private key marker",
    regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----|-----END [A-Z ]*PRIVATE KEY-----/,
  },
  {
    name: "telegram bot token value",
    regex: /\b\d{6,12}:[A-Za-z0-9_-]{25,}\b/,
  },
  {
    name: "partial telegram bot token identifier",
    regex: /\b\d{6,12}:(?:[A-Za-z0-9_-]+)?\.\.\.(?:[A-Za-z0-9_-]+)?\b/,
  },
  {
    name: "common API token value",
    regex: /\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|sk-(?:ant-)?[A-Za-z0-9_-]{16,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/,
  },
  {
    name: "ssh public key material",
    regex: /\bssh-ed25519\s+[A-Za-z0-9+/=]{40,}(?:\s+\S+)?/,
  },
  {
    name: "chat id numeric literal",
    regex: /\b(?:TELEGRAM_CHAT_ID|CRB_CHAT_ID|CLB_CHAT_ID|CHAT_ID|chat_id|chat id|chat=|from_user_id|allowlist)\b.{0,80}?\b-?\d{6,15}\b/i,
  },
  {
    name: "bot id numeric literal",
    regex: /\bbot\b.{0,80}?\bid\s+\d{6,12}\b/i,
  },
];

const secretAssignment = /\b[A-Z0-9_]*(?:SECRET|PASSWORD|TOKEN|API_KEY|BOT_TOKEN)[A-Z0-9_]*\b\s*[:=]\s*(["'])(.*?)\1/gi;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (entry.isFile()) {
      yield path;
    }
  }
}

function isTextFile(path) {
  const lower = path.toLowerCase();
  for (const ext of textExtensions) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

function isPlaceholder(value) {
  return placeholderValues.has(value) || value.startsWith("<") || value.startsWith("[") || value.startsWith("${");
}

function valueHasSecretShape(value) {
  for (const check of checks) {
    check.regex.lastIndex = 0;
    if (check.regex.test(value)) return true;
  }
  return false;
}

function isCompanyPublicHost(hostname) {
  const host = hostname.toLowerCase();
  return host === "kangdaejong.com" || host.endsWith(".kangdaejong.com");
}

function segmentLooksLikeToken(segment) {
  if (!/^[A-Za-z0-9_-]{20,}$/.test(segment)) return false;
  return /[A-Za-z]/.test(segment) && /\d/.test(segment);
}

function pathCarriesCredential(pathname) {
  // bot 바로 뒤 숫자는 단어 경계가 아니라서 값 정규식이 이 경로를 못 본다.
  if (/\/bot\d+:[A-Za-z0-9_-]+/i.test(pathname)) return true;
  for (const raw of pathname.split("/")) {
    if (raw.length === 0) continue;
    if (segmentLooksLikeToken(raw)) return true;
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded !== raw && segmentLooksLikeToken(decoded)) return true;
    } catch {
      // Keep the raw segment check above when the path is not valid percent-encoding.
    }
  }
  return false;
}

export function isCredentialFreePublicHttps(value) {
  if (typeof value !== "string" || !value.startsWith("https://") || /\s/.test(value)) return false;
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username !== "" || url.password !== "") return false;
  if (url.search !== "" || url.hash !== "") return false;
  if (!/^[a-z0-9.-]+$/i.test(url.hostname)) return false;
  if (url.hostname.startsWith(".") || url.hostname.endsWith(".") || url.hostname.includes("..")) return false;
  if (valueHasSecretShape(value)) return false;
  if (!isCompanyPublicHost(url.hostname)) return false;
  if (pathCarriesCredential(url.pathname)) return false;
  return true;
}

export function secretAssignmentViolations(line) {
  const found = [];
  secretAssignment.lastIndex = 0;
  for (const match of line.matchAll(secretAssignment)) {
    const value = match[2];
    if (isPlaceholder(value) || isCredentialFreePublicHttps(value)) continue;
    found.push("secret assignment literal");
  }
  return found;
}

function main() {
  const violations = [];
  for (const root of roots) {
    for (const path of walk(root)) {
      if (!isTextFile(path)) continue;
      let content;
      try {
        content = readFileSync(path, "utf8");
      } catch {
        continue;
      }
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        for (const check of checks) {
          check.regex.lastIndex = 0;
          if (check.regex.test(line)) {
            violations.push(`${path}:${index + 1}: ${check.name}`);
          }
        }
        for (const reason of secretAssignmentViolations(line)) {
          violations.push(`${path}:${index + 1}: ${reason}`);
        }
      });
    }
  }

  if (violations.length > 0) {
    console.error("Public secret scan failed:");
    for (const violation of violations) console.error(violation);
    process.exit(1);
  }

  console.log(`Public secret scan passed (${roots.join(", ")})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
