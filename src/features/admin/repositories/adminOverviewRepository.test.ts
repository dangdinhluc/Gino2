import { strict as assert } from 'node:assert';
import { mapAdminAlertRow, type SupabaseAdminAlertRow } from './adminOverviewRepository';

const baseRow: SupabaseAdminAlertRow = {
  id: 'alert-seed-quality',
  severity: 'info',
  status: 'open',
  title: 'Seed data ready',
  body: 'Local Supabase seed includes curated sample courses and learner progress.',
  created_at: '2026-05-14T09:00:00Z',
};

const mapped = mapAdminAlertRow(baseRow);
assert.equal(mapped.id, 'alert-seed-quality');
assert.equal(mapped.severity, 'info');
assert.equal(mapped.status, 'open');
assert.equal(mapped.title, 'Seed data ready');
assert.equal(mapped.body.startsWith('Local Supabase seed'), true);
assert.equal(mapped.createdAt, '2026-05-14T09:00:00Z');

const criticalMapped = mapAdminAlertRow({ ...baseRow, severity: 'critical', status: 'resolved' });
assert.equal(criticalMapped.severity, 'critical', 'allowed severity should be preserved');
assert.equal(criticalMapped.status, 'resolved', 'allowed status should be preserved');

const fallbackMapped = mapAdminAlertRow({ ...baseRow, severity: 'unknown-severity', status: 'pending-something' });
assert.equal(fallbackMapped.severity, 'info', 'unknown severity should normalize to info');
assert.equal(fallbackMapped.status, 'open', 'unknown status should normalize to open');
