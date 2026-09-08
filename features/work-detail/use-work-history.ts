'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { closeWorkHistory, openWorkHistory, workPath } from './work-detail-history';

export function useWorkHistory(id: string | null, ready: boolean, close: () => void) {
  const returnTo = useRef('/gallery');
  const active = useRef(false);
  const popped = useRef(false);
  const [popVersion, setPopVersion] = useState(0);
  const begin = useCallback((workId: string) => {
    if (active.current) return;
    returnTo.current = window.location.pathname + window.location.search + window.location.hash;
    active.current = true;
    popped.current = false;
    openWorkHistory(workId, returnTo.current);
  }, []);
  const finish = useCallback(() => {
    if (active.current && !popped.current) closeWorkHistory(returnTo.current);
    active.current = false;
    popped.current = false;
  }, []);
  useEffect(() => {
    if (!id) return;
    const onPop = (event: PopStateEvent) => {
      if (!active.current || window.location.pathname === workPath(id)) return;
      // Keep the mounted source scene alive until its existing return animation finishes.
      event.stopImmediatePropagation();
      popped.current = true;
      setPopVersion((version) => version + 1);
    };
    window.addEventListener('popstate', onPop, true);
    return () => window.removeEventListener('popstate', onPop, true);
  }, [id]);
  useEffect(() => {
    if (ready && popped.current) close();
  }, [ready, close, popVersion]);
  return { begin, finish };
}
