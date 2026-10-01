import { MeshPartitioner } from '../src/core/mesh_partitioner';
import { CpuCullingPipeline } from '../src/math/cpu_culling_pipeline';
import { Frustum } from '../src/math/frustum';

console.log('⚡ Meshlet Culling WebGPU Visualizer Initialized');

let autoRotate = true;
document.getElementById('btn-toggle-camera')?.addEventListener('click', () => {
  autoRotate = !autoRotate;
});
