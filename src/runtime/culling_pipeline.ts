import { Meshlet } from '../core/types';
import { ShaderBuilder } from '../shaders/shader_builder';

export class CullingPipeline {
  private computePipeline: GPUComputePipeline | null = null;

  constructor(public readonly device: GPUDevice) {
    this.initPipeline();
  }

  private initPipeline(): void {
    const wgsl = ShaderBuilder.getCullingShader();
    const module = this.device.createShaderModule({ code: wgsl });
    this.computePipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: { module, entryPoint: 'main' },
    });
  }

  public recordComputePass(
    commandEncoder: GPUCommandEncoder,
    uniformBuffer: GPUBuffer,
    descriptorBuffer: GPUBuffer,
    indirectArgsBuffer: GPUBuffer,
    visibleIndicesBuffer: GPUBuffer,
    numMeshlets: number
  ): void {
    if (!this.computePipeline) return;

    const bindGroup = this.device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: { buffer: descriptorBuffer } },
        { binding: 2, resource: { buffer: indirectArgsBuffer } },
        { binding: 3, resource: { buffer: visibleIndicesBuffer } },
      ],
    });

    const pass = commandEncoder.beginComputePass();
    pass.setPipeline(this.computePipeline);
    pass.setBindGroup(0, bindGroup);
    const workgroups = Math.ceil(numMeshlets / 64);
    pass.dispatchWorkgroups(workgroups);
    pass.end();
  }
}
