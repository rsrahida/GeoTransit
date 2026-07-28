const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";

export async function fetchRouteGeometry(startCoord, endCoord) {
  const coordsString = `${startCoord.lon},${startCoord.lat};${endCoord.lon},${endCoord.lat}`;
  const cacheKey = `osrm_${coordsString}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const url = `${OSRM_BASE_URL}/${coordsString}?overview=full&geometries=geojson`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OSRM sorğusu uğursuz oldu: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("OSRM marşrut tapa bilmədi");
  }

  const result = {
    coordinates: data.routes[0].geometry.coordinates,
    distance: data.routes[0].distance,
    duration: data.routes[0].duration,
  };

  localStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}
