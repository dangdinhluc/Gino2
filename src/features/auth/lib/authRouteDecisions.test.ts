import { strict as assert } from 'node:assert';
import { decideAuthRouteAccess } from './authRouteDecisions';

const base = { isSupabaseConfigured: true, staffRoleStatus: 'loaded' as const };

assert.deepEqual(decideAuthRouteAccess({ area: 'admin', isAuthenticated: false, isAdmin: false, ...base }), { status: 'redirect', to: '/admin/login', reason: 'missing-session' });
assert.deepEqual(decideAuthRouteAccess({ area: 'admin', isAuthenticated: true, isAdmin: false, ...base }), { status: 'denied', reason: 'missing-admin-role' });
assert.deepEqual(decideAuthRouteAccess({ area: 'admin', isAuthenticated: true, isAdmin: true, ...base }), { status: 'allowed' });
assert.deepEqual(decideAuthRouteAccess({ area: 'learner', isAuthenticated: false, isAdmin: false, ...base }), { status: 'redirect', to: '/login', reason: 'missing-session' });
assert.deepEqual(decideAuthRouteAccess({ area: 'learner', isAuthenticated: true, isAdmin: false, ...base }), { status: 'allowed' });
assert.deepEqual(decideAuthRouteAccess({ area: 'admin', isAuthenticated: false, isAdmin: false, staffRoleStatus: 'idle', isSupabaseConfigured: false }), { status: 'setup-required', reason: 'missing-supabase-config' });
assert.deepEqual(decideAuthRouteAccess({ area: 'admin', isAuthenticated: true, isAdmin: false, staffRoleStatus: 'loading', isSupabaseConfigured: true }), { status: 'loading-role' });
assert.deepEqual(decideAuthRouteAccess({ area: 'admin', isAuthenticated: true, isAdmin: false, staffRoleStatus: 'error', isSupabaseConfigured: true }), { status: 'role-error' });
assert.deepEqual(decideAuthRouteAccess({ area: 'learner', isAuthenticated: true, isAdmin: false, staffRoleStatus: 'error', isSupabaseConfigured: true }), { status: 'allowed' });
