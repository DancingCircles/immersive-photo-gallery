import type { WorkSummary } from '../work/work.ts';

export type DailyEdit = {
  date: string;
  generatedAt: string;
  selectionVersion: string;
  works: WorkSummary[];
};
