import * as turf from "@turf/turf";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function getBoundingBox(coordinates, paddingDegrees = 0.01) {
  const lons = coordinates.map((c) => c[0]);
  const lats = coordinates.map((c) => c[1]);
  return {
    minLat: Math.min(...lats) - paddingDegrees,
    minLon: Math.min(...lons) - paddingDegrees,
    maxLat: Math.max(...lats) + paddingDegrees,
    maxLon: Math.max(...lons) + paddingDegrees,
  };
}

function dedupeStops(stops, minDistanceMeters = 25) {
  const result = [];
  for (const stop of stops) {
    const isDuplicate = result.some((existing) => {
      const dist = turf.distance(
        turf.point([stop.lon, stop.lat]),
        turf.point([existing.lon, existing.lat]),
        { units: "meters" },
      );
      return dist < minDistanceMeters;
    });
    if (!isDuplicate) result.push(stop);
  }
  return result;
}

export async function findBusStopsAlongRoute(
  routeCoordinates,
  corridorMeters = 40,
) {
  const cacheKey = `overpass_stops_v3_${routeCoordinates[0].join(",")}_${routeCoordinates[
    routeCoordinates.length - 1
  ].join(",")}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const bbox = getBoundingBox(routeCoordinates);
  const query = `
    [out:json][timeout:25];
    node["highway"="bus_stop"](${bbox.minLat},${bbox.minLon},${bbox.maxLat},${bbox.maxLon});
    out body;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" },
  });

  if (!response.ok) {
    throw new Error(`Overpass sorğusu uğursuz oldu: ${response.status}`);
  }

  const data = await response.json();

  const line = turf.lineString(routeCoordinates);
  const corridor = turf.buffer(line, corridorMeters, { units: "meters" });

  const stopsInCorridor = data.elements
    .filter((el) => {
      const point = turf.point([el.lon, el.lat]);
      return turf.booleanPointInPolygon(point, corridor);
    })
    .map((el) => {
      const originalPoint = turf.point([el.lon, el.lat]);
      const nearestOnLine = turf.nearestPointOnLine(line, originalPoint, {
        units: "kilometers",
      });

      return {
        id: `stop-${el.id}`,
        name: el.tags?.name || "Adsız dayanacaq",
        lon: nearestOnLine.geometry.coordinates[0],
        lat: nearestOnLine.geometry.coordinates[1],
        distanceAlongRoute: nearestOnLine.properties.location,
      };
    })
    .sort((a, b) => a.distanceAlongRoute - b.distanceAlongRoute);

  const finalStops = dedupeStops(stopsInCorridor, 25);

  localStorage.setItem(cacheKey, JSON.stringify(finalStops));
  return finalStops;
}
