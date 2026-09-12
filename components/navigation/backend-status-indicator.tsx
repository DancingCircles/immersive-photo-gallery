'use client';

import { useEffect, useState } from 'react';

type BackendStatus = 'loading' | 'local' | 'connected' | 'unavailable';

export default function BackendStatusIndicator() {
  const [status, setStatus] = useState<BackendStatus>('loading');

  useEffect(() => {
    let active = true;

    const checkStatus = async () => {
      try {
        const response = await fetch('/api/content/status', {
          cache: 'no-store',
        });
        const body = (await response.json()) as {
          data?: { source?: string; connected?: boolean };
        };
        if (!active) return;
        if (body.data?.source !== 'http') {
          setStatus('local');
        } else {
          setStatus(body.data.connected ? 'connected' : 'unavailable');
        }
      } catch {
        if (active) setStatus('unavailable');
      }
    };

    void checkStatus();
    const interval = window.setInterval(checkStatus, 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (status === 'loading' || status === 'local') return null;

  const connected = status === 'connected';
  return (
    <output
      className={`backend-status-indicator${connected ? ' is-connected' : ' is-unavailable'}`}
      aria-label={connected ? '后端服务已连接' : '后端服务未连接'}
      title={connected ? '后端服务已连接' : '后端服务未连接'}
    />
  );
}
