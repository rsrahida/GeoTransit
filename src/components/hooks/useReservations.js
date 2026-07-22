import { useState, useCallback } from "react";
import { reservations as mockReservations } from "../../data/mockData";
import { readStorage, writeStorage } from "../../services/storage";

const KEY = "reservations";

function readExisting() {
  const data = readStorage(KEY, []);
  return Array.isArray(data) ? data : [];
}

function persist(list) {
  writeStorage(KEY, list);
}

function mergeWithMock(existing) {
  const existingIds = new Set(existing.map((r) => r.id));
  const missingMock = mockReservations.filter((r) => !existingIds.has(r.id));
  return [...existing, ...missingMock];
}

export function useReservations() {
  const [reservations, setReservations] = useState(() => {
    const merged = mergeWithMock(readExisting());
    persist(merged);
    return merged;
  });

  const addReservation = useCallback((reservation) => {
    setReservations((prev) => {
      const updated = [...prev, reservation];
      persist(updated);
      return updated;
    });
  }, []);

  const stopReservation = useCallback((id, pricePerHour) => {
    setReservations((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== id) return r;

        const start = new Date(r.startTime);
        const end = new Date();
        const rawMs = end.getTime() - start.getTime();
        const billedMs = Math.max(60000, Math.ceil(rawMs / 60000) * 60000);
        const billedHours = billedMs / 3600000;

        const totalPrice = Math.round(billedHours * pricePerHour * 100) / 100;

        return {
          ...r,
          endTime: end.toISOString(),
          status: "completed",
          totalPrice,
        };
      });
      persist(updated);
      return updated;
    });
  }, []);

  return { reservations, addReservation, stopReservation };
}
