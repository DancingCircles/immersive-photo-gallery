import { getDailyEdit } from '../../../../../application/queries/get-daily-edit.ts';
import { dataResponse, errorResponse } from '../../../../../application/http/content-response.ts';
import { getContentRepository } from '../../../../../infrastructure/config/content-source.ts';

type RouteContext = { params: Promise<{ date: string }> | { date: string } };

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  try {
    const params = await context.params;
    return dataResponse(await getDailyEdit(getContentRepository(), params.date));
  } catch (error) {
    return errorResponse(error);
  }
}
