'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { CursorPage } from '@/application/ports/content-repository';
import type { WorkSummary } from '@/domain/work/work';
import { listGalleryWorks } from '@/infrastructure/http/same-origin-content-client';
import { createGalleryCatalogState, galleryCatalogReducer } from './catalog-state';

const PAGE_LIMIT = 48;
const SEARCH_DEBOUNCE_MS = 250;

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error('Content request failed');
}

export function useGalleryCatalog(initialPage: CursorPage<WorkSummary>) {
  const [state, dispatch] = useReducer(galleryCatalogReducer, initialPage, createGalleryCatalogState);
  const [query, setQuery] = useState('');
  const [retryVersion, setRetryVersion] = useState(0);
  const stateRef = useRef(state);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    abortRef.current?.abort();
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      dispatch({ type: 'initial-restored', requestId, page: initialPage });
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ type: 'search-started', requestId, query });
    const timer = window.setTimeout(async () => {
      try {
        const page = await listGalleryWorks({ limit: PAGE_LIMIT, query: normalizedQuery }, controller.signal);
        dispatch({ type: 'search-succeeded', requestId, page });
      } catch (error) {
        if (!isAbort(error)) dispatch({ type: 'search-failed', requestId, error: toError(error) });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [initialPage, query, retryVersion]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const loadMore = useCallback(async () => {
    const current = stateRef.current;
    if (current.status === 'loading-more' || current.status === 'searching' || !current.hasMore || !current.nextCursor) return;
    const requestId = ++requestIdRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ type: 'more-started', requestId });
    try {
      const page = await listGalleryWorks({ limit: PAGE_LIMIT, cursor: current.nextCursor, query: current.query }, controller.signal);
      dispatch({ type: 'more-succeeded', requestId, page });
    } catch (error) {
      if (!isAbort(error)) dispatch({ type: 'more-failed', requestId, error: toError(error) });
    }
  }, []);

  const retry = useCallback(() => {
    if (stateRef.current.status === 'load-more-error') { void loadMore(); return; }
    setRetryVersion((version) => version + 1);
  }, [loadMore]);

  return { items: state.items, query, setQuery, hasMore: state.hasMore, loadMore, status: state.status, error: state.error, retry };
}
