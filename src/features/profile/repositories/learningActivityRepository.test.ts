import { strict as assert } from 'node:assert';
import { toLearnerDateKey } from './learningActivityRepository';

assert.equal(toLearnerDateKey(new Date('2026-08-23T14:59:00Z'), 'Asia/Tokyo'), '2026-08-23');
assert.equal(toLearnerDateKey(new Date('2026-08-23T15:01:00Z'), 'Asia/Tokyo'), '2026-08-24');
assert.equal(toLearnerDateKey(new Date('2026-08-23T23:59:00+09:00'), 'UTC'), '2026-08-23');
assert.equal(toLearnerDateKey(new Date('2026-08-23T15:01:00Z'), 'Invalid/Timezone'), '2026-08-24');

// eslint-disable-next-line no-console
console.log('✓ learningActivityRepository.test passed');
