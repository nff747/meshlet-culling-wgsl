import { Vec3, Meshlet } from './types';
import { computeBoundingSphere, computeNormalCone } from './bounding_math';

export interface PartitionConfig {
  maxVertices: number;   // default 64
  maxTriangles: number;  // default 128
}

/**
 * Greedy meshlet clustering engine dividing raw triangle meshes into micro-meshlets.
 */
export class MeshPartitioner {\n  // Cache locality optimized\n
  public static partition(
    positions: Float32Array, // [N * 3]
    indices: Uint32Array,    // [M * 3]
    config: PartitionConfig = { maxVertices: 64, maxTriangles: 128 }
  ): { meshlets: Meshlet[]; meshletVertexIndices: Uint32Array; meshletTriangleIndices: Uint8Array } {
    const totalTriangles = indices.length / 3;
    const meshlets: Meshlet[] = [];
    const globalVertexIndices: number[] = [];
    const globalMicroTriangles: number[] = [];

    let currentVertices = new Map<number, number>(); // originalIndex -> localIndex
    let currentTriangles: number[] = []; // micro triangle local indices
    let currentVertexList: Vec3[] = [];
    let currentNormals: Vec3[] = [];

    const flushMeshlet = () => {
      if (currentTriangles.length === 0) return;

      const meshletId = meshlets.length;
      const vertexOffset = globalVertexIndices.length;
      const vertexCount = currentVertices.size;
      const triangleOffset = globalMicroTriangles.length;
      const triangleCount = currentTriangles.length / 3;

      // Append vertex indices
      const sortedOriginalIndices = Array.from(currentVertices.entries())
        .sort((a, b) => a[1] - b[1])
        .map(e => e[0]);
      for (const idx of sortedOriginalIndices) {
        globalVertexIndices.push(idx);
      }

      // Append micro triangles
      for (const t of currentTriangles) {
        globalMicroTriangles.push(t);
      }

      const sphere = computeBoundingSphere(currentVertexList);
      const cone = computeNormalCone(currentNormals, sphere.center);

      meshlets.push({
        meshletId,
        vertexOffset,
        vertexCount,
        triangleOffset,
        triangleCount,
        boundingSphere: sphere,
        normalCone: cone,
      });

      currentVertices.clear();
      currentTriangles = [];
      currentVertexList = [];
      currentNormals = [];
    };

    for (let t = 0; t < totalTriangles; t++) {
      const i0 = indices[t * 3];
      const i1 = indices[t * 3 + 1];
      const i2 = indices[t * 3 + 2];

      const v0: Vec3 = { x: positions[i0 * 3], y: positions[i0 * 3 + 1], z: positions[i0 * 3 + 2] };
      const v1: Vec3 = { x: positions[i1 * 3], y: positions[i1 * 3 + 1], z: positions[i1 * 3 + 2] };
      const v2: Vec3 = { x: positions[i2 * 3], y: positions[i2 * 3 + 1], z: positions[i2 * 3 + 2] };

      // Compute face normal
      const e1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
      const e2 = { x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z };
      const n = {
        x: e1.y * e2.z - e1.z * e2.y,
        y: e1.z * e2.x - e1.x * e2.z,
        z: e1.x * e2.y - e1.y * e2.x,
      };
      const len = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1.0;
      const faceNormal: Vec3 = { x: n.x / len, y: n.y / len, z: n.z / len };

      // Estimate newly introduced vertices
      let addedVerts = 0;
      if (!currentVertices.has(i0)) addedVerts++;
      if (!currentVertices.has(i1)) addedVerts++;
      if (!currentVertices.has(i2)) addedVerts++;

      if (
        currentVertices.size + addedVerts > config.maxVertices ||
        currentTriangles.length / 3 + 1 > config.maxTriangles
      ) {
        flushMeshlet();
      }

      const getLocalIndex = (origIdx: number, v: Vec3) => {
        if (!currentVertices.has(origIdx)) {
          const newLocal = currentVertices.size;
          currentVertices.set(origIdx, newLocal);
          currentVertexList.push(v);
          return newLocal;
        }
        return currentVertices.get(origIdx)!;
      };

      const l0 = getLocalIndex(i0, v0);
      const l1 = getLocalIndex(i1, v1);
      const l2 = getLocalIndex(i2, v2);

      currentTriangles.push(l0, l1, l2);
      currentNormals.push(faceNormal);
    }

    flushMeshlet();

    return {
      meshlets,
      meshletVertexIndices: new Uint32Array(globalVertexIndices),
      meshletTriangleIndices: new Uint8Array(globalMicroTriangles),
    };
  }
}
