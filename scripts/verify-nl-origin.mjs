import { validateNlCollectorOrigin } from '../src/lib/nl-collector.mjs';

const result = validateNlCollectorOrigin(process.env.PUBLIC_NL_EVENTS_ORIGIN, {
  requireWorkersDev: true,
});

if (!result.ok) {
  console.error(`newsletter collector origin verification failed: ${result.reason}`);
  process.exit(1);
}

console.log('newsletter collector origin verification passed');
