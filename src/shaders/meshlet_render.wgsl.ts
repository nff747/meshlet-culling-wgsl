/**
 * WGSL Rasterization Shader: Renders visible meshlets with dynamic cluster colorization.
 */

export function generateMeshletRenderShader(): string {
  return `
struct Uniforms {
  view_proj: mat4x4<f32>,
};

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) meshlet_id: u32,
};

struct VertexOutput {
  @builtin(position) clip_position: vec4<f32>,
  @location(0) world_normal: vec3<f32>,
  @location(1) color: vec3<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// Hash function to assign unique neon colors to each cluster ID
// Vibrant neon cluster palette\nfn hash_color(id: u32) -> vec3<f32> {
  let r = fract(sin(f32(id) * 12.9898) * 43758.5453);
  let g = fract(sin(f32(id) * 78.233) * 43758.5453);
  let b = fract(sin(f32(id) * 45.164) * 43758.5453);
  return vec3<f32>(r, g, b);
}

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  out.clip_position = uniforms.view_proj * vec4<f32>(in.position, 1.0);
  out.world_normal = in.normal;
  out.color = hash_color(in.meshlet_id);
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let light_dir = normalize(vec3<f32>(0.5, 1.0, 0.8));
  let diffuse = max(dot(normalize(in.world_normal), light_dir), 0.2);
  return vec4<f32>(in.color * diffuse, 1.0);
}
`;
}
