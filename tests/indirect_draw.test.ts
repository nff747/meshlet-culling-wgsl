import { describe, it, expect } from 'vitest';
import { DrawIndexedIndirectArgs } from '../src/core/types';

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
  });
});
