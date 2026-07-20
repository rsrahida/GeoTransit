const PREFIX = "geotransit_";

export function seedIfEmpty(key, initialValue) {
  const existing = localStorage.getItem(PREFIX + key);

  if (existing === null) {
    localStorage.setItem(PREFIX + key, JSON.stringify(initialValue));
    return initialValue;
  }

  try {
    return JSON.parse(existing);
  } catch {
    localStorage.setItem(PREFIX + key, JSON.stringify(initialValue));
    return initialValue;
  }
}

export function readStorage(key, fallback = null) {
  const existing = localStorage.getItem(PREFIX + key);
  if (existing === null) return fallback;
  try {
    return JSON.parse(existing);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}
