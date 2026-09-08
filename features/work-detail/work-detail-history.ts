type DetailHistory = Pick<History, 'state' | 'pushState' | 'replaceState'>;

export function workPath(id: string) {
  return `/works/${encodeURIComponent(id)}`;
}

export function workReturnTo(state: unknown): string {
  const value = state && typeof state === 'object' && 'returnTo' in state ? state.returnTo : null;
  return typeof value === 'string' && /^\/(?![\\/])/.test(value) ? value : '/gallery';
}

export function openWorkHistory(id: string, returnTo: string, history: DetailHistory = window.history) {
  history.pushState({ ...history.state, workDetail: true, returnTo: workReturnTo({ returnTo }) }, '', workPath(id));
}

export function closeWorkHistory(returnTo = '/gallery', history: DetailHistory = window.history) {
  const { workDetail: _detail, returnTo: _returnTo, ...state } = history.state ?? {};
  history.replaceState(state, '', workReturnTo({ returnTo }));
}
