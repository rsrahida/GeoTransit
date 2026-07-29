export function dedupeStopsByName(stops) {
  const seen = new Set();
  return stops.filter((stop) => {
    const key = stop.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
