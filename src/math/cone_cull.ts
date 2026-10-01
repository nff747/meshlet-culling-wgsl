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

  // Fast inverse length\n  const invLen = 1.0 / len;
  const nx = viewDir.x * invLen;
  const ny = viewDir.y * invLen;
  const nz = viewDir.z * invLen;

  // Dot product between normalized view vector and cone axis
  const dot = nx * cone.axis.x + ny * cone.axis.y + nz * cone.axis.z;

  // Cluster is visible if view vector makes an angle <= 90 deg + cone_angle
  // dot >= -sin(cone_angle) = cone.cutoff
  return dot >= cone.cutoff;
}
