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

  it('calculates point distance to planes and retrieves plane vectors', () => {
    const frustum = new Frustum();
    const identityVP = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
    frustum.updateFromViewProjection(identityVP);

    const plane0 = frustum.getPlane(0);
    expect(plane0.length).toBe(4);

    // Left plane is x >= -1 => x + 1 >= 0
    const distAtOrigin = frustum.distanceToPlane(0, { x: 0, y: 0, z: 0 });
    expect(distAtOrigin).toBeGreaterThan(0);

    const distFarLeft = frustum.distanceToPlane(0, { x: -5, y: 0, z: 0 });
    expect(distFarLeft).toBeLessThan(0);

    expect(() => frustum.getPlane(6)).toThrow(RangeError);
    expect(() => frustum.distanceToPlane(-1, { x: 0, y: 0, z: 0 })).toThrow(RangeError);
  });

  it('normalizes arbitrary plane equations and handles degenerate normals', () => {
    const [nx, ny, nz, d] = Frustum.normalizePlane(0, 3, 4, 10);
    expect(nx).toBeCloseTo(0.0, 4);
    expect(ny).toBeCloseTo(0.6, 4);
    expect(nz).toBeCloseTo(0.8, 4);
    expect(d).toBeCloseTo(2.0, 4);

    const degenerate = Frustum.normalizePlane(0, 0, 0, 5);
    expect(degenerate).toEqual([0, 0, 0, 0]);
  });
});

