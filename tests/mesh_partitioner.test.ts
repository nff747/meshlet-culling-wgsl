import { describe, it, expect } from 'vitest';
import { MeshPartitioner } from '../src/core/mesh_partitioner';

describe('MeshPartitioner', () => {
  it('enforces maximum 64 vertices and 128 triangles per meshlet', () => {
    // Generate a grid mesh of 10x10 quads (200 triangles)
    const gridSize = 10;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let y = 0; y <= gridSize; y++) {
      for (let x = 0; x <= gridSize; x++) {
        positions.push(x, y, 0);
      }
    }

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const i0 = y * (gridSize + 1) + x;
        const i1 = i0 + 1;
        const i2 = (y + 1) * (gridSize + 1) + x;
        const i3 = i2 + 1;
        indices.push(i0, i2, i1);
        indices.push(i1, i2, i3);
      }
    }

    const { meshlets, meshletTriangleIndices } = MeshPartitioner.partition(
      new Float32Array(positions),
      new Uint32Array(indices),
      { maxVertices: 64, maxTriangles: 128 }
    );

    expect(meshlets.length).toBeGreaterThan(1);
    for (const m of meshlets) {
      expect(m.vertexCount).toBeLessThanOrEqual(64);
      expect(m.triangleCount).toBeLessThanOrEqual(128);
    }

    // Verify all 200 triangles are preserved
    expect(meshletTriangleIndices.length / 3).toBe(200);
  });
});
