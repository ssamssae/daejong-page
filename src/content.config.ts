import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 작업일지 / 뉴스레터 / 인사이트 공통 스키마.
// 마이그레이션 스크립트(scripts/migrate-content.mjs)가 title/date 를 주입한다.
const schema = z.object({
  title: z.string(),
  date: z.string(), // YYYY-MM-DD
  version: z.string().optional(),
  summary: z.string().optional(),
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
};
