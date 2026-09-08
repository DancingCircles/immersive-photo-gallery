import type { ContentRepository } from '../ports/content-repository.ts';

export function getDailyEdit(repository: ContentRepository, date: string) {
  return repository.getDailyEdit(date);
}
