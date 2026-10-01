# ⚡ meshlet-culling-wgsl

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()
[![WebGPU](https://img.shields.io/badge/WebGPU-WGSL-blue.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, GPU-driven **Meshlet Clustering, Frustum Culling, Normal Cone Filtering, and Indirect Multi-Draw** engine implemented in WebGPU and WGSL.

Inspired by modern next-generation geometry architectures (*Unreal Engine 5 Nanite, Frostbite*), `meshlet-culling-wgsl` partitions complex 3D meshes into micro-clusters (max 64 vertices, 128 triangles) and executes parallel bounding-sphere and normal-cone culling directly inside GPU compute shaders.

---

## 🎯 Architectural Highlights

- **Micro-Cluster Partitioning**: Greedy graph partitioning ensuring all clusters fit within high-speed GPU workgroup shared memory (`var<workgroup>`).
- **Parallel 6-Plane Frustum Culling**: Evaluates tight bounding spheres against camera frustum planes in a single compute pass.
- **Normal Cone Backface Filtering**: Rejects entire clusters facing away from the camera ($(\vec{p} - \vec{c}) \cdot \vec{n} > \sin(\theta)$) before vertex submission.
- **Indirect GPU Dispatch (`drawIndexedIndirect`)**: Emits visible triangle counts directly to an indirect command buffer via `atomicAdd`, achieving **zero CPU-GPU roundtrips**.
- **Bit-Exact CPU Reference Validator**: Complete parity engine verifying mathematical correctness against ground truth.

---

## 🚀 Quick Start

```typescript
import { MeshPartitioner, Frustum, CpuCullingPipeline } from 'meshlet-culling-wgsl';

// 1. Partition mesh into micro-clusters
const { meshlets } = MeshPartitioner.partition(positions, indices, {
  maxVertices: 64,
  maxTriangles: 128,
});

// 2. Extract camera frustum
const frustum = new Frustum();
frustum.updateFromViewProjection(cameraViewProjMatrix);

// 3. Execute culling pipeline
const results = CpuCullingPipeline.execute(meshlets, frustum, cameraPosition);
console.log(`Rendered ${results.totalVisibleTriangles} triangles (${results.frustumCulledCount} culled).`);
```

---

## 📄 License

MIT © [nff747](https://github.com/nff747)
