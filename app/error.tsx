'use client';

import Link from 'next/link';
import { withPublicPath } from '@/shared/paths/public-path';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="route-error">
      <p>CONTENT ERROR</p>
      <h1>作品内容暂时无法加载</h1>
      <div>
        <button type="button" onClick={reset}>重试</button>
        <Link href={withPublicPath('/gallery')}>返回画廊</Link>
      </div>
    </main>
  );
}
