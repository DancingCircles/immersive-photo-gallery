import { getContentApiBaseUrl } from '@/infrastructure/config/content-source';

const HEALTHCHECK_TIMEOUT_MS = 1500;

export async function GET() {
  const source = process.env.CONTENT_SOURCE?.trim().toLowerCase() || 'local';
  if (source !== 'http') {
    return Response.json({ data: { source: 'local', connected: false } });
  }

  try {
    const baseUrl = getContentApiBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTHCHECK_TIMEOUT_MS);
    try {
      const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/readyz`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      return Response.json({
        data: { source: 'http', connected: response.ok },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return Response.json({ data: { source: 'http', connected: false } });
  }
}
