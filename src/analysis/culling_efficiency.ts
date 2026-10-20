/**
 * Mathematical models for culling efficiency and triangle throughput reduction.
 */

export interface CullingStats {
  totalTriangles: number;
  renderedTriangles: number;
  culledTriangles: number;
  cullingRatio: number;
}

export class CullingEfficiency {
  public static calculate(total: number, rendered: number): CullingStats {
    const culled = Math.max(0, total - rendered);
    const ratio = total === 0 ? 0 : (culled / total) * 100;
    return {
      totalTriangles: total,
      renderedTriangles: rendered,
      culledTriangles: culled,
      cullingRatio: ratio,
    };
  }
}

export function estimateLodTransitionTriangles(baseTriangles: number, lodLevel: number): number {
  return Math.floor(baseTriangles / Math.pow(2, lodLevel));
}

export interface MemoryBandwidthSaving {
  rawVertexBytes: number;
  renderedVertexBytes: number;
  savedBytes: number;
  savingRatio: number;
}

/**
 * Computes memory bandwidth savings from culling vertices before rasterization.
 */
export function estimateBandwidthSavings(
  totalVertices: number,
  renderedVertices: number,
  vertexStrideBytes: number = 32
): MemoryBandwidthSaving {
  const safeRendered = Math.max(0, Math.min(totalVertices, renderedVertices));
  const rawBytes = totalVertices * vertexStrideBytes;
  const renderedBytes = safeRendered * vertexStrideBytes;
  const savedBytes = rawBytes - renderedBytes;
  const savingRatio = rawBytes === 0 ? 0 : savedBytes / rawBytes;

  return {
    rawVertexBytes: rawBytes,
    renderedVertexBytes: renderedBytes,
    savedBytes,
    savingRatio,
  };
}

export interface GpuComputeSpeedup {
  cullingOverheadMs: number;
  unculledRasterMs: number;
  culledRasterMs: number;
  effectiveTotalMs: number;
  speedupFactor: number;
}

/**
 * Estimates GPU frame compute speedup factor given triangle count and culling ratio.
 */
export function estimateGpuComputeSpeedup(
  totalTriangles: number,
  culledRatio: number,
  rasterCostPerMillionTrisMs: number = 4.0,
  cullingCostPerMillionMeshletsMs: number = 0.25,
  trianglesPerMeshlet: number = 128
): GpuComputeSpeedup {
  const safeCulledRatio = Math.max(0, Math.min(1.0, culledRatio));
  const totalMeshlets = Math.ceil(totalTriangles / trianglesPerMeshlet);

  const cullingOverheadMs = (totalMeshlets / 1_000_000) * cullingCostPerMillionMeshletsMs;
  const unculledRasterMs = (totalTriangles / 1_000_000) * rasterCostPerMillionTrisMs;
  const renderedTriangles = totalTriangles * (1.0 - safeCulledRatio);
  const culledRasterMs = (renderedTriangles / 1_000_000) * rasterCostPerMillionTrisMs;

  const effectiveTotalMs = cullingOverheadMs + culledRasterMs;
  const speedupFactor = effectiveTotalMs <= 0 ? 1.0 : unculledRasterMs / effectiveTotalMs;

  return {
    cullingOverheadMs,
    unculledRasterMs,
    culledRasterMs,
    effectiveTotalMs,
    speedupFactor,
  };
}

