import { Vec3, BoundingSphere, NormalCone } from './types';

/**
 * Ritter's bounding sphere generator for fast, tight cluster enclosing spheres.
 */
export function computeBoundingSphere(vertices: Vec3[]): BoundingSphere {
  if (vertices.length === 0) {
    return { center: { x: 0, y: 0, z: 0 }, radius: 0 };
  }

  // Find extreme points along coordinate axes
  let minX = vertices[0], maxX = vertices[0];
  let minY = vertices[0], maxY = vertices[0];
  let minZ = vertices[0], maxZ = vertices[0];

  for (const v of vertices) {
    if (v.x < minX.x) minX = v;
    if (v.x > maxX.x) maxX = v;
    if (v.y < minY.y) minY = v;
    if (v.y > maxY.y) maxY = v;
    if (v.z < minZ.z) minZ = v;
    if (v.z > maxZ.z) maxZ = v;
  }

  // Pick pair with max distance
  const dx = distSq(minX, maxX);
  const dy = distSq(minY, maxY);
  const dz = distSq(minZ, maxZ);

  let p1 = minX, p2 = maxX;
  let maxSpan = dx;
  if (dy > maxSpan) { maxSpan = dy; p1 = minY; p2 = maxY; }
  if (dz > maxSpan) { maxSpan = dz; p1 = minZ; p2 = maxZ; }

  let center: Vec3 = {
    x: (p1.x + p2.x) * 0.5,
    y: (p1.y + p2.y) * 0.5,
    z: (p1.z + p2.z) * 0.5,
  };
  let radius = Math.sqrt(maxSpan) * 0.5;

  // Welzl outlier pass\n  // Expand sphere to enclose all outliers
  for (const v of vertices) {
    const d = Math.sqrt(distSq(v, center));
    if (d > radius) {
      const alpha = (d - radius) / (2.0 * d);
      center.x += (v.x - center.x) * alpha;
      center.y += (v.y - center.y) * alpha;
      center.z += (v.z - center.z) * alpha;
      radius = (radius + d) * 0.5;
    }
  }

  return { center, radius };
}

/**
 * Computes tight cluster normal cone (axis + cutoff angle) from triangle face normals.
 */
export function computeNormalCone(normals: Vec3[], apex: Vec3): NormalCone {
  if (normals.length === 0) {
    return { apex, axis: { x: 0, y: 1, z: 0 }, cutoff: 1.0, angle: 0 };
  }

  // 1. Average surface normal
  let avg: Vec3 = { x: 0, y: 0, z: 0 };
  for (const n of normals) {
    avg.x += n.x;
    avg.y += n.y;
    avg.z += n.z;
  }
  const len = Math.sqrt(avg.x * avg.x + avg.y * avg.y + avg.z * avg.z) || 1.0;
  const axis: Vec3 = { x: avg.x / len, y: avg.y / len, z: avg.z / len };

  // 2. Find maximum angle deviation between axis and any triangle normal
  let minDot = 1.0;
  for (const n of normals) {
    const dot = axis.x * n.x + axis.y * n.y + axis.z * n.z;
    if (dot < minDot) minDot = dot;
  }

  // Clamped dot product in [-1, 1]
  minDot = Math.max(-1.0, Math.min(1.0, minDot));
  const angle = Math.acos(minDot);
  // Cutoff is cos(angle + pi/2) = -sin(angle)
  const cutoff = -Math.sin(angle);

  return { apex, axis, cutoff, angle };
}

function distSq(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}
