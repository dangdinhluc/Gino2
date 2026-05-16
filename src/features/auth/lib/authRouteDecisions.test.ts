import { strict as assert } from 'node:assert';
import { decideAuthRouteAccess } from './authRouteDecisions';

assert.deepEqual(
  decideAuthRouteAccess({ area: 'admin', isAuthenticated: false, isAdmin: false, isSupabaseConfigured: true }),
  { status: 'redirect', to: '/admin/login', reason: 'missing-session' },
  'unauthenticated admin route should redirect to admin login',
);

assert.deepEqual(
  decideAuthRouteAccess({ area: 'admin', isAuthenticated: true, isAdmin: false, isSupabaseConfigured: true }),
  { status: 'denied', reason: 'missing-admin-role' },
  'authenticated non-admin should be denied from admin routes',
);

assert.deepEqual(
  decideAuthRouteAccess({ area: 'admin', isAuthenticated: true, isAdmin: true, isSupabaseConfigured: true }),
  { status: 'allowed' },
  'authenticated admin should be allowed into admin routes',
);

assert.deepEqual(
  decideAuthRouteAccess({ area: 'learner', isAuthenticated: false, isAdmin: false, isSupabaseConfigured: true }),
  { status: 'redirect', to: '/login', reason: 'missing-session' },
  'unauthenticated learner route should redirect to learner login',
);

assert.deepEqual(
  decideAuthRouteAccess({ area: 'learner', isAuthenticated: true, isAdmin: false, isSupabaseConfigured: true }),
  { status: 'allowed' },
  'authenticated learner route should not require admin role',
);

assert.deepEqual(
  decideAuthRouteAccess({ area: 'admin', isAuthenticated: false, isAdmin: false, isSupabaseConfigured: false }),
  { status: 'setup-required', reason: 'missing-supabase-config' },
  'missing Supabase env should show setup-required instead of pretending auth passed',
);
