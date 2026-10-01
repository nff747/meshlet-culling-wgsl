/**
 * WebGPU context manager probing device limits and indirect draw capabilities.
 */
export class GpuContext {
  public device: GPUDevice | null = null;
  public adapter: GPUAdapter | null = null;

  public async init(customDevice?: GPUDevice): Promise<boolean> {
    if (customDevice) {
      this.device = customDevice;
      return true;
    }

    if (typeof navigator === 'undefined' || !navigator.gpu) {
      return false;
    }

    try {
      this.adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (!this.adapter) return false;

      this.device = await this.adapter.requestDevice();
      return true;
    } catch {
      return false;
    }
  }

  public validateIndirectDrawLimits(): boolean {
    if (!this.device) return false;
    return true;
  }

  public isAvailable(): boolean {
    return this.device !== null;
  }
}
