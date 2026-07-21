import { useState, useEffect, useCallback } from "react";
import { reservations as mockReservations } from "../../data/mockData";
import { seedIfEmpty, writeStorage } from "../../services/storage";

const KEY = "reservations";

export function useReservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const loaded = seedIfEmpty(KEY, mockReservations);
    setReservations(loaded);
  }, []);

  const addReservation = useCallback((reservation) => {
    setReservations((prev) => {
      const updated = [...prev, reservation];
      writeStorage(KEY, updated);
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
      writeStorage(KEY, updated);
      return updated;
    });
  }, []);

  return { reservations, addReservation, stopReservation };
}
