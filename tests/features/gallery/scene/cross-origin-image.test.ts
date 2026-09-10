import assert from 'node:assert/strict';
import test from 'node:test';
import { createCrossOriginImage } from '../../../../features/gallery/scene/cross-origin-image.ts';

void test('gallery image loader enables anonymous CORS before assigning the image URL', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'Image');
  class FakeImage {
    crossOrigin: string | null = null;
    src = '';
  }
  Object.defineProperty(globalThis, 'Image', {
    configurable: true,
    value: FakeImage,
  });
  try {
    const image = createCrossOriginImage();
    assert.equal(image.crossOrigin, 'anonymous');
  } finally {
    if (previous) Object.defineProperty(globalThis, 'Image', previous);
    else Reflect.deleteProperty(globalThis, 'Image');
  }
});
