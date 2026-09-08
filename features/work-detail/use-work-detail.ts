'use client';

import { useEffect, useState } from 'react';
import type { WorkDetail } from '@/domain/work/work';
import { getWork } from '@/infrastructure/http/same-origin-content-client';

export type WorkDetailState =
  | { status: 'idle' | 'loading'; work: null; error: null }
  | { status: 'ready'; work: WorkDetail; error: null }
  | { status: 'error'; work: null; error: Error };

export function useWorkDetail(id: string | null): WorkDetailState {
  const [result, setResult] = useState<{ id: string | null; state: WorkDetailState }>({
    id: null, state: { status: 'idle', work: null, error: null },
  });
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const work = await getWork(id, controller.signal);
        if (work.id !== id) throw new Error('作品详情暂时无法加载');
        if (!controller.signal.aborted) setResult({ id, state: { status: 'ready', work, error: null } });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ id, state: { status: 'error', work: null, error: error instanceof Error ? error : new Error('作品详情暂时无法加载') } });
      }
    })();
    return () => controller.abort();
  }, [id]);
  if (!id) return { status: 'idle', work: null, error: null };
  return result.id === id ? result.state : { status: 'loading', work: null, error: null };
}
