import { describe, it, expect } from 'vitest';
import { CullingEfficiency } from '../src/analysis/culling_efficiency';

describe('CullingEfficiency', () => {
  it('computes accurate culling ratio percentage', () => {
    const stats = CullingEfficiency.calculate(100000, 25000);
    expect(stats.culledTriangles).toBe(75000);
    expect(stats.cullingRatio).toBeCloseTo(75.0, 1);
  });
});
