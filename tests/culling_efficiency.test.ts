import { describe, it, expect } from 'vitest';
import {
  CullingEfficiency,
  estimateLodTransitionTriangles,
  estimateBandwidthSavings,
  estimateGpuComputeSpeedup,
} from '../src/analysis/culling_efficiency';

describe('CullingEfficiency', () => {
  it('computes accurate culling ratio percentage', () => {
    const stats = CullingEfficiency.calculate(100000, 25000);
    expect(stats.culledTriangles).toBe(75000);
    expect(stats.cullingRatio).toBeCloseTo(75.0, 1);
  });

  it('estimates LOD transition triangle counts correctly', () => {
    expect(estimateLodTransitionTriangles(1000, 0)).toBe(1000);
    expect(estimateLodTransitionTriangles(1000, 1)).toBe(500);
    expect(estimateLodTransitionTriangles(1000, 2)).toBe(250);
  });

  it('computes memory bandwidth savings accurately', () => {
    const savings = estimateBandwidthSavings(1000, 200, 32);
    expect(savings.rawVertexBytes).toBe(32000);
    expect(savings.renderedVertexBytes).toBe(6400);
    expect(savings.savedBytes).toBe(25600);
    expect(savings.savingRatio).toBeCloseTo(0.8, 4);

    const zeroVertices = estimateBandwidthSavings(0, 0);
    expect(zeroVertices.savingRatio).toBe(0);
  });

  it('evaluates theoretical GPU compute speedup factors', () => {
    // 1 million triangles, 80% culled
    const speedup = estimateGpuComputeSpeedup(1_000_000, 0.8);
    expect(speedup.unculledRasterMs).toBeCloseTo(4.0, 2);
    expect(speedup.culledRasterMs).toBeCloseTo(0.8, 2);
    expect(speedup.cullingOverheadMs).toBeGreaterThan(0);
    expect(speedup.speedupFactor).toBeGreaterThan(1.0);
  });
});

