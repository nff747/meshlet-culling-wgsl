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
