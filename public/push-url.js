/* Shared by the service worker and its static URL contract tests. */
(function registerPushUrlHelpers(global) {
  const URL_BASE = 'https://push.invalid';

  function appRelativeRoute(value) {
    if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
    try {
      const parsed = new URL(value, URL_BASE);
      return parsed.origin === URL_BASE ? value : null;
    } catch {
      return null;
    }
  }

  function resolvePushDestination(value, scope) {
    const route = appRelativeRoute(value);
    if (!route) return scope;
    try {
      const base = new URL(scope);
      const destination = new URL(route.slice(1), base);
      return destination.origin === base.origin && destination.href.startsWith(base.href) ? destination.href : scope;
    } catch {
      return scope;
    }
  }

  global.TokuteiPushUrl = { appRelativeRoute, resolvePushDestination };
})(globalThis);
