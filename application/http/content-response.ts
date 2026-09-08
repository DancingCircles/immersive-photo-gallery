import { ContentError } from '../errors/content-error.ts';

type ResponseInitLike = ResponseInit;

export function dataResponse<T>(data: T, init?: ResponseInitLike): Response {
  return Response.json({ data }, init);
}

export function errorResponse(error: unknown): Response {
  const contentError = error instanceof ContentError ? error : undefined;
  const requestId = contentError?.requestId ?? crypto.randomUUID();
  const status = contentError?.status ?? 500;
  const body = contentError
    ? { code: contentError.code, message: contentError.message, requestId }
    : { code: 'CONTENT_INTERNAL_ERROR', message: 'Content request failed', requestId };
  return Response.json({ error: body }, { status });
}
