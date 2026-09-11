import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('../../../features/work-detail/work-detail-view.tsx', import.meta.url), 'utf8');

void test('image interpretation is explicitly labelled as AI-generated', () => {
  assert.match(viewSource, /aria-label="AI 图像解读"/);
  assert.match(viewSource, /<h2>AI 图像解读<\/h2>/);
});

void test('generation prompts are collapsed behind an accessible disclosure', () => {
  assert.match(viewSource, /<details className="work-detail-copy__prompt-disclosure">/);
  assert.match(viewSource, /<summary>/);
  assert.match(viewSource, /AI 生成提示词/);
});
