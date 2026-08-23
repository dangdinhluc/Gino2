const URL_BASE = 'https://push.invalid';

export function appRelativeRoute(actionUrl: string | null): string | null {
  if (!actionUrl || !actionUrl.startsWith('/') || actionUrl.startsWith('//')) return null;
  try {
    const parsed = new URL(actionUrl, URL_BASE);
    return parsed.origin === URL_BASE ? actionUrl : null;
  } catch {
    return null;
  }
}

export function actionLink(actionUrl: string | null, appUrl: string): string | null {
  const route = appRelativeRoute(actionUrl);
  if (!route || !appUrl.trim()) return null;
  try {
    const base = new URL(`${appUrl.trim().replace(/\/+$/, '')}/`);
    const destination = new URL(route.slice(1), base);
    return destination.origin === base.origin && destination.href.startsWith(base.href) ? destination.href : null;
  } catch {
    return null;
  }
}
