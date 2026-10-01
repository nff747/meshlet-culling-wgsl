/**
 * WGSL GPU Compute Shader: Parallel Meshlet Frustum & Normal Cone Culling.
 * Emits visible meshlet indices directly to an indirect draw argument buffer.
 */

export function generateMeshletCullingShader(): string {
  return `
struct CameraUniforms {
  view_proj: mat4x4<f32>,
  camera_pos: vec3<f32>,
  num_meshlets: u32,
  frustum_planes: array<vec4<f32>, 6>,
};

struct MeshletDescriptor {
  center_x: f32,
  center_y: f32,
  center_z: f32,
  radius: f32,
  cone_axis_x: f32,
  cone_axis_y: f32,
  cone_axis_z: f32,
  cone_cutoff: f32,
  vertex_offset: u32,
  vertex_count: u32,
  triangle_offset: u32,
  triangle_count: u32,
};

struct DrawIndirectArgs {
  index_count: atomic<u32>,
  instance_count: u32,
  first_index: u32,
  base_vertex: u32,
  first_instance: u32,
};

@group(0) @binding(0) var<uniform> camera: CameraUniforms;
@group(0) @binding(1) var<storage, read> meshlets: array<MeshletDescriptor>;
@group(0) @binding(2) var<storage, read_write> draw_args: DrawIndirectArgs;
@group(0) @binding(3) var<storage, read_write> visible_meshlet_indices: array<u32>;

@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let meshlet_idx = global_id.x;
  if (meshlet_idx >= camera.num_meshlets) {
    return;
  }

  let m = meshlets[meshlet_idx];
  let center = vec3<f32>(m.center_x, m.center_y, m.center_z);
  let radius = m.radius;

  // Early-exit bounds test\n  // 1. 6-Plane Frustum Culling
  for (var i = 0u; i < 6u; i++) {
    let plane = camera.frustum_planes[i];
    let dist = dot(plane.xyz, center) + plane.w;
    if (dist < -radius) {
      return; // Culled by frustum
    }
  }

  // 2. Normal Cone Backface Culling
  let view_dir = camera.camera_pos - center;
  let len = length(view_dir);
  if (len > 1e-5) {
    let norm_view = view_dir / len;
    let cone_axis = vec3<f32>(m.cone_axis_x, m.cone_axis_y, m.cone_axis_z);
    let dot_prod = dot(norm_view, cone_axis);
    if (dot_prod < m.cone_cutoff) {
      return; // Culled by normal cone
    }
  }

  // 3. Passed all tests: Append to visible list and atomically increment index count
  let slot = atomicAdd(&draw_args.index_count, m.triangle_count * 3u);
  let visible_idx = slot / (m.triangle_count * 3u);
  visible_meshlet_indices[visible_idx] = meshlet_idx;
}
`;
}
