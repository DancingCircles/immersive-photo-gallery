import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('../../../features/work-detail/work-detail-view.tsx', import.meta.url), 'utf8');

void test('image interpretation is explicitly labelled as AI-generated', () => {
  assert.match(viewSource, /aria-label="AI 图像解读"/);
  assert.match(viewSource, /<h2>AI 图像解读<\/h2>/);
});
