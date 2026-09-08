import type { CursorPage } from '@/application/ports/content-repository';
import type { WorkSummary } from '@/domain/work/work';

export type GalleryCatalogStatus =
  | 'ready'
  | 'searching'
  | 'loading-more'
  | 'search-error'
  | 'load-more-error';

export type GalleryCatalogState = {
  items: WorkSummary[];
  query: string;
  nextCursor: string | null;
  hasMore: boolean;
  requestId: number;
  status: GalleryCatalogStatus;
  error: Error | null;
};

export type GalleryCatalogAction =
  | { type: 'search-started'; requestId: number; query: string }
  | { type: 'search-succeeded'; requestId: number; page: CursorPage<WorkSummary> }
  | { type: 'search-failed'; requestId: number; error: Error }
  | { type: 'more-started'; requestId: number }
  | { type: 'more-succeeded'; requestId: number; page: CursorPage<WorkSummary> }
  | { type: 'more-failed'; requestId: number; error: Error }
  | { type: 'initial-restored'; requestId: number; page: CursorPage<WorkSummary> };

function fromPage(
  page: CursorPage<WorkSummary>,
  query: string,
  requestId: number,
): GalleryCatalogState {
  return {
    items: page.items,
    query,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    requestId,
    status: 'ready',
    error: null,
  };
}

export function createGalleryCatalogState(
  page: CursorPage<WorkSummary>,
): GalleryCatalogState {
  return fromPage(page, '', 0);
}

function uniqueById(items: WorkSummary[]): WorkSummary[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function galleryCatalogReducer(
  state: GalleryCatalogState,
  action: GalleryCatalogAction,
): GalleryCatalogState {
  if ('requestId' in action && action.requestId < state.requestId) return state;

  switch (action.type) {
    case 'search-started':
      return {
        ...state,
        items: [],
        query: action.query,
        nextCursor: null,
        hasMore: false,
        requestId: action.requestId,
        status: 'searching',
        error: null,
      };
    case 'search-succeeded':
      if (action.requestId !== state.requestId) return state;
      return fromPage(action.page, state.query, action.requestId);
    case 'search-failed':
      if (action.requestId !== state.requestId) return state;
      return { ...state, status: 'search-error', error: action.error };
    case 'more-started':
      return {
        ...state,
        requestId: action.requestId,
        status: 'loading-more',
        error: null,
      };
    case 'more-succeeded':
      if (action.requestId !== state.requestId) return state;
      return {
        ...state,
        items: uniqueById([...state.items, ...action.page.items]),
        nextCursor: action.page.nextCursor,
        hasMore: action.page.hasMore,
        status: 'ready',
        error: null,
      };
    case 'more-failed':
      if (action.requestId !== state.requestId) return state;
      return { ...state, status: 'load-more-error', error: action.error };
    case 'initial-restored':
      return fromPage(action.page, '', action.requestId);
  }
}
