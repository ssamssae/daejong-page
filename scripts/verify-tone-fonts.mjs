// verify-tone-fonts.mjs — 페이지 글자의 글꼴은 공용 글꼴 하나다 (T-261027-001).
// 왜: 10/27 대종님 「인사이트 실험실 등등 글씨체도 이상하고 … 우리 공용톤 적용된거 맞아?」 — T-261024-060 은 직접 숫자만
//     셌고 글꼴 종류(코드체·명조·Georgia)는 어느 검사도 보지 않아, 작업장 하위 페이지에 그대로 남았다
//     (실측: AI 용어집 글자 40%·이슈·작업일지 28%·뉴스레터 25% 가 코드체, 바이브코딩 제목이 명조).
// 규칙: font·font-family 선언에
//   ① 명조(Georgia·Noto Serif·var(--serif)·serif 일반 글꼴)를 쓰면 실패.
//   ② 코드체(var(--mono)·monospace·JetBrains Mono)는 그 줄에 `tone:code` 와 이유가 있을 때만 — 실제 코드·명령어·도구 아이콘 글자.
//   제품 그림(ProductArt.astro)은 그림 안 글자라 보지 않는다(--art-serif 로 그 그림 안에서만 명조).
// 사용: node scripts/verify-tone-fonts.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const INCLUDE = /\.(css|astro|html)$/;
const EXCLUDE = /^(node_modules\/|dist\/|public\/newsletter\/|public\/og\/|public\/pagefind\/|scripts\/|tests\/)|(^|\/)_retired\/|^src\/components\/ProductArt\.astro$/;
const FONT_DECL = /(?<![\w-])font(?:-family)?\s*:\s*([^;{}]*)/g;
const SERIF = /Georgia|Noto Serif|var\(--serif\)|(?<![\w-])serif\b/;
const MONO = /var\(--mono\b|monospace|JetBrains Mono/;

const files = execFileSync('git', ['ls-files', 'src', 'public'], { encoding: 'utf8' }).split('\n')
  .filter((file) => file && INCLUDE.test(file) && !EXCLUDE.test(file));
const errors = [];
for (const file of files) {
  readFileSync(file, 'utf8').split('\n').forEach((raw, index) => {
    const line = raw.replace(/\/\*.*?\*\//g, '');
    for (const match of line.matchAll(FONT_DECL)) {
      const value = match[1];
      if (SERIF.test(value)) errors.push(`${file}:${index + 1}: 명조 글꼴 — 공용 글꼴(var(--tone-font))을 쓴다  ${raw.trim().slice(0, 90)}`);
      if (MONO.test(value) && !/tone:code:\s*\S/.test(raw)) {
        errors.push(`${file}:${index + 1}: 코드체 — 실제 코드가 아니면 var(--tone-font), 코드면 그 줄에 tone:code 이유  ${raw.trim().slice(0, 90)}`);
      }
    }
  });
}
if (errors.length) {
  console.error(errors.slice(0, 40).join('\n'));
  console.error(`tone fonts: 실패 ${errors.length} 건 (${files.length} files)`);
  process.exit(1);
}
console.log(`tone fonts: 통과 — 명조 0, 이유 없는 코드체 0 (${files.length} files)`);
