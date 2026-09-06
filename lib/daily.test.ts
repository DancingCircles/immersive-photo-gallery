import assert from 'node:assert/strict';
import test from 'node:test';
import { DAILY_SPHERE_CENTER_Y, dailyCardCopy, dailyCardPose, dailyRoomPalette, dailyWorks } from './daily.ts';

void test('daily recommendation contains twelve works', () => {
  assert.equal(dailyWorks.length, 12);
});

void test('daily card copy mirrors the gallery metadata', () => {
  const work = dailyWorks[0];
  assert.deepEqual(dailyCardCopy(work, 0, dailyWorks.length), {
    photographer: work.photographer,
    title: work.title.toUpperCase().slice(0, 25),
    category: work.category.toUpperCase(),
    year: work.publishedAt.slice(0, 4),
    index: '01 / 12',
  });
});

void test('daily cards use equal angular spacing on one sphere', () => {
  const center = dailyCardPose(0, 1, 0);
  const right = dailyCardPose(0, 2, 0);
  const upper = dailyCardPose(1, 1, 0);

  assert.ok(Math.abs((right.theta - center.theta) - (upper.phi - center.phi)) < 1e-9);
  for (const pose of [center, right, upper]) {
    const radius = Math.hypot(pose.x, pose.y - DAILY_SPHERE_CENTER_Y, pose.z);
    assert.ok(Math.abs(radius - 10.05) < 1e-9);
  }
});

void test('daily sphere leaves an unobstructed floor zone for the chair', () => {
  const lowestCard = dailyCardPose(2, 1, 0);

  assert.equal(DAILY_SPHERE_CENTER_Y, 9);
  assert.ok(lowestCard.y - 1.85 > 1.5);
});

void test('daily room uses neutral white instead of the gallery warm gray', () => {
  assert.deepEqual(dailyRoomPalette('light'), {
    background: '#ffffff',
    floor: '#f7f7f7',
  });
});
