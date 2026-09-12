import { ContentError } from '../../../../../../application/errors/content-error.ts';
import { errorResponse } from '../../../../../../application/http/content-response.ts';
import { getContentApiBaseUrl } from '../../../../../../infrastructure/config/content-source.ts';

type RouteContext = {
  params:
    | Promise<{ id: string; variant: string }>
    | { id: string; variant: string };
};

const cacheHeaders = ['cache-control', 'content-length', 'content-type', 'etag', 'last-modified'];

function upstreamURL(baseUrl: string, id: string, variant: string): string {
  if (!id || id.includes('/') || id.includes('\\') || !['image', 'thumbnail'].includes(variant)) {
    throw new ContentError('INVALID_MEDIA_REQUEST', 'Invalid content media request', {
      status: 400,
    });
  }
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(`v1/works/${encodeURIComponent(id)}/${variant}`, base).toString();
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  try {
    const { id, variant } = await context.params;
    const upstream = await fetch(upstreamURL(getContentApiBaseUrl(), id, variant), {
      headers: { Accept: 'image/avif,image/webp,image/*;q=0.8,*/*;q=0.5' },
    });
    if (!upstream.ok || !upstream.body) {
      throw new ContentError('CONTENT_MEDIA_UNAVAILABLE', 'Content media is unavailable', {
        status: upstream.status === 404 ? 404 : 502,
      });
    }
    const headers = new Headers();
    for (const name of cacheHeaders) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    return errorResponse(error);
  }
}
