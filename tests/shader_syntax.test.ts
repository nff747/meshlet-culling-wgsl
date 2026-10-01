import { describe, it, expect } from 'vitest';
import { ShaderBuilder } from '../src/shaders/shader_builder';

describe('ShaderBuilder', () => {
  it('generates valid compute culling shader with atomic indirect args', () => {
    const wgsl = ShaderBuilder.getCullingShader();
    expect(wgsl).toContain('@compute @workgroup_size(64, 1, 1)');
    expect(wgsl).toContain('atomicAdd(&draw_args.index_count');
    expect(wgsl).toContain('frustum_planes');
    expect(wgsl).toContain('cone_cutoff');
  });

  it('generates valid rasterization render shader with vertex colors', () => {
    const wgsl = ShaderBuilder.getRenderShader();
    expect(wgsl).toContain('@vertex');
    expect(wgsl).toContain('@fragment');
    expect(wgsl).toContain('hash_color');
  });

  it('ensures atomic binding signatures exist in compute shader', () => {
    const wgsl = ShaderBuilder.getCullingShader();
    expect(wgsl).toContain('@group(0) @binding(2)');
    expect(wgsl).toContain('DrawIndirectArgs');
  });
});
