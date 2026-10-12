import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 작업일지 / 뉴스레터 / 인사이트 공통 스키마.
// 마이그레이션 스크립트(scripts/migrate-content.mjs)가 title/date 를 주입한다.
const schema = z.object({
  title: z.string(),
  date: z.string(), // YYYY-MM-DD
  version: z.string().optional(),
  summary: z.string().optional(),
  // T-261012-042: 그날이 흐름을 바꾼 날이면 짧은 제목 한 줄. 타임라인 「주요 마일스톤」이 이 값을 자동으로 읽는다.
  milestone: z.string().optional(),
});

const mk = (dir: string) =>
  defineCollection({
    loader: glob({ pattern: '**/*.md', base: `./src/content/${dir}` }),
    schema,
  });

export const collections = {
  worklog: mk('worklog'),
  newsletter: mk('newsletter'),
  insights: mk('insights'),
  notes: defineCollection({ loader: glob({ pattern: ['knowhow/*.md', 'issues/*.md', 'dead-ends/*.md'], base: './public', generateId: ({ entry }) => entry.replace(/\.md$/, '') }) }),
};
