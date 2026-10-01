import { Meshlet, DrawIndexedIndirectArgs } from '../core/types';
import { Frustum } from './frustum';
import { isClusterFacingCamera } from './cone_cull';
import { Vec3 } from '../core/types';

export interface CullingResults {
  visibleMeshletIds: number[];
  frustumCulledCount: number;
  coneCulledCount: number;
  totalVisibleTriangles: number;
  indirectArgs: DrawIndexedIndirectArgs;
}

export class CpuCullingPipeline {
  public static execute(
    meshlets: Meshlet[],
    frustum: Frustum,
    cameraPos: Vec3
  ): CullingResults {
    const visibleMeshletIds: number[] = [];
    let frustumCulledCount = 0;
    let coneCulledCount = 0;
    let totalVisibleTriangles = 0;

    for (const m of meshlets) {
      // 1. Frustum test
      if (!frustum.intersectsSphere(m.boundingSphere)) {
        frustumCulledCount++;
        continue;
      }

      // 2. Cone test
      if (!isClusterFacingCamera(m.normalCone, cameraPos)) {
        coneCulledCount++;
        continue;
      }

      visibleMeshletIds.push(m.meshletId);
      totalVisibleTriangles += m.triangleCount;
    }

    const indirectArgs: DrawIndexedIndirectArgs = {
      indexCount: totalVisibleTriangles * 3,
      instanceCount: 1,
      firstIndex: 0,
      baseVertex: 0,
      firstInstance: 0,
    };

    return {
      visibleMeshletIds,
      frustumCulledCount,
      coneCulledCount,
      totalVisibleTriangles,
      indirectArgs,
    };
  }
}
