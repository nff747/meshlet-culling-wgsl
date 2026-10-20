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

import { DrawIndexedIndirectArgs } from '../core/types';

/** WebGPU DrawIndexedIndirect structure stride in bytes: 5 * 4 bytes = 20 bytes */
export const DRAW_INDEXED_INDIRECT_STRIDE_BYTES = 20;

/**
 * Validates the parameters of a DrawIndexedIndirectArgs struct.
 */
export function validateDrawIndexedIndirectArgs(
  args: DrawIndexedIndirectArgs,
  maxIndexCount?: number,
  maxInstances?: number
): boolean {
  if (!Number.isInteger(args.indexCount) || args.indexCount < 0) return false;
  if (!Number.isInteger(args.instanceCount) || args.instanceCount < 0) return false;
  if (!Number.isInteger(args.firstIndex) || args.firstIndex < 0) return false;
  if (!Number.isInteger(args.baseVertex) || args.baseVertex < 0) return false;
  if (!Number.isInteger(args.firstInstance) || args.firstInstance < 0) return false;

  if (maxIndexCount !== undefined && args.indexCount > maxIndexCount) return false;
  if (maxInstances !== undefined && args.instanceCount > maxInstances) return false;

  return true;
}

/**
 * Clamps the instance count of an indirect draw command to a safe ceiling.
 */
export function clampIndirectInstanceCount(
  args: DrawIndexedIndirectArgs,
  maxInstances: number
): DrawIndexedIndirectArgs {
  return {
    ...args,
    instanceCount: Math.max(0, Math.min(args.instanceCount, maxInstances))
  };
}

/**
 * Packs multiple DrawIndexedIndirectArgs commands into a consecutive Uint32Array.
 */
export function packDrawIndexedIndirectArgs(commands: DrawIndexedIndirectArgs[]): Uint32Array {
  const u32 = new Uint32Array(commands.length * 5);
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    const offset = i * 5;
    u32[offset + 0] = cmd.indexCount;
    u32[offset + 1] = cmd.instanceCount;
    u32[offset + 2] = cmd.firstIndex;
    u32[offset + 3] = cmd.baseVertex;
    u32[offset + 4] = cmd.firstInstance;
  }
  return u32;
}

/**
 * Unpacks a DrawIndexedIndirectArgs struct from a Uint32Array at the given command index.
 */
export function unpackDrawIndexedIndirectArgs(
  u32: Uint32Array,
  commandIndex: number = 0
): DrawIndexedIndirectArgs {
  const offset = commandIndex * 5;
  if (offset + 5 > u32.length) {
    throw new RangeError(`Buffer length ${u32.length} insufficient for command at index ${commandIndex}`);
  }
  return {
    indexCount: u32[offset + 0],
    instanceCount: u32[offset + 1],
    firstIndex: u32[offset + 2],
    baseVertex: u32[offset + 3],
    firstInstance: u32[offset + 4],
  };
}

