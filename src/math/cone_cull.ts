import { Vec3, NormalCone } from '../core/types';

/**
 * Normal cone backface cluster culling test.
 * Returns true if the cluster is facing towards the camera (VISIBLE).
 * Returns false if ALL triangles in the cluster face away (CULLED).
 */
export function isClusterFacingCamera(cone: NormalCone, cameraPos: Vec3): boolean {
  // Vector from cluster apex to camera
  const viewDir: Vec3 = {
    x: cameraPos.x - cone.apex.x,
    y: cameraPos.y - cone.apex.y,
    z: cameraPos.z - cone.apex.z,
  };

  const len = Math.sqrt(viewDir.x * viewDir.x + viewDir.y * viewDir.y + viewDir.z * viewDir.z);
  if (len < 1e-6) return true; // Inside cluster apex

  // Fast inverse length
  const invLen = 1.0 / len;
  const nx = viewDir.x * invLen;
  const ny = viewDir.y * invLen;
  const nz = viewDir.z * invLen;

  // Dot product between normalized view vector and cone axis
  const dot = nx * cone.axis.x + ny * cone.axis.y + nz * cone.axis.z;

  // Cluster is visible if view vector makes an angle <= 90 deg + cone_angle
  // dot >= -sin(cone_angle) = cone.cutoff
  return dot >= cone.cutoff;
}

/**
 * Normal cone cluster culling test for orthographic projections or directional views.
 * @param cone The cluster's normal cone.
 * @param dirToCamera Normalized vector pointing towards the camera (opposite of forward view direction).
 * @returns true if cluster is facing towards the camera (VISIBLE), false if culled.
 */
export function isClusterFacingOrthoView(cone: NormalCone, dirToCamera: Vec3): boolean {
  const len = Math.sqrt(dirToCamera.x * dirToCamera.x + dirToCamera.y * dirToCamera.y + dirToCamera.z * dirToCamera.z);
  if (len < 1e-6) return true;

  const invLen = 1.0 / len;
  const nx = dirToCamera.x * invLen;
  const ny = dirToCamera.y * invLen;
  const nz = dirToCamera.z * invLen;

  const dot = nx * cone.axis.x + ny * cone.axis.y + nz * cone.axis.z;
  return dot >= cone.cutoff;
}

/**
 * Calculates the spherical cap solid angle subtended by the normal cone in steradians.
 * Solid angle = 2 * pi * (1 - cos(semi_angle)).
 * cutoff = -sin(semi_angle), so cos(semi_angle) = sqrt(1 - cutoff^2) when cutoff <= 0.
 */
export function computeConeSolidAngle(cone: NormalCone): number {
  if (cone.cutoff >= 1.0) return 4.0 * Math.PI;
  if (cone.cutoff <= -1.0) return 0.0;
  // cutoff = -sin(theta), so theta = asin(-cutoff)
  // solid angle = 2 * pi * (1 - cos(theta)) = 2 * pi * (1 - sqrt(1 - cutoff^2))
  const cosTheta = Math.sqrt(Math.max(0, 1.0 - cone.cutoff * cone.cutoff));
  return 2.0 * Math.PI * (1.0 - cosTheta);
}

