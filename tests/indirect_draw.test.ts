import { describe, it, expect } from 'vitest';
import { DrawIndexedIndirectArgs } from '../src/core/types';
import {
  DRAW_INDEXED_INDIRECT_STRIDE_BYTES,
  validateDrawIndexedIndirectArgs,
  clampIndirectInstanceCount,
  packDrawIndexedIndirectArgs,
  unpackDrawIndexedIndirectArgs,
} from '../src/runtime/meshlet_buffers';

describe('DrawIndexedIndirectArgs', () => {
  it('correctly maps indirect draw arguments', () => {
    const args: DrawIndexedIndirectArgs = {
      indexCount: 384,
      instanceCount: 1,
      firstIndex: 0,
      baseVertex: 0,
      firstInstance: 0,
    };
    expect(args.indexCount).toBe(384);
    expect(args.instanceCount).toBe(1);
    expect(DRAW_INDEXED_INDIRECT_STRIDE_BYTES).toBe(20);
  });

  it('validates indirect draw arguments against constraints', () => {
    const valid: DrawIndexedIndirectArgs = {
      indexCount: 128,
      instanceCount: 1,
      firstIndex: 0,
      baseVertex: 0,
      firstInstance: 0,
    };
    expect(validateDrawIndexedIndirectArgs(valid)).toBe(true);
    expect(validateDrawIndexedIndirectArgs(valid, 256, 1)).toBe(true);

    // Negative counts
    expect(validateDrawIndexedIndirectArgs({ ...valid, indexCount: -1 })).toBe(false);
    expect(validateDrawIndexedIndirectArgs({ ...valid, instanceCount: -1 })).toBe(false);

    // Non-integers
    expect(validateDrawIndexedIndirectArgs({ ...valid, indexCount: 12.5 })).toBe(false);

    // Exceeding ceiling limits
    expect(validateDrawIndexedIndirectArgs(valid, 64, 1)).toBe(false);
    expect(validateDrawIndexedIndirectArgs(valid, 256, 0)).toBe(false);
  });

  it('clamps instance counts correctly', () => {
    const args: DrawIndexedIndirectArgs = {
      indexCount: 64,
      instanceCount: 10,
      firstIndex: 0,
      baseVertex: 0,
      firstInstance: 0,
    };

    const clamped = clampIndirectInstanceCount(args, 1);
    expect(clamped.instanceCount).toBe(1);
    expect(clamped.indexCount).toBe(64);
  });

  it('packs and unpacks indirect command arrays', () => {
    const commands: DrawIndexedIndirectArgs[] = [
      { indexCount: 100, instanceCount: 1, firstIndex: 0, baseVertex: 0, firstInstance: 0 },
      { indexCount: 200, instanceCount: 2, firstIndex: 100, baseVertex: 50, firstInstance: 1 },
    ];

    const packed = packDrawIndexedIndirectArgs(commands);
    expect(packed.length).toBe(10); // 2 commands * 5 u32s

    const cmd0 = unpackDrawIndexedIndirectArgs(packed, 0);
    expect(cmd0).toEqual(commands[0]);

    const cmd1 = unpackDrawIndexedIndirectArgs(packed, 1);
    expect(cmd1).toEqual(commands[1]);

    expect(() => unpackDrawIndexedIndirectArgs(packed, 2)).toThrow(RangeError);
  });
});

