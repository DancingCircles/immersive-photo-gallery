import type { ContentRepository } from '../ports/content-repository.ts';

export function getWork(repository: ContentRepository, id: string) {
  return repository.getWork(id);
}
