import { describe, it, expect } from 'vitest';
import { computeBoundingSphere, computeNormalCone } from '../src/core/bounding_math';
import { Vec3 } from '../src/core/types';

describe('Bounding Geometry Math', () => {
  it('encloses all vertices strictly inside bounding sphere', () => {
    const vertices: Vec3[] = [
      { x: -1, y: -1, z: -1 },
      { x: 1, y: 1, z: 1 },
      { x: 2, y: 0, z: 0 },
      { x: 0, y: 3, z: 0 },
      { x: 0, y: 0, z: -2 },
    ];

    const sphere = computeBoundingSphere(vertices);
    expect(sphere.radius).toBeGreaterThan(0);

    for (const v of vertices) {
      const dx = v.x - sphere.center.x;
      const dy = v.y - sphere.center.y;
      const dz = v.z - sphere.center.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      expect(dist).toBeLessThanOrEqual(sphere.radius + 1e-4);
    }
  });

  it('computes correct normal cone angle and axis for coplanar triangles', () => {
    const normals: Vec3[] = [
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 1, z: 0 },
    ];
    const apex: Vec3 = { x: 0, y: 0, z: 0 };
    const cone = computeNormalCone(normals, apex);

    expect(cone.axis.y).toBeCloseTo(1.0, 4);
    expect(cone.angle).toBeCloseTo(0.0, 4);
    expect(cone.cutoff).toBeCloseTo(0.0, 4);
  });
});
