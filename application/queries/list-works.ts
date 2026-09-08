import type { ContentRepository, ListWorksInput } from '../ports/content-repository.ts';

export function listWorks(repository: ContentRepository, input: ListWorksInput) {
  const requestedLimit = Number.isFinite(input.limit) ? Math.trunc(input.limit) : 1;
  return repository.listWorks({
    ...input,
    query: input.query?.trim() || undefined,
    limit: Math.min(Math.max(requestedLimit, 1), 60),
  });
}
