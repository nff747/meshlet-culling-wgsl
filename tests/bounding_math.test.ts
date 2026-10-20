import { describe, it, expect } from 'vitest';
import {
  computeBoundingSphere,
  computeNormalCone,
  computeAABB,
  testSphereAABBIntersection
} from '../src/core/bounding_math';
import { Vec3, BoundingSphere, AABB } from '../src/core/types';

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

  it('computes accurate axis-aligned bounding boxes (AABB)', () => {
    const emptyBox = computeAABB([]);
    expect(emptyBox.min).toEqual({ x: 0, y: 0, z: 0 });
    expect(emptyBox.max).toEqual({ x: 0, y: 0, z: 0 });

    const points: Vec3[] = [
      { x: -10, y: 5, z: 2 },
      { x: 15, y: -3, z: -8 },
      { x: 0, y: 20, z: 1 },
    ];
    const aabb = computeAABB(points);
    expect(aabb.min).toEqual({ x: -10, y: -3, z: -8 });
    expect(aabb.max).toEqual({ x: 15, y: 20, z: 2 });
  });

  it('evaluates sphere-AABB intersection correctly', () => {
    const box: AABB = {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 10, y: 10, z: 10 }
    };

    const insideSphere: BoundingSphere = {
      center: { x: 5, y: 5, z: 5 },
      radius: 1
    };
    expect(testSphereAABBIntersection(insideSphere, box)).toBe(true);

    const cornerIntersectSphere: BoundingSphere = {
      center: { x: 11, y: 11, z: 11 },
      radius: 2
    };
    expect(testSphereAABBIntersection(cornerIntersectSphere, box)).toBe(true);

    const disjointSphere: BoundingSphere = {
      center: { x: 25, y: 25, z: 25 },
      radius: 2
    };
    expect(testSphereAABBIntersection(disjointSphere, box)).toBe(false);
  });
});

