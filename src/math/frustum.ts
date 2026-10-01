import { BoundingSphere } from '../core/types';

/**
 * 6-Plane Camera Frustum extraction from View-Projection matrix.
 * Planes stored as: [nx, ny, nz, d] where nx*x + ny*y + nz*z + d >= 0 is inside.
 */
export class Frustum {
  public readonly planes: Float32Array = new Float32Array(24);

  public updateFromViewProjection(vp: Float32Array): void {
    // Left: row3 + row0
    this.setPlane(0, vp[3] + vp[0], vp[7] + vp[4], vp[11] + vp[8], vp[15] + vp[12]);
    // Right: row3 - row0
    this.setPlane(1, vp[3] - vp[0], vp[7] - vp[4], vp[11] - vp[8], vp[15] - vp[12]);
    // Bottom: row3 + row1
    this.setPlane(2, vp[3] + vp[1], vp[7] + vp[5], vp[11] + vp[9], vp[15] + vp[13]);
    // Top: row3 - row1
    this.setPlane(3, vp[3] - vp[1], vp[7] - vp[5], vp[11] - vp[9], vp[15] - vp[13]);
    // Near: row3 + row2
    this.setPlane(4, vp[3] + vp[2], vp[7] + vp[6], vp[11] + vp[10], vp[15] + vp[14]);
    // Far: row3 - row2
    this.setPlane(5, vp[3] - vp[2], vp[7] - vp[6], vp[11] - vp[10], vp[15] - vp[14]);
  }

  private setPlane(idx: number, nx: number, ny: number, nz: number, d: number): void {
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
    const offset = idx * 4;
    this.planes[offset] = nx / len;
    this.planes[offset + 1] = ny / len;
    this.planes[offset + 2] = nz / len;
    this.planes[offset + 3] = d / len;
  }

  /**
   * Tests if a bounding sphere intersects or is inside the frustum.
   */
  public intersectsSphere(sphere: BoundingSphere): boolean {
    const { center, radius } = sphere;
    for (let i = 0; i < 6; i++) {
      const offset = i * 4;
      const dist =
        this.planes[offset] * center.x +
        this.planes[offset + 1] * center.y +
        this.planes[offset + 2] * center.z +
        this.planes[offset + 3];

      if (dist < -radius) {
        return false; // Strictly outside this plane
      }
    }
    return true;
  }
}
