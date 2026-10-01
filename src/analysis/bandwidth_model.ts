/**
 * Models vertex memory bandwidth savings of GPU-driven meshlet culling.
 */
export class BandwidthModel {
  public static calculateTraffic(
    numTriangles: number,
    bytesPerVertex: number = 32,
    cullingRate: number = 0.75
  ): { standardTrafficBytes: number; meshletTrafficBytes: number; bandwidthSavedBytes: number } {
    const verticesProcessed = numTriangles * 3;
    const standardTrafficBytes = verticesProcessed * bytesPerVertex;
    const meshletTrafficBytes = standardTrafficBytes * (1.0 - cullingRate);
    const bandwidthSavedBytes = standardTrafficBytes - meshletTrafficBytes;

    return { standardTrafficBytes, meshletTrafficBytes, bandwidthSavedBytes };
  }
}
