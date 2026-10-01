import { MeshPartitioner } from '../src/core/mesh_partitioner';
import { CpuCullingPipeline } from '../src/math/cpu_culling_pipeline';
import { Frustum } from '../src/math/frustum';
import { CullingEfficiency } from '../src/analysis/culling_efficiency';

function runBenchmark() {
  console.log('========================================================================');
  console.log('⚡ Meshlet Culling WebGPU Performance & Bandwidth Benchmark Suite');
  console.log('========================================================================\n');

  // Generate synthetic high-density mesh (100k triangles)
  const gridSize = 224; // 224*224 quads = 100,352 triangles
  const positions: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= gridSize; y++) {
    for (let x = 0; x <= gridSize; x++) {
      positions.push(x - gridSize / 2, y - gridSize / 2, Math.sin(x * 0.1) * 5.0);
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

  const t0 = performance.now();
  const { meshlets } = MeshPartitioner.partition(
    new Float32Array(positions),
    new Uint32Array(indices),
    { maxVertices: 64, maxTriangles: 128 }
  );
  const partitionDuration = (performance.now() - t0).toFixed(2);

  console.log(`Generated ${meshlets.length} meshlets from ${indices.length / 3} triangles in ${partitionDuration} ms.`);

  const frustum = new Frustum();
  // Standard perspective camera looking from +Z
  frustum.updateFromViewProjection(new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, -10, 1,
  ]));

  const culling = CpuCullingPipeline.execute(meshlets, frustum, { x: 0, y: 0, z: 150 });
  const stats = CullingEfficiency.calculate(indices.length / 3, culling.totalVisibleTriangles);

  console.log('\n--- Culling Results ---');
  console.log(`  Total Meshlets:        ${meshlets.length}`);
  console.log(`  Visible Meshlets:      ${culling.visibleMeshletIds.length}`);
  console.log(`  Frustum Culled:        ${culling.frustumCulledCount}`);
  console.log(`  Normal Cone Culled:    ${culling.coneCulledCount}`);
  console.log(`  Culling Ratio:         ${stats.cullingRatio.toFixed(1)}% reduction in GPU vertex work!\n`);
}

runBenchmark();
