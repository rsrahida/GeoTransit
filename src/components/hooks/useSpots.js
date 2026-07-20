import { useState, useEffect, useCallback } from "react";
import { parkingSpots } from "../../data/mockData";
import { seedIfEmpty, writeStorage } from "../../services/storage";

export function useSpots(parkingId) {
  const storageKey = `spots_${parkingId}`;
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    if (!parkingId) return;
    const initial = parkingSpots[parkingId] || [];
    const loaded = seedIfEmpty(storageKey, initial);
    setSpots(loaded);
  }, [parkingId, storageKey]);

  const updateSpotStatus = useCallback(
    (spotId, status, car = null) => {
      setSpots((prev) => {
        const updated = prev.map((s) =>
          s.id === spotId ? { ...s, status, car } : s,
        );
        writeStorage(storageKey, updated);
        return updated;
      });
    },
    [storageKey],
  );

  return { spots, updateSpotStatus };
}
