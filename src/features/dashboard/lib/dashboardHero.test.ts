import { strict as assert } from 'node:assert';
import { isTimeInDashboardHeroSlot, pickRandomDashboardAnnouncement, selectDashboardHeroSlot } from './dashboardHero';

const slots = [
  { assetKey: 'meow', startTime: '05:00:00', endTime: '11:00:00', sortOrder: 1 },
  { assetKey: 'tanuki', startTime: '11:00:00', endTime: '17:00:00', sortOrder: 2 },
  { assetKey: 'sleeping_meow', startTime: '17:00:00', endTime: '05:00:00', sortOrder: 3 },
];

assert.equal(isTimeInDashboardHeroSlot(10 * 60, '05:00', '11:00'), true);
assert.equal(isTimeInDashboardHeroSlot(11 * 60, '05:00', '11:00'), false);
assert.equal(isTimeInDashboardHeroSlot(23 * 60, '17:00', '05:00'), true);
assert.equal(isTimeInDashboardHeroSlot(3 * 60, '17:00', '05:00'), true);
assert.equal(isTimeInDashboardHeroSlot(6 * 60, '17:00', '05:00'), false);
assert.equal(selectDashboardHeroSlot(slots, new Date(2026, 7, 11, 12, 0))?.assetKey, 'tanuki');
assert.equal(selectDashboardHeroSlot(slots, new Date(2026, 7, 11, 2, 0))?.assetKey, 'sleeping_meow');
assert.equal(pickRandomDashboardAnnouncement([{ type: 'review_due' }, { type: 'announcement', id: 'a' }, { type: 'announcement', id: 'b' }] as Array<{ type: string; id?: string }>, () => 0.99)?.id, 'b');
assert.equal(pickRandomDashboardAnnouncement([{ type: 'review_due' }]), null);
