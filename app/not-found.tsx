import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="route-error">
      <p>NOT FOUND</p>
      <h1>这件作品已经不在当前画廊中</h1>
      <Link href="/gallery">返回画廊</Link>
    </main>
  );
}
