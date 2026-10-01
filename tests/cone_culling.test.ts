import { describe, it, expect } from 'vitest';
import { isClusterFacingCamera } from '../src/math/cone_cull';
import { NormalCone, Vec3 } from '../src/core/types';

describe('Normal Cone Backface Culling', () => {
  it('accepts clusters facing the camera and culls clusters facing away', () => {
    const apex: Vec3 = { x: 0, y: 0, z: 0 };
    // Cluster facing purely +Z
    const cone: NormalCone = {
      apex,
      axis: { x: 0, y: 0, z: 1 },
      angle: 0.1, // ~5.7 degrees tight cone
      cutoff: -Math.sin(0.1),
    };

    // Camera in front at +Z looking back -> visible
    expect(isClusterFacingCamera(cone, { x: 0, y: 0, z: 10 })).toBe(true);

    // Camera behind at -Z -> culled
    expect(isClusterFacingCamera(cone, { x: 0, y: 0, z: -10 })).toBe(false);
  });
});
