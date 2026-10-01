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

export function estimatePcieTransferTimeMs(bytes: number, busSpeedGbps: number = 32): number {
  const bytesPerMs = (busSpeedGbps * 1e9) / 8 / 1000;
  return bytes / bytesPerMs;
}
