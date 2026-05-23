const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

export function asset(path) {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (path.startsWith('/')) return BASE + path;
  return BASE + '/' + path;
}

export function loginPath() {
  return (BASE || '') + '/login';
}
