import { describe, it, expect } from 'vitest';
import { Frustum } from '../src/math/frustum';

describe('Frustum Culling', () => {
  it('correctly accepts inside spheres and rejects outside spheres', () => {
    const frustum = new Frustum();
    // Identity view-proj gives clipping cube [-1, 1]
    const identityVP = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
    frustum.updateFromViewProjection(identityVP);

    // Center sphere inside
    expect(frustum.intersectsSphere({ center: { x: 0, y: 0, z: 0 }, radius: 0.5 })).toBe(true);

    // Far outside along X
    expect(frustum.intersectsSphere({ center: { x: 5, y: 0, z: 0 }, radius: 0.5 })).toBe(false);

    // Barely touching the near boundary
    expect(frustum.intersectsSphere({ center: { x: 1.2, y: 0, z: 0 }, radius: 0.3 })).toBe(true);
  });
});
