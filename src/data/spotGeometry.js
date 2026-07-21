const EARTH_R = 6371000;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

export function haversineDistanceM(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
}

export function bearingBetween(a, b) {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function destinationPoint(start, bearingDeg, distanceM) {
  const δ = distanceM / EARTH_R;
  const θ = toRad(bearingDeg);
  const φ1 = toRad(start.lat);
  const λ1 = toRad(start.lng);

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    );

  return { lat: toDeg(φ2), lng: toDeg(λ2) };
}

function lerpPoint(a, b, t) {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

export const DEFAULT_SPOT_LENGTH_M = 5;
export const DEFAULT_AISLE_WIDTH_M = 6;

export function estimateRowCount(
  corners,
  spotLengthM = DEFAULT_SPOT_LENGTH_M,
  aisleWidthM = DEFAULT_AISLE_WIDTH_M,
) {
  const { TL, TR, BR, BL } = corners;
  const leftDepth = haversineDistanceM(TL, BL);
  const rightDepth = haversineDistanceM(TR, BR);
  const avgDepth = (leftDepth + rightDepth) / 2;

  const n = (avgDepth + aisleWidthM) / (spotLengthM + aisleWidthM);
  return Math.max(1, Math.floor(n));
}

function buildSpotPolygonGeo(center, widthBearing, widthM, lengthM) {
  const halfW = widthM / 2;
  const halfL = lengthM / 2;
  const depthBearing = (widthBearing + 90) % 360;

  const corner = (dw, dl) => {
    const p1 = destinationPoint(center, widthBearing, dw);
    return destinationPoint(p1, depthBearing, dl);
  };

  const c1 = corner(-halfW, -halfL);
  const c2 = corner(halfW, -halfL);
  const c3 = corner(halfW, halfL);
  const c4 = corner(-halfW, halfL);

  const ring = [c1, c2, c3, c4].map((p) => [p.lng, p.lat]);
  ring.push(ring[0]);
  return ring;
}

function computeRowSpotCenters(
  rowStart,
  rowEnd,
  spotWidthM,
  spotGapM,
  insetStartM = 0,
  insetEndM = 0,
) {
  const fullBearing = bearingBetween(rowStart, rowEnd);
  const trimmedStart = destinationPoint(rowStart, fullBearing, insetStartM);
  const trimmedEnd = destinationPoint(
    rowEnd,
    (fullBearing + 180) % 360,
    insetEndM,
  );

  const rowLength = haversineDistanceM(trimmedStart, trimmedEnd);
  const rowBearing = bearingBetween(trimmedStart, trimmedEnd);
  const pitch = spotWidthM + spotGapM;

  const spotCount = Math.max(0, Math.floor((rowLength + spotGapM) / pitch));
  const usedLength = spotCount * pitch - spotGapM;
  const margin = (rowLength - usedLength) / 2;

  const centers = [];
  for (let i = 0; i < spotCount; i++) {
    const distFromStart = margin + i * pitch + spotWidthM / 2;
    const center = destinationPoint(trimmedStart, rowBearing, distFromStart);
    centers.push({ center, bearing: rowBearing });
  }
  return centers;
}

export function generateSpotsFromQuad(
  parkingId,
  zoneLetter,
  corners,
  rowCount,
  options,
  generateFakeCar,
) {
  const {
    spotWidthM = 2.5,
    spotLengthM = DEFAULT_SPOT_LENGTH_M,
    spotGapM = 0.6,
    occupiedRatio = 0.4,
    reservedRatio = 0.1,
    typeForIndex = (i) =>
      i % 8 === 0 ? "disabled" : i % 5 === 0 ? "ev" : "regular",
    insetStartM = 0,
    insetEndM = 0,
    aisleWidthM = DEFAULT_AISLE_WIDTH_M,
    rowOverrides = [],
  } = options || {};

  const effectiveRowCount =
    rowCount && rowCount > 0
      ? rowCount
      : estimateRowCount(corners, spotLengthM, aisleWidthM);

  const { TL, TR, BR, BL } = corners;
  const leftDepthM = haversineDistanceM(TL, BL);
  const rightDepthM = haversineDistanceM(TR, BR);
  const avgDepthM = (leftDepthM + rightDepthM) / 2;

  const pitchDepthM = spotLengthM + aisleWidthM;

  const usedDepthM =
    effectiveRowCount * spotLengthM + (effectiveRowCount - 1) * aisleWidthM;
  const marginDepthM = Math.max(0, (avgDepthM - usedDepthM) / 2);

  const spots = [];
  let globalIndex = 0;

  for (let row = 0; row < effectiveRowCount; row++) {
    const distFromTop = marginDepthM + spotLengthM / 2 + row * pitchDepthM;
    const t =
      avgDepthM > 0 ? Math.min(1, Math.max(0, distFromTop / avgDepthM)) : 0.5;
    const rowStart = lerpPoint(TL, BL, t);
    const rowEnd = lerpPoint(TR, BR, t);

    const override = rowOverrides[row] || {};
    const rowInsetStartM =
      override.insetStartM !== undefined ? override.insetStartM : insetStartM;
    const rowInsetEndM =
      override.insetEndM !== undefined ? override.insetEndM : insetEndM;

    const rowCenters = computeRowSpotCenters(
      rowStart,
      rowEnd,
      spotWidthM,
      spotGapM,
      rowInsetStartM,
      rowInsetEndM,
    );

    rowCenters.forEach(({ center, bearing }) => {
      const polygon = buildSpotPolygonGeo(
        center,
        bearing,
        spotWidthM,
        spotLengthM,
      );

      const rand = Math.random();
      let status = "empty";
      if (rand < occupiedRatio) status = "occupied";
      else if (rand < occupiedRatio + reservedRatio) status = "reserved";

      spots.push({
        id: `${parkingId}-${zoneLetter}${globalIndex + 1}`,
        parkingId,
        zone: zoneLetter,
        label: `${zoneLetter}${globalIndex + 1}`,
        status,
        type: typeForIndex(globalIndex),
        center,
        polygon,
        car:
          status === "occupied" || status === "reserved"
            ? generateFakeCar()
            : null,
      });

      globalIndex++;
    });
  }

  return spots;
}
