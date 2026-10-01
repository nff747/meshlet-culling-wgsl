/**
 * Core type definitions for Meshlet cluster geometry and GPU indirect dispatch.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface BoundingSphere {
  center: Vec3;
  radius: number;
}

export interface NormalCone {
  /** Apex of the bounding cone (origin in mesh local space). */
  apex: Vec3;
  /** Normalized orientation axis vector of the cone. */
  axis: Vec3;
  /** Cutoff value: cos(theta + pi/2) = -sin(theta). */
  cutoff: number;
  /** Half-angle of the cone in radians [0, pi]. */
  angle: number;
}

export interface Meshlet {
  meshletId: number;
  /** Offset into the global vertex index buffer. */
  vertexOffset: number;
  /** Number of vertices referenced by this meshlet (max 64). */
  vertexCount: number;
  /** Offset into the global micro-triangle index buffer. */
  triangleOffset: number;
  /** Number of triangles in this meshlet (max 128). */
  triangleCount: number;
  /** Minimal bounding sphere for frustum testing. */
  boundingSphere: BoundingSphere;
  /** Normal cone for backface cluster culling. */
  normalCone: NormalCone;
}

export interface DrawIndexedIndirectArgs {
  indexCount: number;
  instanceCount: number;
  firstIndex: number;
  baseVertex: number;
  firstInstance: number;
}

export interface FrustumPlanes {
  // 6 planes: [left, right, bottom, top, near, far] as [nx, ny, nz, d]
  planes: Float32Array; // 6 * 4 = 24 floats
}
