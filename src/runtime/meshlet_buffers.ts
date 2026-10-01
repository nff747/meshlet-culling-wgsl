import { Meshlet } from '../core/types';

/**
 * Packs meshlet descriptors into GPU storage buffers.
 */
export class MeshletBuffers {
  public static packDescriptors(meshlets: Meshlet[]): Float32Array {
    // 12 floats per meshlet descriptor (48 bytes)
    const buffer = new Float32Array(meshlets.length * 12);
    const u32View = new Uint32Array(buffer.buffer);

    for (let i = 0; i < meshlets.length; i++) {
      const m = meshlets[i];
      const offset = i * 12;

      buffer[offset + 0] = m.boundingSphere.center.x;
      buffer[offset + 1] = m.boundingSphere.center.y;
      buffer[offset + 2] = m.boundingSphere.center.z;
      buffer[offset + 3] = m.boundingSphere.radius;

      buffer[offset + 4] = m.normalCone.axis.x;
      buffer[offset + 5] = m.normalCone.axis.y;
      buffer[offset + 6] = m.normalCone.axis.z;
      buffer[offset + 7] = m.normalCone.cutoff;

      u32View[offset + 8] = m.vertexOffset;
      u32View[offset + 9] = m.vertexCount;
      u32View[offset + 10] = m.triangleOffset;
      u32View[offset + 11] = m.triangleCount;
    }

    return buffer;
  }
}

export function createStagingReadbackBuffer(device: GPUDevice, size: number): GPUBuffer {
  return device.createBuffer({
    label: 'meshlet_staging_readback',
    size,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
}
