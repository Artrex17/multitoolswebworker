import { describe, it, expect } from 'vitest';
import { removeColor } from './svg';

function pixel(data: Uint8ClampedArray, i: number) {
  return { r: data[i * 4], g: data[i * 4 + 1], b: data[i * 4 + 2], a: data[i * 4 + 3] };
}

describe('removeColor', () => {
  it('makes an exact color match fully transparent', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 10, 20, 30, 255]);
    removeColor(data, { r: 255, g: 255, b: 255 }, 20);
    expect(pixel(data, 0).a).toBe(0);
  });

  it('leaves a color far outside the tolerance fully opaque', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 10, 20, 30, 255]);
    removeColor(data, { r: 255, g: 255, b: 255 }, 20);
    expect(pixel(data, 1).a).toBe(255);
  });

  it('feathers a color near the tolerance boundary instead of a hard cutoff', () => {
    // distance from white ≈ 24.2, inside (tolerance=20, tolerance+feather=30]
    const data = new Uint8ClampedArray([241, 241, 241, 255]);
    removeColor(data, { r: 255, g: 255, b: 255 }, 20);
    const alpha = pixel(data, 0).a;
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(255);
  });
});
