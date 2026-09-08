import { getWork } from '../../../../../application/queries/get-work.ts';
import { dataResponse, errorResponse } from '../../../../../application/http/content-response.ts';
import { getContentRepository } from '../../../../../infrastructure/config/content-source.ts';

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  try {
    const params = await context.params;
    return dataResponse(await getWork(getContentRepository(), decodeURIComponent(params.id)));
  } catch (error) {
    return errorResponse(error);
  }
}
