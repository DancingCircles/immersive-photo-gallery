import Link from 'next/link';
import { withPublicPath } from '@/shared/paths/public-path';

export default function NotFound() {
  return (
    <main className="route-error">
      <p>NOT FOUND</p>
      <h1>这件作品已经不在当前画廊中</h1>
      <Link href={withPublicPath('/gallery')}>返回画廊</Link>
    </main>
  );
}
