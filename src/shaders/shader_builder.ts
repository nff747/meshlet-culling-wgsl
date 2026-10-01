import { generateMeshletCullingShader } from './meshlet_cull.wgsl';
import { generateMeshletRenderShader } from './meshlet_render.wgsl';

export class ShaderBuilder {
  public static getCullingShader(): string {
    return generateMeshletCullingShader();
  }

  public static getRenderShader(): string {
    return generateMeshletRenderShader();
  }
}
