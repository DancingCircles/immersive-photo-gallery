import { listWorks } from '../../../../application/queries/list-works.ts';
import type { ListWorksInput } from '../../../../application/ports/content-repository.ts';
import { getContentRepository } from '../../../../infrastructure/config/content-source.ts';
import { dataResponse, errorResponse } from '../../../../application/http/content-response.ts';

export function parseGalleryRequest(request: Request): ListWorksInput {
  const params = new URL(request.url).searchParams;
  const rawLimit = params.get('limit');
  const parsedLimit = rawLimit === null ? 48 : Number(rawLimit);
  return {
    cursor: params.get('cursor') ?? undefined,
    limit: Number.isFinite(parsedLimit) ? parsedLimit : 48,
    query: params.get('query') ?? undefined,
  };
}

export async function GET(request: Request): Promise<Response> {
  try {
    const page = await listWorks(getContentRepository(), parseGalleryRequest(request));
    return dataResponse(page);
  } catch (error) {
    return errorResponse(error);
  }
}
